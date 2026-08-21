import React, { useState } from 'react';
import { Booking, GuestListEntry } from '../types';
import { db } from '../lib/storage';
import { formatPeso, formatDatePretty } from '../lib/formatters';
import { X, Sparkles, CheckCircle2, ShieldCheck, Download, Share2, Copy, Check, Clock, Users } from 'lucide-react';

interface DigitalPassModalProps {
  item: Booking | GuestListEntry;
  type: 'booking' | 'guestlist';
  onClose: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  item,
  type,
  onClose,
}) => {
  const isBooking = type === 'booking';
  const booking = isBooking ? (item as Booking) : null;
  const guestlist = !isBooking ? (item as GuestListEntry) : null;

  const clubId = isBooking ? booking!.club_id : guestlist!.club_id;
  const club = db.getClubById(clubId);
  const tables = db.getClubTables(clubId);
  const table = booking ? tables.find(t => t.id === booking.table_id) : null;
  const tableType = table ? db.getTableTypes(clubId).find(tt => tt.id === table.table_type_id) : null;

  const [copied, setCopied] = useState(false);

  const qrCode = isBooking ? booking!.qr_code : guestlist!.qr_code;
  const guestName = isBooking ? booking!.customer_name : guestlist!.guest_name;
  const eventDate = isBooking ? booking!.booking_date : guestlist!.event_date;
  const arrivalTime = isBooking ? booking!.arrival_time : guestlist!.arrival_time_estimate;
  const pax = isBooking ? booking!.guest_count : guestlist!.pax;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Holographic Nightclub VIP Ticket Body */}
        <div className="relative p-6 sm:p-7 space-y-6">
          
          {/* Header Pass Banner */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#FF2E88] via-[#8B5CF6] to-[#FF2E88] p-5 text-white shadow-[0_0_25px_rgba(255,46,136,0.35)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/30 border border-white/30 backdrop-blur-sm">
                {isBooking ? '★ VIP TABLE PASS' : '⚡ GUEST LIST PASS'}
              </span>
              <span className="text-[11px] font-mono text-white/90">
                AfterHours Cebu
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{club?.name || 'Cebu Nightclub'}</h3>
              <p className="text-xs text-white/90 mt-0.5">{club?.address}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/25 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-white/80 block uppercase">Night</span>
                <span className="font-bold">{formatDatePretty(eventDate)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/80 block uppercase">Target Arrival</span>
                <span className="font-bold">{arrivalTime}</span>
              </div>
            </div>
          </div>

          {/* Ticket Perforation Notch (SVG punch) */}
          <div className="relative flex items-center justify-between -mx-6">
            <div className="w-5 h-8 bg-[#050505] rounded-r-full border-r border-t border-b border-white/10" />
            <div className="flex-1 border-t-2 border-dashed border-white/15 mx-2" />
            <div className="w-5 h-8 bg-[#050505] rounded-l-full border-l border-t border-b border-white/10" />
          </div>

          {/* QR Code Pass Box */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center space-y-3 shadow-xl">
            <div className="relative p-2 border-2 border-zinc-900 rounded-xl bg-white flex flex-col items-center">
              {/* Stylized QR representation with animated scanning laser line */}
              <div className="relative w-44 h-44 bg-[#050505] rounded-lg p-2 flex flex-col items-center justify-between overflow-hidden">
                {/* Simulated High-Res QR Blocks */}
                <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 p-1">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const filled = (i * 7 + 3) % 4 !== 0 || i === 0 || i === 5 || i === 30 || i === 14;
                    return (
                      <div
                        key={i}
                        className={`rounded-xs ${filled ? 'bg-white' : 'bg-transparent'}`}
                      />
                    );
                  })}
                </div>
                {/* Center Badge */}
                <div className="absolute inset-0 m-auto w-10 h-10 bg-gradient-to-br from-[#FF2E88] to-[#8B5CF6] rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                {/* Animated Scanning Line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF2E88] to-transparent shadow-[0_0_8px_#FF2E88] animate-bounce top-1/2" />
              </div>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-mono font-bold text-zinc-900 tracking-wider">
                {qrCode}
              </span>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Present this screen to the host or bouncer at the door
              </p>
            </div>
          </div>

          {/* Details Breakdown */}
          <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs text-white/80">
            <div className="flex justify-between">
              <span className="text-white/50">Primary Passholder:</span>
              <span className="font-bold text-white">{guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Guests Admitted:</span>
              <span className="font-bold text-white">{pax} Guests</span>
            </div>

            {isBooking && table && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/50">Assigned VIP Table:</span>
                  <span className="font-extrabold text-[#FF2E88]">{table.table_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Min Consumable:</span>
                  <span className="font-bold text-white font-mono">{formatPeso(booking!.min_spend_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Deposit Paid In-App:</span>
                  <span className="font-extrabold text-emerald-400 font-mono">{formatPeso(booking!.deposit_paid_cents)}</span>
                </div>
              </>
            )}

            {/* Perks included */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-[#FF2E88] uppercase block">Ambassador Perks Active:</span>
              <p className="text-[11px] text-white/80">
                {isBooking
                  ? `⚡ Express VIP Entry + ${booking?.ambassador_promo_code ? 'Promo Perks Applied' : 'Priority Table Allocation'}`
                  : guestlist?.ambassador_perk}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyCode}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied' : 'Copy Pass Code'}</span>
            </button>

            <button
              onClick={() => alert(`Saved ${club?.name} VIP pass to device storage!`)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save Pass</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
