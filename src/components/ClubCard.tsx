import React from 'react';
import { Club } from '../types';
import { MapPin, Star, Clock, Gift, ShieldAlert, Sparkles, Flame } from 'lucide-react';
import { formatPeso } from '../lib/formatters';

interface ClubCardProps {
  club: Club;
  onSelectClub: (club: Club) => void;
  onJoinGuestList: (club: Club) => void;
  onBookTable: (club: Club) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({
  club,
  onSelectClub,
  onJoinGuestList,
  onBookTable,
}) => {
  return (
    <div className="group relative bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF2E88]/50 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      
      {/* Image Banner */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden cursor-pointer" onClick={() => onSelectClub(club)}>
        <img
          src={club.hero_image}
          alt={club.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#050505]/80 backdrop-blur-md text-[#FF2E88] border border-[#FF2E88]/30 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#FF2E88]" />
            {club.area}
          </span>
          {club.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center gap-1">
              <Flame className="w-3 h-3 fill-zinc-950" />
              TRENDING
            </span>
          )}
        </div>

        {/* Bottom Info on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#FF2E88] transition-colors">
              {club.name}
            </h3>
            <p className="text-xs text-white/60 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Peak: {club.peak_hours}</span>
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-amber-400 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{club.curator_rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Description & Music tags */}
        <div className="space-y-2.5">
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
            {club.description}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {club.music_genres.map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 text-white/70 border border-white/10"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Ambassador Perk Highlight Box */}
        <div className="bg-gradient-to-r from-[#FF2E88]/15 via-[#8B5CF6]/10 to-transparent border border-[#FF2E88]/30 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[#FF2E88] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Automated Ambassador Perk</span>
          </div>
          <p className="text-[11px] text-white/80 font-medium">
            {club.ambassador_perks[0]}
          </p>
        </div>

        {/* Pricing / Cover info & Action CTAs */}
        <div className="space-y-3 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Standard Door Cover:</span>
            <span className="font-semibold text-white">
              {club.cover_fee_cents === 0 ? 'Free' : formatPeso(club.cover_fee_cents)}
              <span className="text-[10px] text-emerald-400 ml-1">(Free on Guestlist)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id={`guestlist-btn-${club.slug}`}
              onClick={() => onJoinGuestList(club)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guest List</span>
            </button>

            <button
              id={`book-table-btn-${club.slug}`}
              onClick={() => onBookTable(club)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Table</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
