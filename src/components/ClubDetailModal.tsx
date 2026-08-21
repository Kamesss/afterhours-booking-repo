// ============================================================================
// VENUE DETAILS & FULL FLOOR PLAN INSPECTION MODAL
// ============================================================================
import React from 'react';
import { Venue } from '../types';
import { clientStore } from '../lib/storage';
import { formatPHP, formatCategory } from '../lib/formatters';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { MapPin, Clock, Users, ShieldCheck, Sparkles, Lock, X, ChevronRight } from 'lucide-react';

interface Props {
  venue: Venue;
  onClose: () => void;
  onBookTable: (venue: Venue) => void;
  onJoinGuestlist: (venue: Venue) => void;
}

export const ClubDetailModal: React.FC<Props> = ({
  venue,
  onClose,
  onBookTable,
  onJoinGuestlist
}) => {
  const tables = clientStore.getTablesByVenue(venue.id);
  const bookings = clientStore.getBookings(venue.id, '2026-08-21');
  const bookedTableIds = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').map(b => b.table_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl flex flex-col">
        
        {/* Banner Image */}
        <div className="relative aspect-[21/9] w-full bg-zinc-950">
          <img
            src={venue.image_url || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80'}
            alt={venue.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur-md text-zinc-300 hover:text-white border border-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                Cebu Nightlife Destination
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{venue.name}</h2>
              <p className="text-xs text-zinc-300 mt-0.5">{venue.tagline}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  onBookTable(venue);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-black font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center space-x-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Reserve VIP Table</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onJoinGuestlist(venue);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700"
              >
                <span>Claim Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Location</span>
                <p className="text-xs text-zinc-200 font-medium">{venue.address}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Operating Hours</span>
                <p className="text-xs text-zinc-200 font-medium font-mono">{venue.open_time} - {venue.close_time}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Guestlist Cutoff</span>
                <p className="text-xs text-zinc-200 font-medium font-mono text-emerald-400 font-bold">{venue.guestlist_cutoff_time}</p>
              </div>
            </div>
          </div>

          {/* Interactive Layout Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">2D Interactive Floor Layout</h3>
            <InteractiveFloorPlan
              tables={tables}
              selectedTableId={null}
              onSelectTable={(t) => {
                onClose();
                onBookTable(venue);
              }}
              bookedTableIds={bookedTableIds}
              currentDate="2026-08-21"
            />
          </div>

          {/* Table Pricing Tier Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Table Categories & Minimum Spend (PHP)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tables.map(table => (
                <div key={table.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono text-sm">{table.table_number}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {formatCategory(table.category)}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <p className="text-zinc-400">Capacity: <span className="text-white">{table.capacity} guests</span></p>
                    <p className="text-zinc-400">Min Spend: <span className="text-emerald-400 font-bold">{formatPHP(table.min_spend_php)}</span></p>
                    <p className="text-zinc-400">Deposit: <span className="text-amber-400 font-bold">{formatPHP(table.deposit_required_php)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
