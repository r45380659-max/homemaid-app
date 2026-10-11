export interface LanguageInfo {
  code: string;
  name: string; // English name
  nativeName: string; // Script name
  region: string;
  isRTL?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Pan-India' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North / Central India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal / Tripura' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh / Telangana' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu / Puducherry' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Pan-India / Jammu & Kashmir', isRTL: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala / Lakshadweep' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'Bihar / Jharkhand' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand / Odisha / West Bengal' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر / कॉशुर', region: 'Jammu & Kashmir' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim / West Bengal' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', region: 'Goa / Coastal Karnataka' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिंधी', region: 'Gujarat / Maharashtra' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'Jammu & Kashmir / Himachal' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ', region: 'Manipur' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर\'', region: 'Assam' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Classical Language of India' },
];

export const SCHEDULED_LANGUAGES_COUNT = 22;
