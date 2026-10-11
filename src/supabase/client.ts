import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const DEFAULT_SUPABASE_URL = 'https://cfhqwgftgbxfdavwxsup.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_2rcaNnCgB4wulUJ4OWA-Wg_HNuIHq74';

/**
 * Normalizes and sanitizes a Supabase Project URL to strictly origin format:
 * e.g., 'https://cfhqwgftgbxfdavwxsup.supabase.co'
 *
 * Removes:
 * - Trailing slashes
 * - Subpaths like '/rest/v1', '/rest/v1/', '/auth/v1', '/project/...'
 * - Query strings and hashes
 * - Surrounding quotes or inadvertent whitespace
 * 
 * This directly prevents PostgREST PGRST125 ("Invalid path specified in request URL")
 * errors caused by double path segments (e.g. /rest/v1/auth/v1/token).
 */
export const sanitizeSupabaseUrl = (input?: string | null): string => {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim().replace(/^["']|["']$/g, '');
  if (!str) return '';

  // If protocol missing, default to https://
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = `https://${str}`;
  }

  try {
    const urlObj = new URL(str);
    // Return origin only (protocol + domain + optional port, NO trailing slash or path)
    return urlObj.origin.replace(/\/+$/, '');
  } catch {
    // Fallback regex cleanup
    return str
      .replace(/\/rest\/v1.*$/i, '')
      .replace(/\/auth\/v1.*$/i, '')
      .replace(/\/+$/, '');
  }
};

export const getSupabaseConfig = (): SupabaseConfig | null => {
  // 1. Check legacy and current saved credentials in localStorage
  try {
    // Check legacy key if present and migrate
    const legacyRaw = localStorage.getItem('homemate_custom_supabase_config');
    if (legacyRaw) {
      try {
        const parsedLegacy = JSON.parse(legacyRaw);
        if (parsedLegacy?.url) {
          const healedUrl = sanitizeSupabaseUrl(parsedLegacy.url);
          const healedKey = (parsedLegacy.anonKey || DEFAULT_SUPABASE_ANON_KEY).trim();
          localStorage.setItem(
            'homemaid_custom_supabase_config',
            JSON.stringify({ url: healedUrl, anonKey: healedKey })
          );
        }
      } catch (e) {
        // ignore legacy parse error
      }
      localStorage.removeItem('homemate_custom_supabase_config');
    }

    // Check active custom config in localStorage
    const raw = localStorage.getItem('homemaid_custom_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate if user was previously pointed at prior project
      const isOldProject = parsed.url && (parsed.url.includes('roanjyihuyvgabcsdiox') || parsed.url.includes('your-project'));
      const rawUrl = (!isOldProject && parsed.url && typeof parsed.url === 'string') 
        ? parsed.url 
        : DEFAULT_SUPABASE_URL;
      const cleanUrl = sanitizeSupabaseUrl(rawUrl);
      const cleanKey = (!isOldProject && parsed.anonKey && typeof parsed.anonKey === 'string' && parsed.anonKey.trim())
        ? parsed.anonKey.trim()
        : DEFAULT_SUPABASE_ANON_KEY;

      if (cleanUrl && cleanKey) {
        // Auto-heal localStorage if the saved URL was old project or contained extra paths
        if (parsed.url !== cleanUrl || parsed.anonKey !== cleanKey) {
          localStorage.setItem(
            'homemaid_custom_supabase_config',
            JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
          );
        }
        return {
          url: cleanUrl,
          anonKey: cleanKey,
        };
      }
    }
  } catch (e) {
    console.error('Error reading custom supabase config', e);
  }

  // 2. Check Vite environment variables or defaults
  let rawEnvUrl = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).trim();

  // If environment variable has the old project or is malformed, upgrade to current project
  if (rawEnvUrl.includes('roanjyihuyvgabcsdiox') || !rawEnvUrl) {
    rawEnvUrl = DEFAULT_SUPABASE_URL;
  }

  const cleanEnvUrl = sanitizeSupabaseUrl(rawEnvUrl);
  const cleanEnvKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  ).trim();

  if (cleanEnvUrl && cleanEnvKey && !cleanEnvKey.includes('your-anon')) {
    return {
      url: cleanEnvUrl,
      anonKey: cleanEnvKey,
    };
  }

  return null;
};

const config = getSupabaseConfig();

export const supabase: SupabaseClient | null = config
  ? createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabase);
};

export const saveCustomSupabaseConfig = (cfg: SupabaseConfig) => {
  const sanitized: SupabaseConfig = {
    url: sanitizeSupabaseUrl(cfg.url),
    anonKey: cfg.anonKey.trim(),
  };
  localStorage.setItem('homemaid_custom_supabase_config', JSON.stringify(sanitized));
  window.location.reload();
};

export const clearCustomSupabaseConfig = () => {
  localStorage.removeItem('homemaid_custom_supabase_config');
  localStorage.removeItem('homemate_custom_supabase_config');
  window.location.reload();
};

export const testSupabaseConnection = async (
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string }> => {
  let clientToTest = supabase;

  if (customUrl && customKey) {
    const cleanUrl = sanitizeSupabaseUrl(customUrl);
    clientToTest = createClient(cleanUrl, customKey.trim());
  }

  if (!clientToTest) {
    return {
      success: false,
      message: 'Supabase client is not initialized. Please provide Project URL and Anon/Publishable Key.',
    };
  }

  try {
    const { error } = await clientToTest.auth.getSession();
    if (error) {
      if (error.message?.toLowerCase().includes('invalid api key')) {
        return {
          success: false,
          message: 'Invalid API key: The key does not belong to this Supabase Project URL. Verify that both the URL and Key come from the same project (cfhqwgftgbxfdavwxsup).',
        };
      }
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase Auth API!',
    };
  } catch (err: any) {
    const msg = err?.message || 'Failed to connect to Supabase.';
    if (msg.toLowerCase().includes('invalid api key')) {
      return {
        success: false,
        message: 'Invalid API key: The key does not belong to this Supabase Project URL. Verify that both the URL and Key come from the same project (cfhqwgftgbxfdavwxsup).',
      };
    }
    return {
      success: false,
      message: msg,
    };
  }
};
