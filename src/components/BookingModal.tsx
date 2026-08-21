// ============================================================================
// VIP TABLE BOOKING MODAL WITH ATOMIC DOUBLE-BOOKING LOCK & LEDGER POSTING
// ============================================================================
import React, { useState } from 'react';
import { Venue, TableItem, TableBooking } from '../types';
import { clientStore } from '../lib/storage';
import { formatPHP, formatCategory } from '../lib/formatters';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Users, 
  Calendar, 
  Clock, 
  Lock, 
  Tag, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  venue: Venue;
  initialTable?: TableItem | null;
  onClose: () => void;
  onSuccess: (booking: TableBooking) => void;
}

export const BookingModal: React.FC<Props> = ({
  venue,
  initialTable,
  onClose,
  onSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-21');
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(initialTable || null);
  const [guestCount, setGuestCount] = useState<number>(initialTable ? initialTable.capacity : 6);
  const [promoterCode, setPromoterCode] = useState<string>('');
  const [promoterVerified, setPromoterVerified] = useState<boolean>(false);
  const [promoterName, setPromoterName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'GCASH' | 'MAYA' | 'CARD'>('GCASH');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tables = clientStore.getTablesByVenue(venue.id);
  const existingBookings = clientStore.getBookings(venue.id, selectedDate);
  const bookedTableIds = existingBookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
    .map(b => b.table_id);

  const currentUser = clientStore.getCurrentUser();

  const handleVerifyPromoter = async () => {
    if (!promoterCode.trim()) return;
    const cleanCode = promoterCode.trim().toUpperCase();
    try {
      const res = await fetch(`/api/promoters/${cleanCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setPromoterVerified(true);
          setPromoterName(json.data.full_name);
          setErrorMsg(null);
          return;
        }
      }
    } catch (e) {}

    // Fallback store check
    const matched = clientStore.getUsers().find(u => u.promoter_code === cleanCode);
    if (matched) {
      setPromoterVerified(true);
      setPromoterName(matched.full_name);
      setErrorMsg(null);
    } else {
      setPromoterVerified(false);
      setPromoterName('');
      setErrorMsg('Promoter referral code not found. You can still proceed without a code.');
    }
  };

  const handleTablePick = (table: TableItem) => {
    setSelectedTable(table);
    setGuestCount(Math.min(guestCount, table.capacity));
    setErrorMsg(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTable) {
      setErrorMsg('Please select a VIP table on the floor plan.');
      return;
    }

    // Atomic double-booking lock check
    if (clientStore.isTableBooked(selectedTable.id, selectedDate)) {
      setErrorMsg('This table was just reserved by another guest for this date. Please pick another table.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const booking = await clientStore.createBooking({
        venue_id: venue.id,
        table_id: selectedTable.id,
        target_date: selectedDate,
        guest_count: guestCount,
        deposit_amount_php: selectedTable.deposit_required_php,
        min_spend_php: selectedTable.min_spend_php,
        promoter_code: promoterVerified ? promoterCode.trim().toUpperCase() : null,
        payment_method: paymentMethod
      });

      onSuccess(booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete reservation hold.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                VIP Bottle Service & Table Hold
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">{venue.address}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{venue.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          {/* Left Column: Floor Plan & Table Selection */}
          <div className="lg:col-span-7 p-6 space-y-4 bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">Interactive Venue Floor Plan</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <select
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-orange-500"
                >
                  <option value="2026-08-21">Tonight (2026-08-21)</option>
                  <option value="2026-08-22">Tomorrow (2026-08-22)</option>
                  <option value="2026-08-23">Sunday (2026-08-23)</option>
                </select>
              </div>
            </div>

            <InteractiveFloorPlan
              tables={tables}
              selectedTableId={selectedTable?.id || null}
              onSelectTable={handleTablePick}
              bookedTableIds={bookedTableIds}
              currentDate={selectedDate}
            />

            {selectedTable ? (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400">Selected Table</span>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-white">{selectedTable.table_number}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {formatCategory(selectedTable.category)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">Capacity up to {selectedTable.capacity} guests</p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-zinc-400">Consumable Min Spend: <strong className="text-emerald-400">{formatPHP(selectedTable.min_spend_php)}</strong></div>
                  <div className="text-xs text-amber-400 font-semibold mt-0.5">Lock Deposit: {formatPHP(selectedTable.deposit_required_php)}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center text-xs text-zinc-400">
                Click on any available table on the floor plan above to select it.
              </div>
            )}
          </div>

          {/* Right Column: Checkout & Deposit Holding */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6 bg-zinc-950/80">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-zinc-200">Reservation Details</h3>

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Party Size (Guests)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max={selectedTable?.capacity || 15}
                    value={guestCount}
                    onChange={e => setGuestCount(Number(e.target.value))}
                    className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-mono text-center focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-xs text-zinc-500">
                    Max capacity: {selectedTable ? selectedTable.capacity : '—'} pax
                  </span>
                </div>
              </div>

              {/* Promoter Code */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Promoter Referral Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. CEBU_VIP_CARLO"
                      value={promoterCode}
                      onChange={e => {
                        setPromoterCode(e.target.value);
                        setPromoterVerified(false);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyPromoter}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition"
                  >
                    Apply
                  </button>
                </div>
                {promoterVerified && (
                  <p className="text-xs text-emerald-400 flex items-center space-x-1 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Referred by <strong>{promoterName}</strong> (+10% credit applied)</span>
                  </p>
                )}
              </div>

              {/* Payment Gateway Method */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Deposit Lock Gateway (Philippine Payment Rails)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GCASH', 'MAYA', 'CARD'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
                        paymentMethod === method
                          ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1" />
                      <span className="text-xs font-mono">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Minimum Consumable Spend:</span>
                  <span className="text-zinc-200">{selectedTable ? formatPHP(selectedTable.min_spend_php) : '₱0'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Required Upfront Lock Deposit:</span>
                  <span className="text-amber-400 font-semibold">{selectedTable ? formatPHP(selectedTable.deposit_required_php) : '₱0'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Payable at Venue Door:</span>
                  <span className="text-zinc-300">{selectedTable ? formatPHP(selectedTable.min_spend_php - selectedTable.deposit_required_php) : '₱0'}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm">
                  <span className="text-white font-bold">Total Due Now:</span>
                  <span className="text-orange-400 font-bold">{selectedTable ? formatPHP(selectedTable.deposit_required_php) : '₱0'}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!selectedTable || isSubmitting}
                className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 font-bold text-sm transition shadow-lg ${
                  !selectedTable || isSubmitting
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-black shadow-orange-500/20'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Distributed Hold...' : `Lock Table (${selectedTable ? formatPHP(selectedTable.deposit_required_php) : '₱0'})`}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-zinc-500 text-center mt-2 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted double-entry ledger guarantee & 10m atomic hold</span>
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
