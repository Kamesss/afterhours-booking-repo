import React, { useState } from 'react';
import { Club, ClubTable, TableType } from '../types';
import { db } from '../lib/storage';
import { formatPeso } from '../lib/formatters';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { X, MapPin, Clock, Star, Gift, Sparkles, Shield, Music, CheckCircle2, ChevronRight } from 'lucide-react';

interface ClubDetailModalProps {
  club: Club;
  onClose: () => void;
  onJoinGuestList: (club: Club) => void;
  onBookTable: (club: Club) => void;
}

export const ClubDetailModal: React.FC<ClubDetailModalProps> = ({
  club,
  onClose,
  onJoinGuestList,
  onBookTable,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'floormap' | 'tables'>('overview');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedTable, setSelectedTable] = useState<ClubTable | null>(null);

  const tableTypes = db.getTableTypes(club.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Hero Banner */}
        <div className="relative h-56 sm:h-72 w-full shrink-0">
          <img
            src={club.hero_image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80'}
            alt={club.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/50 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Info on Banner */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF2E88] text-white shadow-[0_0_10px_#FF2E88]">
                  {club.area || 'Cebu City'}
                </span>
                <span className="flex items-center gap-1 bg-black/80 px-2.5 py-0.5 rounded-full text-xs text-amber-400 font-bold border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {(club.curator_rating || 4.8).toFixed(1)} Curator Score
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {club.name}
              </h2>
              <p className="text-xs text-white/70 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF2E88] shrink-0" />
                <span>{club.address}</span>
              </p>
            </div>

            {/* Quick Action in Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onJoinGuestList(club)}
                className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>Free Guest List</span>
              </button>
              <button
                onClick={() => onBookTable(club)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,136,0.35)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Book Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#050505] px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#FF2E88] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Club Overview & Perks
          </button>
          <button
            onClick={() => setActiveTab('floormap')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'floormap'
                ? 'border-[#FF2E88] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Interactive Floor Blueprint
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'border-[#FF2E88] text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Table Tiers & Pricing ({tableTypes.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* About description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                  About the Venue
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {club.description || 'Exclusive Cebu nightlife venue.'}
                </p>
              </div>

              {/* Ambassador Perks Box */}
              <div className="bg-gradient-to-br from-[#FF2E88]/15 via-[#111] to-[#050505] border border-[#FF2E88]/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-[#FF2E88] text-sm font-extrabold">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Exclusive AfterHours Ambassador Privileges</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(club.ambassador_perks || ['⚡ Express VIP Door Entry with Ambassador Pass', '🍸 Special Ambassador Bottle Service Privileges']).map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/90 bg-black/60 p-2.5 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vibe, Music, Hours & Dress Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                    <Music className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Music & Sound</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(club.music_genres || ['EDM', 'Commercial', 'Hip-Hop']).map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-lg text-xs bg-white/5 text-white/80 border border-white/10">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Operating Hours</span>
                  </div>
                  <p className="text-xs text-white/80">{club.opening_hours || 'Wed - Sun | 10:00 PM – 5:00 AM'}</p>
                  <p className="text-[11px] text-amber-400 font-medium">Peak Energy: {club.peak_hours || '12:30 AM – 3:30 AM'}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Door Policy & Dress Code</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Min Age: <strong className="text-white">{club.min_age}+</strong> &bull; {club.dress_code}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'floormap' && (
            <div className="space-y-4">
              <InteractiveFloorPlan
                club={club}
                selectedDate={todayStr}
                selectedTable={selectedTable}
                onSelectTable={(table) => setSelectedTable(table)}
              />
              <div className="text-center pt-2">
                <button
                  onClick={() => onBookTable(club)}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_20px_rgba(255,46,136,0.35)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Reserve a Table on This Blueprint</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {tableTypes.map(tt => (
                  <div
                    key={tt.id}
                    className="p-4 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#FF2E88]/50 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{tt.name}</h4>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30">
                          {tt.tier_badge}
                        </span>
                        <span className="text-xs text-white/50">Up to {tt.max_guests} Guests</span>
                      </div>
                      <p className="text-xs text-white/60">{tt.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tt.perks.map((p, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-white/70 border border-white/10">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4 min-w-[140px]">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-white/40">Min Consumable</p>
                        <p className="text-sm font-extrabold text-white font-mono">{formatPeso(tt.min_spend_cents)}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">Deposit: {formatPeso(tt.deposit_cents)}</p>
                      </div>
                      <button
                        onClick={() => onBookTable(club)}
                        className="mt-2 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span>Book</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
