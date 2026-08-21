// ============================================================================
// DIGITAL PASS QR MODAL (TABLE RESERVATION OR GUESTLIST PASS)
// ============================================================================
import React from 'react';
import { TableBooking, GuestlistEntry, Venue } from '../types';
import { formatPHP } from '../lib/formatters';
import { CheckCircle2, QrCode, Sparkles, MapPin, Clock, Calendar, Users, X, Share2, Download } from 'lucide-react';

interface Props {
  pass: TableBooking | GuestlistEntry;
  type: 'TABLE_BOOKING' | 'GUESTLIST_PASS';
  venue?: Venue;
  onClose: () => void;
}

export const DigitalPassModal: React.FC<Props> = ({
  pass,
  type,
  venue,
  onClose
}) => {
  const isBooking = type === 'TABLE_BOOKING';
  const booking = isBooking ? (pass as TableBooking) : null;
  const guestlist = !isBooking ? (pass as GuestlistEntry) : null;

  const refCode = isBooking ? booking!.booking_ref : guestlist!.pass_ref;
  const targetDate = pass.target_date;
  const guestCount = pass.guest_count;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-b from-orange-500/20 via-zinc-900/60 to-zinc-900 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
            {isBooking ? 'VIP Table Confirmation' : 'Complimentary Door Pass'}
          </span>

          <h3 className="text-xl font-black text-white mt-2">{venue?.name || 'Cebu Nightlife Pass'}</h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{targetDate}</p>
        </div>

        {/* QR Code Center Box */}
        <div className="px-6 py-4 flex flex-col items-center">
          <div className="p-4 rounded-3xl bg-white text-black shadow-2xl flex flex-col items-center justify-center border-4 border-orange-500/30">
            {/* SVG QR Code Graphic */}
            <div className="w-44 h-44 flex items-center justify-center bg-zinc-100 rounded-2xl relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full p-2 text-black fill-current">
                <path d="M0 0h30v30H0zm4 4v22h22V4zm4 4h14v14H8zM70 0h30v30H70zm4 4v22h22V4zm4 4h14v14H78zM0 70h30v30H0zm4 4v22h22V74zm4 4h14v14H8zm32-68h8v8h-8zm12 0h8v8h-8zm-12 12h8v8h-8zm20 0h8v8h-8zm-8 8h8v8h-8zm-12 12h8v8h-8zm16 0h8v8h-8zm12 0h8v8h-8zm-24 12h8v8h-8zm24 0h8v8h-8zm-16 12h8v8h-8zm12 0h8v8h-8zm8 0h8v8h-8zm-28 12h8v8h-8zm12 0h8v8h-8zm16 0h8v8h-8zm8 0h8v8h-8z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-lg bg-orange-500 border-2 border-white flex items-center justify-center text-black font-black text-[10px] shadow">
                  AH
                </div>
              </div>
            </div>
            <span className="font-mono text-base font-black tracking-widest text-black mt-2">
              {refCode}
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 text-center mt-3">
            Present this QR code to the door host or bouncer at entrance
          </p>
        </div>

        {/* Pass Breakdown */}
        <div className="p-6 bg-zinc-950/80 border-t border-zinc-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-zinc-400">
            <span>Pass Type:</span>
            <span className="text-white font-semibold">{isBooking ? 'VIP Table Hold' : 'Free Guestlist Pass'}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Party Size:</span>
            <span className="text-white">{guestCount} Guests</span>
          </div>

          {isBooking && (
            <>
              <div className="flex justify-between text-zinc-400">
                <span>Table ID:</span>
                <span className="text-orange-400 font-bold">{booking!.table_id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Deposit Paid:</span>
                <span className="text-emerald-400 font-bold">{formatPHP(booking!.deposit_amount_php)}</span>
              </div>
            </>
          )}

          {!isBooking && (
            <div className="flex justify-between text-zinc-400">
              <span>Door Cutoff Time:</span>
              <span className="text-amber-400 font-bold">{guestlist!.cutoff_time}</span>
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition"
            >
              Done / Close Pass
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
