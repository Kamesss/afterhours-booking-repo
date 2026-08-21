import React from 'react';
import { Sparkles, MapPin, Zap, Shield, Gift, Music2 } from 'lucide-react';
import { CEBU_DISTRICTS } from '../lib/formatters';

interface AmbassadorHeroBannerProps {
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenConcierge: () => void;
}

const GENRE_FILTERS = ['All Vibes', 'EDM', 'Hip-Hop', 'RnB', 'Deep House', 'Afrobeats', 'Festival Anthems'];

export const AmbassadorHeroBanner: React.FC<AmbassadorHeroBannerProps> = ({
  selectedDistrict,
  onSelectDistrict,
  selectedGenre,
  onSelectGenre,
  searchQuery,
  onSearchChange,
  onOpenConcierge,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111] via-[#0A0A0B] to-[#050505] border border-white/10 p-6 sm:p-8 lg:p-10 mb-8 shadow-2xl">
      {/* Background glow flares */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF2E88]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
        
        {/* City & Zero-Risk Model Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FF2E88]/10 border border-[#FF2E88]/25 text-[#FF2E88] text-xs sm:text-sm font-medium tracking-wide">
          <Sparkles className="w-4 h-4 text-[#FF2E88]" />
          <span>Automated Club Ambassador for Cebu City Nightlife</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
          Cebu's Nightlife Pass. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E88] via-[#C084FC] to-[#8B5CF6]">
            Instant Guest List & VIP Tables
          </span>
        </h1>

        {/* Sub-explanation */}
        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto font-normal">
          Skip the hassle of messaging promoters. Get verified free guest list passes, lock tables with in-app deposits, and unlock exclusive ambassador perks across Cebu's premier clubs.
        </p>

        {/* Ambassador Value Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-left pt-2">
          <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl p-3.5 flex items-start space-x-2.5 shadow-sm">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Instant QR Entry</p>
              <p className="text-[11px] text-white/40">Skip the 45-min door line</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl p-3.5 flex items-start space-x-2.5 shadow-sm">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Full-Day Table Lock</p>
              <p className="text-[11px] text-white/40">Zero double bookings</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl p-3.5 flex items-start space-x-2.5 shadow-sm">
            <Gift className="w-5 h-5 text-[#FF2E88] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Ambassador Perks</p>
              <p className="text-[11px] text-white/40">Free shots & punch bowls</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl p-3.5 flex items-start space-x-2.5 shadow-sm">
            <Music2 className="w-5 h-5 text-[#8B5CF6] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Zero Risk for Clubs</p>
              <p className="text-[11px] text-white/40">Pure commission model</p>
            </div>
          </div>
        </div>

        {/* AI Ambassador Concierge Trigger Banner */}
        <div className="pt-2">
          <button
            onClick={onOpenConcierge}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF2E88] via-[#A855F7] to-[#8B5CF6] hover:opacity-95 text-white text-sm font-semibold shadow-[0_0_20px_rgba(255,46,136,0.35)] transition-all cursor-pointer transform active:scale-95 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Ask Aria (Automated Ambassador) — "Where should we go tonight?"</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="pt-4 space-y-3">
          {/* District selector pills */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-white/50 flex items-center gap-1 mr-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF2E88]" /> Area:
            </span>
            {CEBU_DISTRICTS.map(dist => (
              <button
                key={dist}
                onClick={() => onSelectDistrict(dist)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedDistrict === dist
                    ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_10px_rgba(255,46,136,0.3)]'
                    : 'bg-[#111] text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>

          {/* Music genre pills & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <div className="flex items-center flex-wrap justify-center gap-1.5">
              {GENRE_FILTERS.map(genre => (
                <button
                  key={genre}
                  onClick={() => onSelectGenre(genre)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-[#FF2E88]/20 text-[#FF2E88] border border-[#FF2E88]/40'
                      : 'bg-[#111]/70 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search club name, vibe..."
                className="w-full bg-[#111] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF2E88] focus:ring-1 focus:ring-[#FF2E88]"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
