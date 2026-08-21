// ============================================================================
// VIP AMBASSADOR HERO BANNER (REFERRAL PROGRAM & EXCLUSIVE PERKS)
// ============================================================================
import React from 'react';
import { User } from '../types';
import { clientStore } from '../lib/storage';
import { Sparkles, Award, ShieldCheck, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onOpenConcierge: () => void;
  onBookDirect: () => void;
}

export const AmbassadorHeroBanner: React.FC<Props> = ({
  onOpenConcierge,
  onBookDirect
}) => {
  const currentUser = clientStore.getCurrentUser();
  const promoters = clientStore.getUsers().filter(u => u.role === 'PROMOTER');
  const featuredPromoter = promoters[0] || { full_name: 'Carlo De Leon', promoter_code: 'CEBU_VIP_CARLO' };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column Text */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-mono text-orange-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AfterHours Cebu VIP Concierge & Promoter Network</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Elevate Your Cebu Nightlife Experience
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Direct table reservations at Kazmik, Trademark, Morals & Malice, Verified Lounge, and Club ICON. Lock VIP booths upfront with atomic D1 holds or claim complimentary door passes before nightly cutoffs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Instant GCash / Maya Deposit</span>
            </div>
            <div className="flex items-center space-x-1.5 text-orange-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Attributed Promoter Codes</span>
            </div>
            <div className="flex items-center space-x-1.5 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Door QR Gate Validation</span>
            </div>
          </div>
        </div>

        {/* Right Card / Promoter Attribution Box */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl flex flex-col justify-between space-y-4 min-w-[280px]">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Featured Cebu Ambassador
            </span>
            <h4 className="text-base font-bold text-white mt-1">{featuredPromoter.full_name}</h4>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Code: <strong className="text-orange-400">{featuredPromoter.promoter_code}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onOpenConcierge}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chat with VIP Concierge</span>
            </button>

            <button
              onClick={onBookDirect}
              className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition border border-zinc-800"
            >
              Browse 5 Partner Clubs →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
