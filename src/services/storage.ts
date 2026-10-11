import {
  Booking,
  ServiceDefinition,
  LaundryRate,
  PriceSettings,
  Maid,
  MaidApplication,
  AppSettings,
  AppUser,
} from '../types';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export const INITIAL_SERVICES: ServiceDefinition[] = [
  {
    id: 'laundry',
    name: 'Laundry Pickup & Delivery',
    tagline: 'Home Pickup → Cleaning at Homemaid → Home Delivery',
    description: 'Expert doorstep wash, steam press, and dry cleaning for daily wear, coats, and heavy bedding.',
    colorName: 'purple',
    bgClass: 'bg-purple-50 hover:bg-purple-100/70',
    borderClass: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-700',
    textClass: 'text-purple-900',
    accentClass: 'bg-purple-600',
    iconName: 'Shirt',
    isActive: true,
    basePriceDescription: 'From ₹40 / item',
  },
  {
    id: 'house_cleaning',
    name: 'House Cleaning',
    tagline: 'Spotless rooms, sanitized floors & sparkling bathrooms',
    description: 'Choose simple brooming & dusting or intensive deep scrubbing customized to your room and bathroom count.',
    colorName: 'green',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/70',
    borderClass: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    textClass: 'text-emerald-900',
    accentClass: 'bg-emerald-600',
    iconName: 'Sparkles',
    isActive: true,
    basePriceDescription: 'From ₹250 / room',
  },
  {
    id: 'baby_sitting',
    name: 'Baby Sitting',
    tagline: 'Caring, patient, and verified nanny care for your little ones',
    description: 'Trained, police-verified babysitters providing engaging and safe childcare at your home.',
    colorName: 'pink',
    bgClass: 'bg-rose-50 hover:bg-rose-100/70',
    borderClass: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-700',
    textClass: 'text-rose-900',
    accentClass: 'bg-rose-600',
    iconName: 'HeartHandshake',
    isActive: true,
    basePriceDescription: '₹250 / baby / hr',
  },
  {
    id: 'elderly_care',
    name: 'Elderly Care',
    tagline: 'Compassionate assistance & dignified companionship for elders',
    description: 'Dedicated caregivers for mobility support, medication reminders, hygiene care, and warm conversation.',
    colorName: 'blue',
    bgClass: 'bg-blue-50 hover:bg-blue-100/70',
    borderClass: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-700',
    textClass: 'text-blue-900',
    accentClass: 'bg-blue-600',
    iconName: 'UserCheck',
    isActive: true,
    basePriceDescription: '₹300 / elder / hr',
  },
  {
    id: 'water_tank',
    name: 'Water Tank Cleaning',
    tagline: 'Deep sludge removal, mechanical scrubbing & UV sanitization',
    description: 'Professional high-pressure sludge removal and antibacterial treatment for overhead and underground tanks.',
    colorName: 'cyan',
    bgClass: 'bg-cyan-50 hover:bg-cyan-100/70',
    borderClass: 'border-cyan-200',
    badgeBg: 'bg-cyan-100 text-cyan-700',
    textClass: 'text-cyan-900',
    accentClass: 'bg-cyan-600',
    iconName: 'Droplets',
    isActive: true,
    basePriceDescription: '₹600 / 1,000L / tank',
  },
];

export const INITIAL_LAUNDRY_ITEMS: LaundryRate[] = [
  { id: 'tshirt', name: 'T-Shirt', price: 40, category: 'daily' },
  { id: 'pants', name: 'Pants', price: 40, category: 'daily' },
  { id: 'heavy_blanket', name: 'Heavy Blanket', price: 600, category: 'heavy' },
  { id: 'blazer', name: 'Blazer', price: 450, category: 'delicate' },
  { id: 'long_coat', name: 'Long Coat', price: 600, category: 'delicate' },
  { id: 'sweatshirt', name: 'Sweatshirt', price: 350, category: 'daily' },
  { id: 'jacket', name: 'Jacket', price: 400, category: 'delicate' },
  { id: 'small_blanket', name: 'Small Blanket', price: 300, category: 'heavy' },
];

export const INITIAL_PRICES: PriceSettings = {
  laundry: INITIAL_LAUNDRY_ITEMS,
  houseCleaning: {
    simplePerRoom: 250,
    deepPerRoom: 400,
    bathroomPerUnit: 400,
  },
  babySitting: {
    perBabyPerHour: 250,
  },
  elderlyCare: {
    perElderPerHour: 300,
  },
  waterTank: {
    perThousandLitresPerTank: 600,
    minCapacity: 1000,
    maxCapacity: 10000,
  },
};

export const INITIAL_SERVICE_AREAS = [
  'Bangrasia',
  'Katara Hills',
  'Bagsewaniya',
  'Bhopal',
];

export const INITIAL_APP_SETTINGS: AppSettings = {
  upiId: 'homemaid@upi',
  merchantName: 'Homemaid Services Pvt Ltd',
  qrCodeUrl: undefined,
  upiEnabled: true,
  paymentInstructions: 'Scan the QR code or click Pay by UPI. After making the payment in your UPI app, submit your 12-digit transaction ID / UTR number and optional payment proof for verification.',
  customerCarePhone: '+91 98930 12345',
  customerCareWhatsApp: '+91 98930 12345',
  businessOpeningTime: '08:00',
  businessClosingTime: '22:00',
  payNowEnabled: true,
  payAfterMaidArrivesEnabled: true,
  serviceAreas: INITIAL_SERVICE_AREAS,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_MAIDS: Maid[] = [
  {
    id: 'maid-1',
    maidId: 'HM-M-101',
    name: 'Sunita Sharma',
    phone: '+91 98765 43210',
    skills: ['House Cleaning', 'Laundry'],
    area: 'Katara Hills',
    city: 'Bhopal',
    isAvailable: true,
    isActive: true,
    rating: 4.9,
    totalJobs: 142,
    joinedDate: '2025-01-15',
  },
  {
    id: 'maid-2',
    maidId: 'HM-M-102',
    name: 'Rekha Devi',
    phone: '+91 98765 43211',
    skills: ['Baby Sitting', 'Elderly Care'],
    area: 'Bagsewaniya',
    city: 'Bhopal',
    isAvailable: true,
    isActive: true,
    rating: 4.8,
    totalJobs: 98,
    joinedDate: '2025-03-20',
  },
  {
    id: 'maid-3',
    maidId: 'HM-M-103',
    name: 'Anita Verma',
    phone: '+91 98765 43212',
    skills: ['House Cleaning', 'Water Tank Cleaning Specialist'],
    area: 'Bangrasia',
    city: 'Bhopal',
    isAvailable: true,
    isActive: true,
    rating: 5.0,
    totalJobs: 76,
    joinedDate: '2025-06-10',
  },
];

class StorageService {
  // Reads with backwards compatibility so existing bookings/settings are NEVER deleted
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const dataNew = localStorage.getItem(`homemaid_${key}`);
      if (dataNew) return JSON.parse(dataNew);

      // Check legacy HomeMate key to preserve existing user data
      const dataOld = localStorage.getItem(`homemate_${key}`);
      if (dataOld) {
        const parsed = JSON.parse(dataOld);
        localStorage.setItem(`homemaid_${key}`, dataOld); // migrate forward
        return parsed;
      }

      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`homemaid_${key}`, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to write to localStorage for ${key}`, err);
    }
  }

  // --- Services ---
  async getServices(): Promise<ServiceDefinition[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('services').select('*');
        if (!error && data && data.length > 0) {
          return data as ServiceDefinition[];
        }
      } catch (err) {
        console.warn('Supabase getServices fallback to local', err);
      }
    }
    return this.getLocal<ServiceDefinition[]>('services', INITIAL_SERVICES);
  }

  async saveServices(services: ServiceDefinition[]): Promise<void> {
    this.setLocal('services', services);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('services').upsert(services);
      } catch (err) {
        console.warn('Supabase saveServices error', err);
      }
    }
  }

  // --- Prices & Laundry Rates ---
  async getPrices(): Promise<PriceSettings> {
    return this.getLocal<PriceSettings>('price_settings', INITIAL_PRICES);
  }

  async savePrices(prices: PriceSettings): Promise<void> {
    this.setLocal('price_settings', prices);
  }

  // --- App Settings ---
  async getAppSettings(): Promise<AppSettings> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
        if (!error && data && data.settings) {
          const remoteSettings = typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings;
          const merged: AppSettings = { ...INITIAL_APP_SETTINGS, ...remoteSettings };
          this.setLocal('app_settings', merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getAppSettings notice:', err);
      }
    }
    const local = this.getLocal<AppSettings>('app_settings', INITIAL_APP_SETTINGS);
    return { ...INITIAL_APP_SETTINGS, ...local };
  }

  async saveAppSettings(settings: AppSettings): Promise<void> {
    const updated: AppSettings = { ...settings, updatedAt: new Date().toISOString() };
    this.setLocal('app_settings', updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('app_settings').upsert({
          id: 'global_settings',
          settings: updated,
          updated_at: updated.updatedAt,
        });
      } catch (err) {
        console.warn('Supabase saveAppSettings notice:', err);
      }
    }
  }

  // --- Bookings ---
  // Row Level Security compliance: customers only access their own bookings, admins access all
  async getBookings(customerId?: string, customerEmail?: string): Promise<Booking[]> {
    let bookings: Booking[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('bookings').select('*');
        if (customerId) {
          query = query.eq('customer_id', customerId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          bookings = data.map((d: any) => ({
            ...d,
            customerId: d.customer_id,
            bookingId: d.booking_id,
            customerPhone: d.customer_phone || d.customerPhone,
            customerName: d.customer_name || d.customerName,
            customerEmail: d.customer_email || d.customerEmail,
            serviceId: d.service_id || d.serviceId,
            serviceName: d.service_name || d.serviceName,
            serviceColor: d.service_color || d.serviceColor || 'blue',
            capturedPrice: d.captured_price ?? d.capturedPrice ?? d.amount,
            bookingDate: d.booking_date || d.bookingDate,
            bookingTime: d.booking_time || d.bookingTime,
            paymentMethod: d.payment_method || d.paymentMethod,
            paymentStatus: d.payment_status || d.paymentStatus,
            paymentUpiRef: d.payment_upi_ref || d.paymentUpiRef,
            paymentProofUrl: d.payment_proof_url || d.paymentProofUrl,
            paymentSubmittedAt: d.payment_submitted_at || d.paymentSubmittedAt,
            paymentVerifiedAt: d.payment_verified_at || d.paymentVerifiedAt,
            paymentVerifiedBy: d.payment_verified_by || d.paymentVerifiedBy,
            paymentRejectedAt: d.payment_rejected_at || d.paymentRejectedAt,
            paymentRejectionReason: d.payment_rejection_reason || d.paymentRejectionReason,
            bookingStatus: d.booking_status || d.bookingStatus,
            assignedMaidId: d.assigned_maid_id || d.assignedMaidId,
            assignedMaidName: d.assigned_maid_name || d.assignedMaidName,
            assignedMaidPhone: d.assigned_maid_phone || d.assignedMaidPhone,
            cancellationReason: d.cancellation_reason || d.cancellationReason,
            createdAt: d.created_at || d.createdAt,
            updatedAt: d.updated_at || d.updatedAt,
          }));
        } else {
          bookings = this.getLocal<Booking[]>('bookings', []);
        }
      } catch (err) {
        console.warn('Supabase getBookings fallback to local', err);
        bookings = this.getLocal<Booking[]>('bookings', []);
      }
    } else {
      bookings = this.getLocal<Booking[]>('bookings', []);
    }

    if (customerId) {
      return bookings.filter(
        (b) =>
          b.customerId === customerId ||
          (customerEmail && b.customerEmail?.toLowerCase() === customerEmail.toLowerCase())
      );
    }
    return bookings;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const all = this.getLocal<Booking[]>('bookings', []);
    return all.find((b) => b.id === id || b.bookingId === id) || null;
  }

  async createBooking(booking: Booking): Promise<Booking> {
    const all = this.getLocal<Booking[]>('bookings', []);
    const updated = [booking, ...all];
    this.setLocal('bookings', updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('bookings').insert([
          {
            id: booking.id,
            booking_id: booking.bookingId,
            customer_id: booking.customerId,
            customer_email: booking.customerEmail,
            customer_phone: booking.customerPhone,
            customer_name: booking.customerName,
            service_id: booking.serviceId,
            service_name: booking.serviceName,
            location: booking.location,
            booking_date: booking.bookingDate,
            booking_time: booking.bookingTime,
            captured_price: booking.capturedPrice,
            amount: booking.amount,
            payment_method: booking.paymentMethod,
            payment_status: booking.paymentStatus,
            payment_upi_ref: booking.paymentUpiRef,
            payment_proof_url: booking.paymentProofUrl,
            payment_submitted_at: booking.paymentSubmittedAt,
            payment_verified_at: booking.paymentVerifiedAt,
            payment_verified_by: booking.paymentVerifiedBy,
            payment_rejected_at: booking.paymentRejectedAt,
            payment_rejection_reason: booking.paymentRejectionReason,
            booking_status: booking.bookingStatus,
            created_at: booking.createdAt,
            updated_at: booking.updatedAt,
          },
        ]);
      } catch (err) {
        console.warn('Supabase createBooking insert notice:', err);
      }
    }
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const all = this.getLocal<Booking[]>('bookings', []);
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const merged = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
    all[index] = merged;
    this.setLocal('bookings', all);

    if (isSupabaseConfigured() && supabase) {
      try {
        const supabaseUpdates: any = { updated_at: merged.updatedAt };
        if (updates.bookingStatus) supabaseUpdates.booking_status = updates.bookingStatus;
        if (updates.paymentStatus) supabaseUpdates.payment_status = updates.paymentStatus;
        if (updates.paymentUpiRef !== undefined) supabaseUpdates.payment_upi_ref = updates.paymentUpiRef;
        if (updates.paymentProofUrl !== undefined) supabaseUpdates.payment_proof_url = updates.paymentProofUrl;
        if (updates.paymentSubmittedAt !== undefined) supabaseUpdates.payment_submitted_at = updates.paymentSubmittedAt;
        if (updates.paymentVerifiedAt !== undefined) supabaseUpdates.payment_verified_at = updates.paymentVerifiedAt;
        if (updates.paymentVerifiedBy !== undefined) supabaseUpdates.payment_verified_by = updates.paymentVerifiedBy;
        if (updates.paymentRejectedAt !== undefined) supabaseUpdates.payment_rejected_at = updates.paymentRejectedAt;
        if (updates.paymentRejectionReason !== undefined) supabaseUpdates.payment_rejection_reason = updates.paymentRejectionReason;
        if (updates.assignedMaidId !== undefined) supabaseUpdates.assigned_maid_id = updates.assignedMaidId;
        if (updates.assignedMaidName !== undefined) supabaseUpdates.assigned_maid_name = updates.assignedMaidName;
        if (updates.assignedMaidPhone !== undefined) supabaseUpdates.assigned_maid_phone = updates.assignedMaidPhone;
        if (updates.cancellationReason !== undefined) supabaseUpdates.cancellation_reason = updates.cancellationReason;

        await supabase.from('bookings').update(supabaseUpdates).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateBooking notice:', err);
      }
    }
    return merged;
  }

  // --- Maids (Admin Only) ---
  async getMaids(): Promise<Maid[]> {
    return this.getLocal<Maid[]>('maids', INITIAL_MAIDS);
  }

  async saveMaid(maid: Maid): Promise<void> {
    const maids = this.getLocal<Maid[]>('maids', INITIAL_MAIDS);
    const existingIndex = maids.findIndex((m) => m.id === maid.id);
    if (existingIndex >= 0) {
      maids[existingIndex] = maid;
    } else {
      maids.push(maid);
    }
    this.setLocal('maids', maids);
  }

  // --- Maid Applications (Public submit, Admin review) ---
  async getMaidApplications(): Promise<MaidApplication[]> {
    return this.getLocal<MaidApplication[]>('maid_applications', []);
  }

  async submitMaidApplication(app: MaidApplication): Promise<void> {
    const apps = this.getLocal<MaidApplication[]>('maid_applications', []);
    this.setLocal('maid_applications', [app, ...apps]);
  }

  async updateMaidApplication(id: string, updates: Partial<MaidApplication>): Promise<void> {
    const apps = this.getLocal<MaidApplication[]>('maid_applications', []);
    const idx = apps.findIndex((a) => a.id === id);
    if (idx >= 0) {
      apps[idx] = { ...apps[idx], ...updates };
      this.setLocal('maid_applications', apps);
    }
  }

  // --- Users ---
  async getUser(uid: string): Promise<AppUser | null> {
    const users = this.getLocal<Record<string, AppUser>>('users_db', {});
    return users[uid] || null;
  }

  async saveUser(user: AppUser): Promise<void> {
    const users = this.getLocal<Record<string, AppUser>>('users_db', {});
    users[user.uid] = user;
    this.setLocal('users_db', users);
  }
}

export const storage = new StorageService();
