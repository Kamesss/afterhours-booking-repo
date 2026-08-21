import React, { useState } from 'react';
import { Club, ClubTable, TableType, Booking } from '../types';
import { db } from '../lib/storage';
import { formatPeso, firePassConfetti } from '../lib/formatters';
import { AMBASSADOR_PROMOS } from '../data/initialData';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { X, Calendar, Clock, Users, Sparkles, Check, CreditCard, ShieldCheck, Tag, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  club: Club;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  club,
  onClose,
  onBookingSuccess,
}) => {
  const currentUser = db.getCurrentUser();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [selectedTable, setSelectedTable] = useState<ClubTable | null>(null);
  const [selectedTableType, setSelectedTableType] = useState<TableType | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string>('22:30');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  
  // Contact details
  const [name, setName] = useState<string>(currentUser.name);
  const [email, setEmail] = useState<string>(currentUser.email);
  const [phone, setPhone] = useState<string>(currentUser.phone || '+63 917 ');

  // Ambassador Promo Code
  const [promoCodeInput, setPromoCodeInput] = useState<string>('CEBUVIP');
  const [appliedPromo, setAppliedPromo] = useState<typeof AMBASSADOR_PROMOS[0] | null>(AMBASSADOR_PROMOS[0]);
  const [promoError, setPromoError] = useState<string>('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Card' | 'Club Pay at Door'>('GCash');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const tableTypes = db.getTableTypes(club.id);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    const found = AMBASSADOR_PROMOS.find(p => p.code === code && (!p.club_id || p.club_id === club.id));
    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid or expired ambassador code');
    }
  };

  const handleSelectTable = (table: ClubTable, tableType: TableType) => {
    setSelectedTable(table);
    setSelectedTableType(tableType);
    if (guestCount > tableType.max_guests) {
      setGuestCount(tableType.max_guests);
    }
    setErrorMessage('');
  };

  // Financial calculations
  const rawMinSpend = selectedTableType?.min_spend_cents || 0;
  const rawDeposit = selectedTableType?.deposit_cents || 0;
  const discountRate = appliedPromo ? (appliedPromo.discount_deposit_percent / 100) : 0;
  const finalDeposit = Math.round(rawDeposit * (1 - discountRate));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !selectedTableType) {
      setErrorMessage('Please select a table on the floor plan above.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please fill in your contact information.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await db.createBooking({
        club_id: club.id,
        table_id: selectedTable.id,
        user_id: currentUser.id,
        booking_date: bookingDate,
        arrival_time: arrivalTime,
        guest_count: guestCount,
        min_spend_cents: rawMinSpend,
        deposit_paid_cents: finalDeposit,
        special_requests: specialRequests,
        ambassador_promo_code: appliedPromo?.code,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        payment_method: paymentMethod,
      });

      setIsSubmitting(false);

      if (!res.success || !res.booking) {
        setErrorMessage(res.error || 'Failed to complete reservation. Table may be locked.');
        return;
      }

      firePassConfetti();
      onBookingSuccess(res.booking);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error creating booking in database.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-[#050505] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF2E88]/15 border border-[#FF2E88]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FF2E88]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Reserve VIP Table &bull; {club.name}
              </h2>
              <p className="text-xs text-white/50">
                100% In-App Deposit &bull; Guaranteed Table Lock (No Double Booking)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Step 1: Select Night & Date */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF2E88]" />
              1. Select Date of Night Out
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBookingDate(todayStr)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bookingDate === todayStr
                    ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                Tonight ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setBookingDate(tomorrowStr)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bookingDate === tomorrowStr
                    ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                Tomorrow ({tomorrowStr})
              </button>
              <input
                type="date"
                value={bookingDate}
                min={todayStr}
                onChange={e => setBookingDate(e.target.value)}
                className="bg-[#111] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
              />
            </div>
          </div>

          {/* Step 2: Interactive Table Selection Floor Plan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                2. Tap Table to Select on Live Blueprint
              </label>
              {selectedTable && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Selected: {selectedTable.table_number}
                </span>
              )}
            </div>

            <InteractiveFloorPlan
              club={club}
              selectedDate={bookingDate}
              selectedTable={selectedTable}
              onSelectTable={handleSelectTable}
            />
          </div>

          {/* Step 3: Time & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                3. Expected Arrival Time
              </label>
              <select
                value={arrivalTime}
                onChange={e => setArrivalTime(e.target.value)}
                className="w-full bg-[#111] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
              >
                <option value="21:00">9:00 PM (Early Bird Entry)</option>
                <option value="21:30">9:30 PM</option>
                <option value="22:00">10:00 PM</option>
                <option value="22:30">10:30 PM (Recommended)</option>
                <option value="23:00">11:00 PM (Main Warmup)</option>
                <option value="23:30">11:30 PM (Peak Headliner)</option>
                <option value="00:00">12:00 Midnight</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B5CF6]" />
                Number of Guests (Pax)
              </label>
              <div className="flex items-center space-x-3 bg-[#111] border border-white/15 rounded-xl p-1.5">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-9 h-9 rounded-lg bg-white/10 text-white font-bold text-lg hover:bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-sm text-white">
                  {guestCount} Guests {selectedTableType ? `(Max ${selectedTableType.max_guests})` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.min(selectedTableType?.max_guests || 20, guestCount + 1))}
                  className="w-9 h-9 rounded-lg bg-white/10 text-white font-bold text-lg hover:bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Step 4: Contact info */}
          <div className="space-y-3 bg-[#050505] border border-white/10 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              4. VIP Reservation Holder Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Email (for QR Pass)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Mobile / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/50 mb-1">Special Celebration / Bottle Requests (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Birthday celebration, please prepare sparklers with Don Julio 1942"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF2E88]"
              />
            </div>
          </div>

          {/* Step 5: Ambassador Code & Perk */}
          <div className="space-y-3 bg-gradient-to-r from-[#FF2E88]/15 via-[#111] to-[#050505] border border-[#FF2E88]/30 rounded-2xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FF2E88] flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-300" />
              5. Ambassador Promo Code & Perks
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value)}
                placeholder="Try CEBUVIP or AFTERHOURS10"
                className="flex-1 uppercase font-mono bg-[#111] border border-white/15 rounded-xl px-3 py-2 text-xs text-white tracking-widest focus:outline-none focus:border-[#FF2E88]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(255,46,136,0.3)]"
              >
                Apply Code
              </button>
            </div>

            {appliedPromo && (
              <div className="p-2.5 bg-[#FF2E88]/10 border border-[#FF2E88]/30 rounded-xl text-xs text-white/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" /> Code '{appliedPromo.code}' Active: {appliedPromo.discount_deposit_percent}% Off Upfront Deposit!
                </div>
                <p className="text-white/80 text-[11px]">
                  🎁 Bonus Perk: <strong>{appliedPromo.complimentary_item}</strong>
                </p>
              </div>
            )}
            {promoError && (
              <p className="text-xs text-red-400">{promoError}</p>
            )}
          </div>

          {/* Step 6: Payment Method & Breakdown */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              6. Payment Method for Upfront Deposit
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['GCash', 'Maya', 'Card', 'Club Pay at Door'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{method === 'GCash' ? '🔵 GCash' : method === 'Maya' ? '🟢 Maya' : method === 'Card' ? '💳 Debit/Credit' : '🚪 Pay at Door'}</span>
                  <span className="text-[10px] text-white/40 font-normal">
                    {method === 'Club Pay at Door' ? 'Held until 11PM' : 'Instant Table Lock'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Summary Card */}
          {selectedTableType && (
            <div className="p-4 bg-[#050505] border border-white/10 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Selected Table:</span>
                <span className="text-white font-medium">{selectedTable?.table_number} ({selectedTableType.name})</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Minimum Consumable Spend:</span>
                <span className="text-white font-bold font-mono">{formatPeso(rawMinSpend)}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Standard Upfront Deposit:</span>
                <span className="text-white/70 font-mono">{formatPeso(rawDeposit)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-400 font-mono">
                  <span>Ambassador Discount ({appliedPromo.discount_deposit_percent}%):</span>
                  <span>-{formatPeso(rawDeposit - finalDeposit)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-sm font-extrabold text-white">Deposit Due Now:</span>
                  <p className="text-[10px] text-white/40">100% credited towards your drinks tonight</p>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">{formatPeso(finalDeposit)}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="confirm-reservation-btn"
              type="submit"
              disabled={isSubmitting || !selectedTable}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                selectedTable && !isSubmitting
                  ? 'bg-gradient-to-r from-[#FF2E88] via-[#8B5CF6] to-[#FF2E88] hover:opacity-90 text-white shadow-[0_0_25px_rgba(255,46,136,0.4)] active:scale-[0.99]'
                  : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
              }`}
            >
              {isSubmitting ? (
                <span>Locking Table in Cebu Database...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>
                    {selectedTable ? `CONFIRM RESERVATION & PAY ${formatPeso(finalDeposit)} DEPOSIT` : 'SELECT TABLE ABOVE TO PROCEED'}
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-white/40 mt-2">
              🔒 AfterHours zero-risk guarantee: Free cancellation up to 4 hours before club opening.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
