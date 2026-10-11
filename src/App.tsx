import React, { useState, useEffect } from 'react';
import {
  Booking,
  ServiceDefinition,
  BookingLocation,
  LaundryItemQuantity,
  HouseCleaningOptions,
  BabySittingOptions,
  ElderlyCareOptions,
  WaterTankOptions,
} from './types';
import { storage } from './services/storage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { ExternalSetupModal } from './components/ExternalSetupModal';

// Customer Views
import { CustomerHome } from './views/customer/CustomerHome';
import { ServiceCustomizer } from './views/customer/ServiceCustomizer';
import { LocationStep } from './views/customer/LocationStep';
import { DateTimeStep } from './views/customer/DateTimeStep';
import { PaymentConfirmationStep } from './views/customer/PaymentConfirmationStep';
import { RequestConfirmed } from './views/customer/RequestConfirmed';
import { MyBookings } from './views/customer/MyBookings';
import { BookingDetails } from './views/customer/BookingDetails';
import { CustomerCare } from './views/customer/CustomerCare';
import { Profile } from './views/customer/Profile';
import { ApplyAsMaid } from './views/customer/ApplyAsMaid';
import { CustomerLogin } from './views/customer/CustomerLogin';

// Admin Views
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { ManageBookings } from './views/admin/ManageBookings';
import { ManageMaids } from './views/admin/ManageMaids';
import { ManageMaidApplications } from './views/admin/ManageMaidApplications';
import { ManageServices } from './views/admin/ManageServices';
import { ManagePrices } from './views/admin/ManagePrices';
import { ManagePayments } from './views/admin/ManagePayments';
import { AdminSettings } from './views/admin/AdminSettings';

function AppContent() {
  const { currentUser, isAdmin, showSetupModal, setShowSetupModal } = useAuth();
  const { hasChosenInitialLanguage, showLanguageModal, setShowLanguageModal } = useLanguage();

  // App lifecycle
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [portalMode, setPortalMode] = useState<'customer' | 'admin'>('customer');
  const [activeTab, setActiveTab] = useState<string>('home');

  // Booking Flow Draft State
  const [draftService, setDraftService] = useState<ServiceDefinition | null>(null);
  const [draftCapturedPrice, setDraftCapturedPrice] = useState<number>(0);
  const [draftLaundryItems, setDraftLaundryItems] = useState<LaundryItemQuantity[] | undefined>();
  const [draftHouseCleaning, setDraftHouseCleaning] = useState<HouseCleaningOptions | undefined>();
  const [draftBabySitting, setDraftBabySitting] = useState<BabySittingOptions | undefined>();
  const [draftElderlyCare, setDraftElderlyCare] = useState<ElderlyCareOptions | undefined>();
  const [draftWaterTank, setDraftWaterTank] = useState<WaterTankOptions | undefined>();
  const [draftLocation, setDraftLocation] = useState<BookingLocation | null>(null);
  const [draftDate, setDraftDate] = useState<string>('');
  const [draftTime, setDraftTime] = useState<string>('');
  const [draftBookingRef, setDraftBookingRef] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Selected Booking for Details view
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);

  // Active bookings count for badge
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);

  useEffect(() => {
    storage.getBookings(currentUser?.uid).then((res) => {
      const active = res.filter((b) =>
        ['CONFIRMED', 'WAITING_FOR_MAID_ASSIGNMENT', 'MAID_ASSIGNED', 'IN_PROGRESS'].includes(
          b.bookingStatus
        )
      );
      setActiveBookingsCount(active.length);
    });
  }, [currentUser, activeTab]);

  // Booking flow handoffs
  const handleSelectService = (service: ServiceDefinition) => {
    setDraftService(service);
    setDraftBookingRef(`HM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveTab('booking_customize');
  };

  const handleCustomizationProceed = (details: {
    capturedPrice: number;
    laundryItems?: LaundryItemQuantity[];
    houseCleaning?: HouseCleaningOptions;
    babySitting?: BabySittingOptions;
    elderlyCare?: ElderlyCareOptions;
    waterTank?: WaterTankOptions;
  }) => {
    setDraftCapturedPrice(details.capturedPrice);
    setDraftLaundryItems(details.laundryItems);
    setDraftHouseCleaning(details.houseCleaning);
    setDraftBabySitting(details.babySitting);
    setDraftElderlyCare(details.elderlyCare);
    setDraftWaterTank(details.waterTank);
    setActiveTab('booking_location');
  };

  const handleLocationProceed = (loc: BookingLocation) => {
    setDraftLocation(loc);
    setActiveTab('booking_datetime');
  };

  const handleDateTimeProceed = (dt: { bookingDate: string; bookingTime: string }) => {
    setDraftDate(dt.bookingDate);
    setDraftTime(dt.bookingTime);
    setActiveTab('booking_payment');
  };

  const handlePaymentSubmit = async (paymentData: {
    paymentMethod: any;
    paymentStatus: any;
    bookingStatus: any;
    paymentUpiRef?: string;
    paymentProofUrl?: string;
    paymentSubmittedAt?: string;
  }) => {
    if (!draftService || !draftLocation) return;

    const isUpi = paymentData.paymentMethod === 'UPI';

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      bookingId: draftBookingRef,
      customerId: currentUser?.uid || `guest-${Date.now()}`,
      customerPhone: currentUser?.phone || 'Guest Phone',
      customerName: currentUser?.name || 'HomeMate Customer',
      customerEmail: currentUser?.email,
      serviceId: draftService.id,
      serviceName: draftService.name,
      serviceColor: draftService.colorName,
      laundryItems: draftLaundryItems,
      houseCleaning: draftHouseCleaning,
      babySitting: draftBabySitting,
      elderlyCare: draftElderlyCare,
      waterTank: draftWaterTank,
      location: draftLocation,
      bookingDate: draftDate,
      bookingTime: draftTime,
      capturedPrice: draftCapturedPrice,
      amount: draftCapturedPrice,
      paymentMethod: paymentData.paymentMethod,
      paymentStatus: paymentData.paymentStatus,
      paymentUpiRef: paymentData.paymentUpiRef,
      paymentProofUrl: paymentData.paymentProofUrl,
      paymentSubmittedAt: paymentData.paymentSubmittedAt,
      bookingStatus: paymentData.bookingStatus || (isUpi ? 'PAYMENT_PENDING_VERIFICATION' : 'CONFIRMED'),
      assignedMaidId: null,
      assignedMaidName: null,
      assignedMaidPhone: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await storage.createBooking(newBooking);
    setConfirmedBooking(saved);
    setActiveTab('booking_confirmed');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* 2. First Launch Language Selector Modal (all 22 scheduled Indian languages) */}
      {!showSplash && !hasChosenInitialLanguage && (
        <LanguageSelectorModal isFirstLaunch={true} isOpen={true} />
      )}

      {/* 3. Regular Language Selector Modal */}
      {showLanguageModal && (
        <LanguageSelectorModal
          isOpen={true}
          onClose={() => setShowLanguageModal(false)}
        />
      )}

      {/* 4. External Setup Modal */}
      {showSetupModal && (
        <ExternalSetupModal
          isOpen={true}
          onClose={() => setShowSetupModal(false)}
        />
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portalMode={portalMode}
        setPortalMode={setPortalMode}
        onOpenApplyMaid={() => {
          setPortalMode('customer');
          setActiveTab('apply_as_maid');
        }}
      />

      {/* Admin Navigation Sub-Bar (when in admin portal and authenticated) */}
      {portalMode === 'admin' && currentUser?.role === 'admin' && (
        <div className="bg-slate-900 border-b border-slate-800 text-white overflow-x-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 py-2">
            {[
              { id: 'admin_dashboard', label: 'Dashboard' },
              { id: 'manage_bookings', label: 'Bookings' },
              { id: 'manage_maids', label: 'Maids' },
              { id: 'manage_applications', label: 'Applications' },
              { id: 'manage_services', label: 'Services' },
              { id: 'manage_prices', label: 'Prices' },
              { id: 'manage_payments', label: 'Payments' },
              { id: 'admin_settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12">
        {/* CUSTOMER PORTAL VIEWS */}
        {portalMode === 'customer' && (
          <>
            {activeTab === 'home' && (
              <CustomerHome
                onSelectService={handleSelectService}
                onNavigateTab={setActiveTab}
                onOpenApplyMaid={() => setActiveTab('apply_as_maid')}
              />
            )}

            {activeTab === 'booking_customize' && draftService && (
              <ServiceCustomizer
                service={draftService}
                onBack={() => setActiveTab('home')}
                onProceed={handleCustomizationProceed}
              />
            )}

            {activeTab === 'booking_location' && (
              <LocationStep
                initialLocation={draftLocation}
                onBack={() => setActiveTab('booking_customize')}
                onProceed={handleLocationProceed}
              />
            )}

            {activeTab === 'booking_datetime' && (
              <DateTimeStep
                initialDate={draftDate}
                initialTime={draftTime}
                onBack={() => setActiveTab('booking_location')}
                onProceed={handleDateTimeProceed}
              />
            )}

            {activeTab === 'booking_payment' && (
              <PaymentConfirmationStep
                amount={draftCapturedPrice}
                bookingRef={draftBookingRef}
                onBack={() => setActiveTab('booking_datetime')}
                onSubmitBooking={handlePaymentSubmit}
              />
            )}

            {activeTab === 'booking_confirmed' && confirmedBooking && (
              <RequestConfirmed
                booking={confirmedBooking}
                onViewMyBookings={() => setActiveTab('my_bookings')}
                onGoHome={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'my_bookings' && (
              <MyBookings
                onSelectBooking={(b) => {
                  setInspectBooking(b);
                  setActiveTab('booking_details');
                }}
                onBookNew={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'booking_details' && inspectBooking && (
              <BookingDetails
                booking={inspectBooking}
                onBack={() => setActiveTab('my_bookings')}
                onUpdate={(upd) => setInspectBooking(upd)}
              />
            )}

            {activeTab === 'customer_care' && <CustomerCare />}

            {activeTab === 'profile' && (
              <Profile
                onOpenLogin={() => setActiveTab('customer_login')}
                onOpenApplyMaid={() => setActiveTab('apply_as_maid')}
              />
            )}

            {activeTab === 'apply_as_maid' && (
              <ApplyAsMaid onBack={() => setActiveTab('home')} />
            )}

            {activeTab === 'customer_login' && (
              <CustomerLogin
                onBack={() => setActiveTab('home')}
                onSuccess={() => setActiveTab('home')}
              />
            )}
          </>
        )}

        {/* ADMIN PORTAL VIEWS */}
        {portalMode === 'admin' && (
          <>
            {currentUser?.role !== 'admin' ? (
              <AdminLogin
                onSuccess={() => setActiveTab('admin_dashboard')}
                onBackToCustomer={() => {
                  setPortalMode('customer');
                  setActiveTab('home');
                }}
              />
            ) : (
              <>
                {activeTab === 'admin_dashboard' && (
                  <AdminDashboard onNavigateSection={(sec) => setActiveTab(sec)} />
                )}
                {activeTab === 'manage_bookings' && <ManageBookings />}
                {activeTab === 'manage_maids' && <ManageMaids />}
                {activeTab === 'manage_applications' && <ManageMaidApplications />}
                {activeTab === 'manage_services' && <ManageServices />}
                {activeTab === 'manage_prices' && <ManagePrices />}
                {activeTab === 'manage_payments' && <ManagePayments />}
                {activeTab === 'admin_settings' && <AdminSettings />}
              </>
            )}
          </>
        )}
      </main>

      {/* Bottom Nav for mobile customer experience */}
      {portalMode === 'customer' && !activeTab.startsWith('booking_') && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          bookingCount={activeBookingsCount}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
