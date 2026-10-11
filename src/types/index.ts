export type BookingStatus =
  | 'PAYMENT_PENDING_VERIFICATION' // Submitted UPI payment awaiting Admin check
  | 'PAYMENT_REJECTED' // Rejected UPI payment details with retry option
  | 'CONFIRMED'
  | 'WAITING_FOR_MAID_ASSIGNMENT'
  | 'MAID_ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_HOMEMAID'
  | 'CANCELLED_BY_HOMEMATE'; // Backwards compatibility for existing records

export type PaymentMethod = 'UPI' | 'PAY_AFTER_SERVICE';

export type PaymentStatus =
  | 'PENDING'
  | 'AWAITING_VERIFICATION' // Submitted UTR / proof awaiting admin confirmation
  | 'PAY_AFTER_SERVICE_PENDING'
  | 'PAID'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REFUND_REQUIRED'
  | 'REFUNDED';

export type ServiceId =
  | 'laundry'
  | 'house_cleaning'
  | 'baby_sitting'
  | 'elderly_care'
  | 'water_tank';

export interface LaundryItemQuantity {
  id: string;
  name: string;
  pricePerItem: number;
  quantity: number;
}

export interface HouseCleaningOptions {
  cleaningType: 'simple' | 'deep' | 'both';
  simpleRooms: number;
  deepRooms: number;
  bathrooms: number;
}

export interface BabySittingOptions {
  babyCount: number;
  hours: number;
}

export interface ElderlyCareOptions {
  elderCount: number;
  hours: number;
}

export interface WaterTankOptions {
  tankCapacity: number; // 1,000 to 10,000 litres
  tankCount: number; // minimum 1
}

export interface BookingLocation {
  fullAddress: string;
  area: string;
  city: string;
  pincode?: string;
  landmark?: string;
  latitude: number | null;
  longitude: number | null;
  isServiceable: boolean;
}

export interface Booking {
  id: string;
  bookingId: string; // e.g. HM-2026-XXXX
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName: string;
  
  serviceId: ServiceId | string;
  serviceName: string;
  serviceColor: string;
  
  // Specific service configurations
  laundryItems?: LaundryItemQuantity[];
  houseCleaning?: HouseCleaningOptions;
  babySitting?: BabySittingOptions;
  elderlyCare?: ElderlyCareOptions;
  waterTank?: WaterTankOptions;

  location: BookingLocation;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:mm (between 08:00 and 22:00)
  
  capturedPrice: number;
  amount: number;
  
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentUpiRef?: string;
  paymentProofUrl?: string; // Base64 data URL or uploaded screenshot of payment
  paymentSubmittedAt?: string;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  paymentRejectedAt?: string;
  paymentRejectionReason?: string;
  
  bookingStatus: BookingStatus;
  
  assignedMaidId?: string | null;
  assignedMaidName?: string | null;
  assignedMaidPhone?: string | null;
  
  cancellationReason?: string | null;
  cancelledBy?: 'CUSTOMER' | 'HOMEMAID' | 'HOMEMATE' | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDefinition {
  id: ServiceId | string;
  name: string;
  tagline: string;
  description: string;
  colorName: 'purple' | 'green' | 'pink' | 'blue' | 'cyan';
  bgClass: string;
  borderClass: string;
  badgeBg: string;
  textClass: string;
  accentClass: string;
  iconName: string;
  isActive: boolean;
  basePriceDescription: string;
}

export interface LaundryRate {
  id: string;
  name: string;
  price: number;
  category: 'daily' | 'heavy' | 'delicate';
}

export interface PriceSettings {
  laundry: LaundryRate[];
  houseCleaning: {
    simplePerRoom: number; // ₹250
    deepPerRoom: number;   // ₹400
    bathroomPerUnit: number; // ₹400
  };
  babySitting: {
    perBabyPerHour: number; // ₹250
  };
  elderlyCare: {
    perElderPerHour: number; // ₹300
  };
  waterTank: {
    perThousandLitresPerTank: number; // ₹600
    minCapacity: number; // 1,000
    maxCapacity: number; // 10,000
  };
}

export interface Maid {
  id: string;
  maidId: string; // HM-M-101
  name: string;
  phone: string;
  photoUrl?: string;
  skills: string[];
  area: string;
  city: string;
  isAvailable: boolean;
  isActive: boolean;
  rating?: number;
  totalJobs?: number;
  joinedDate: string;
}

export interface MaidApplication {
  id: string;
  applicationId: string;
  fullName: string;
  phone: string;
  area: string;
  city: string;
  servicesCanDo: string[];
  skillsDetails: string;
  experience?: string;
  description?: string;
  photoUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AppSettings {
  upiId: string;
  merchantName: string;
  qrCodeUrl?: string; // Uploaded/custom QR image
  upiEnabled: boolean; // Enable or disable UPI payments
  paymentInstructions: string;
  customerCarePhone: string;
  customerCareWhatsApp: string;
  businessOpeningTime: string;
  businessClosingTime: string;
  payNowEnabled: boolean;
  payAfterMaidArrivesEnabled: boolean;
  serviceAreas: string[];
  updatedAt: string;
}

export interface AppUser {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'customer' | 'admin';
  preferredLanguage?: string;
  savedAddresses?: BookingLocation[];
  createdAt: string;
}
