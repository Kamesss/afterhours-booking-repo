import React, { useState } from 'react';
import { Booking, GuestListEntry } from '../types';
import { db } from '../lib/storage';
import { formatPeso, formatDatePretty } from '../lib/formatters';
import { DigitalPassModal } from './DigitalPassModal';
import { Ticket, Sparkles, MapPin, Clock, QrCode, CheckCircle2, ShieldCheck, ArrowRight, Gift } from 'lucide-react';

interface MyPassesViewProps {
  onExploreClubs: () => void;
}

export const MyPassesView: React.FC<MyPassesViewProps> = ({ onExploreClubs }) => {
  const currentUser = db.getCurrentUser();
  const bookings = currentUser?.id ? db.getUserBookings(currentUser.id) : [];
  const guestListEntries = currentUser?.id ? db.getUserGuestList(currentUser.id) : [];

  const [activePassItem, setActivePassItem] = useState<{
    item: Booking | GuestListEntry;
    type: 'booking' | 'guestlist';
  } | null>(null);

  const totalPasses = bookings.length + guestListEntries.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Wallet Header */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#8B5CF6]/15 via-[#FF2E88]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF2E88]/10 text-[#FF2E88] border border-[#FF2E88]/20">
            <Ticket className="w-3.5 h-3.5 text-[#FF2E88]" />
            <span>Digital Pass Wallet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            My Nightlife Passes ({totalPasses})
          </h1>
          <p className="text-xs text-white/50">
            Passholder: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <button
          onClick={onExploreClubs}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,136,0.3)] flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer relative z-10"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Explore More Clubs</span>
        </button>
      </div>

      {totalPasses === 0 ? (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8 text-white/30" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No passes yet</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto mt-1">
              Join free guest lists or lock in VIP table reservations with zero risk and instant ambassador perks!
            </p>
          </div>
          <button
            onClick={onExploreClubs}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,136,0.3)] inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            Browse Cebu Venues
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Table Reservations Section */}
          {bookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#FF2E88]" />
                VIP Table Reservations ({bookings.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map(b => {
                  const club = db.getClubById(b.club_id);
                  const table = db.getClubTables(b.club_id).find(t => t.id === b.table_id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => setActivePassItem({ item: b, type: 'booking' })}
                      className="group relative bg-[#0A0A0B] border border-white/10 hover:border-[#FF2E88]/50 rounded-3xl p-5 space-y-4 transition-all duration-200 shadow-xl cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/25 uppercase">
                            VIP TABLE PASS
                          </span>
                          <h3 className="text-lg font-extrabold text-white mt-1.5 group-hover:text-[#FF2E88] transition-colors">
                            {club?.name || 'Club'}
                          </h3>
                          <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#FF2E88]" />
                            {club?.area}
                          </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center group-hover:border-[#FF2E88]/50 transition-colors shadow-inner">
                          <QrCode className="w-6 h-6 text-[#FF2E88] group-hover:scale-110 transition-transform" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#050505] p-3 rounded-2xl border border-white/10 text-xs">
                        <div>
                          <span className="text-white/40 text-[10px] block uppercase">Night</span>
                          <span className="font-bold text-white">{formatDatePretty(b.booking_date)}</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] block uppercase">Table</span>
                          <span className="font-extrabold text-[#8B5CF6]">{table?.table_number || b.table_id}</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] block uppercase">Deposit Paid</span>
                          <span className="font-bold text-emerald-400 font-mono">{formatPeso(b.deposit_paid_cents)}</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] block uppercase">Arrival Time</span>
                          <span className="font-bold text-white">{b.arrival_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-white/40 font-mono">
                          {b.qr_code}
                        </span>
                        <span className="text-xs font-bold text-[#FF2E88] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Tap for QR Pass <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guest List Passes Section */}
          {guestListEntries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                <Gift className="w-4 h-4 text-emerald-400" />
                Ambassador Guest List Passes ({guestListEntries.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guestListEntries.map(gl => {
                  const club = db.getClubById(gl.club_id);
                  return (
                    <div
                      key={gl.id}
                      onClick={() => setActivePassItem({ item: gl, type: 'guestlist' })}
                      className="group relative bg-[#0A0A0B] border border-white/10 hover:border-emerald-500/50 rounded-3xl p-5 space-y-4 transition-all duration-200 shadow-xl cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 uppercase">
                            FREE GUEST LIST PASS
                          </span>
                          <h3 className="text-lg font-extrabold text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                            {club?.name || 'Club'}
                          </h3>
                          <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {club?.area}
                          </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors shadow-inner">
                          <QrCode className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>

                      <div className="bg-[#050505] p-3 rounded-2xl border border-white/10 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-white/40">Date & Target Arrival:</span>
                          <span className="font-bold text-white">{formatDatePretty(gl.event_date)} &bull; {gl.arrival_time_estimate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Admitted PAX:</span>
                          <span className="font-bold text-emerald-400">{gl.pax} Guests</span>
                        </div>
                        <div className="pt-1 text-[11px] text-white/70">
                          Perk: {gl.ambassador_perk}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-white/40 font-mono">
                          {gl.qr_code}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Tap for QR Pass <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Active Pass Modal */}
      {activePassItem && (
        <DigitalPassModal
          item={activePassItem.item}
          type={activePassItem.type}
          onClose={() => setActivePassItem(null)}
        />
      )}

    </div>
  );
};
