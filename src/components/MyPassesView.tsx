// ============================================================================
// MY PASSES & RESERVATION WALLET VIEW
// ============================================================================
import React, { useState } from 'react';
import { clientStore } from '../lib/storage';
import { TableBooking, GuestlistEntry, Venue } from '../types';
import { formatPHP } from '../lib/formatters';
import { DigitalPassModal } from './DigitalPassModal';
import { 
  QrCode, 
  Sparkles, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Ticket 
} from 'lucide-react';

export const MyPassesView: React.FC = () => {
  const [selectedPass, setSelectedPass] = useState<{
    pass: TableBooking | GuestlistEntry;
    type: 'TABLE_BOOKING' | 'GUESTLIST_PASS';
    venue?: Venue;
  } | null>(null);

  const currentUser = clientStore.getCurrentUser();
  const allBookings = clientStore.getBookings();
  const allGuestlists = clientStore.getGuestlists();
  const venues = clientStore.getVenues();

  const userBookings = allBookings.filter(b => b.user_id === currentUser.id);
  const userGuestlists = allGuestlists.filter(g => g.user_id === currentUser.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">VIP Passes & Bookings Wallet</h2>
            <p className="text-xs text-zinc-400 font-mono">
              Account: {currentUser.full_name} ({currentUser.email})
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          {userBookings.length + userGuestlists.length} Active Passes
        </span>
      </div>

      {/* Table Reservations Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-orange-400" />
          <span>VIP Table Holds ({userBookings.length})</span>
        </h3>

        {userBookings.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
            No VIP table bookings yet. Explore venues to lock a bottle service booth.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userBookings.map(b => {
              const venue = venues.find(v => v.id === b.venue_id);
              const table = clientStore.getTableById(b.table_id);

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold">
                        {b.booking_ref}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{venue?.name || 'Cebu Club'}</h4>
                      <p className="text-xs text-zinc-400">{venue?.address}</p>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500">Table:</span>
                      <p className="text-white font-bold">{table?.table_number || b.table_id}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Target Date:</span>
                      <p className="text-white">{b.target_date}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Guests:</span>
                      <p className="text-white">{b.guest_count} pax</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Deposit Paid:</span>
                      <p className="text-emerald-400 font-bold">{formatPHP(b.deposit_amount_php)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPass({ pass: b, type: 'TABLE_BOOKING', venue })}
                    className="w-full py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold font-mono transition flex items-center justify-center space-x-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Show QR Code Pass</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guestlist Passes Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Complimentary Guestlist Passes ({userGuestlists.length})</span>
        </h3>

        {userGuestlists.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
            No guestlist door passes claimed yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGuestlists.map(g => {
              const venue = venues.find(v => v.id === g.venue_id);

              return (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-bold">
                        {g.pass_ref}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{venue?.name || 'Cebu Club'}</h4>
                      <p className="text-xs text-zinc-400">{venue?.address}</p>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-purple-950 text-purple-300 border border-purple-800">
                      {g.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500">Party Size:</span>
                      <p className="text-white font-bold">{g.guest_count} pax</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Target Date:</span>
                      <p className="text-white">{g.target_date}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-500">Door Cutoff:</span>
                      <p className="text-amber-400 font-bold">Must arrive before {g.cutoff_time}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPass({ pass: g, type: 'GUESTLIST_PASS', venue })}
                    className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono transition flex items-center justify-center space-x-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Show Guestlist QR</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal View */}
      {selectedPass && (
        <DigitalPassModal
          pass={selectedPass.pass}
          type={selectedPass.type}
          venue={selectedPass.venue}
          onClose={() => setSelectedPass(null)}
        />
      )}

    </div>
  );
};
