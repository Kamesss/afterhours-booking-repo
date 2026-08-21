// ============================================================================
// VENUE & CLUB CARD COMPONENT
// ============================================================================
import React from 'react';
import { Venue } from '../types';
import { clientStore } from '../lib/storage';
import { formatPHP } from '../lib/formatters';
import { Users, Clock, MapPin, Sparkles, ShieldCheck, ChevronRight, Lock } from 'lucide-react';

interface Props {
  venue: Venue;
  onBookTable: (venue: Venue) => void;
  onJoinGuestlist: (venue: Venue) => void;
  onViewDetails: (venue: Venue) => void;
}

export const ClubCard: React.FC<Props> = ({
  venue,
  onBookTable,
  onJoinGuestlist,
  onViewDetails
}) => {
  const tables = clientStore.getTablesByVenue(venue.id);
  const minTableSpend = tables.length > 0 
    ? Math.min(...tables.map(t => t.min_spend_php)) 
    : 10000;

  return (
    <div className="group rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl">
      
      {/* Image Banner & Live Capacity Tag */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
        <img
          src={venue.image_url || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80'}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700/60 text-xs font-mono text-zinc-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open {venue.open_time} - {venue.close_time}</span>
          </span>

          <span className="px-3 py-1 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-500/40 text-xs font-mono font-semibold text-orange-300">
            Cutoff: {venue.guestlist_cutoff_time}
          </span>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-black text-white tracking-tight">{venue.name}</h3>
          <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5">{venue.tagline}</p>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Address */}
          <div className="flex items-start space-x-2 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-orange-400" />
            <span className="line-clamp-1">{venue.address}</span>
          </div>

          {/* Music Genre Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(venue.music_genres || ['Club Hits', 'Electronic', 'VIP Lounge']).map(genre => (
              <span key={genre} className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] text-zinc-300 font-mono">
                {genre}
              </span>
            ))}
          </div>

          {/* Table Pricing Teaser */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono">VIP Tables from:</span>
            <span className="text-emerald-400 font-bold font-mono">{formatPHP(minTableSpend)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onBookTable(venue)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-black font-bold text-xs transition flex items-center justify-center space-x-1 shadow-md shadow-orange-500/10"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Book Table</span>
            </button>

            <button
              onClick={() => onJoinGuestlist(venue)}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition flex items-center justify-center space-x-1 border border-zinc-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Free Pass</span>
            </button>
          </div>

          <button
            onClick={() => onViewDetails(venue)}
            className="w-full py-1.5 text-center text-xs text-zinc-400 hover:text-zinc-200 transition font-mono"
          >
            View Layout & Bottle Menus →
          </button>
        </div>

      </div>

    </div>
  );
};
