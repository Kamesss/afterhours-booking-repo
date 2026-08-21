// ============================================================================
// AFTERHOURS CEBU - MAIN APPLICATION ROOT
// ============================================================================
import React, { useState, useEffect } from 'react';
import { clientStore } from './lib/storage';
import { Venue, TableBooking, GuestlistEntry } from './types';
import { Header } from './components/Header';
import { AmbassadorHeroBanner } from './components/AmbassadorHeroBanner';
import { ClubCard } from './components/ClubCard';
import { ClubDetailModal } from './components/ClubDetailModal';
import { BookingModal } from './components/BookingModal';
import { GuestListModal } from './components/GuestListModal';
import { DigitalPassModal } from './components/DigitalPassModal';
import { AmbassadorConcierge } from './components/AmbassadorConcierge';
import { VenueAdminDashboard } from './components/VenueAdminDashboard';
import { BouncerScanner } from './components/BouncerScanner';
import { D1SchemaViewer } from './components/D1SchemaViewer';
import { MyPassesView } from './components/MyPassesView';
import { Flame, Sparkles, Database, ShieldCheck, MapPin, Search } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'venues' | 'passes' | 'scanner' | 'admin' | 'concierge'>('venues');
  const [showD1Modal, setShowD1Modal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [viewingVenue, setViewingVenue] = useState<Venue | null>(null);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [guestlistVenue, setGuestlistVenue] = useState<Venue | null>(null);
  const [activePass, setActivePass] = useState<{
    pass: TableBooking | GuestlistEntry;
    type: 'TABLE_BOOKING' | 'GUESTLIST_PASS';
    venue?: Venue;
  } | null>(null);

  // Sync with D1 server backend on mount
  useEffect(() => {
    clientStore.syncWithServer();
  }, []);

  const venues = clientStore.getVenues();

  const filteredVenues = venues.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      (v.tagline && v.tagline.toLowerCase().includes(q)) ||
      (v.music_genres && v.music_genres.some(g => g.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-black">
      
      {/* Top App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenD1Modal={() => setShowD1Modal(true)}
      />

      {/* Main View Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-8">
        
        {/* EXPLORE VENUES TAB */}
        {activeTab === 'venues' && (
          <div className="space-y-8">
            {/* Ambassador Promo Banner */}
            <AmbassadorHeroBanner
              onOpenConcierge={() => setActiveTab('concierge')}
              onBookDirect={() => {
                const el = document.getElementById('venues-catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Catalog Section Header & Search */}
            <div id="venues-catalog" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Partner Nightclubs & Lounges in Cebu ({filteredVenues.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Automated table locks, guestlist passes & door cutoff enforcement
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search clubs, genres, or locations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Venue Cards Grid */}
            {filteredVenues.length === 0 ? (
              <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                <p className="text-sm text-zinc-400">No clubs matched your search criteria.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-orange-400 font-mono hover:underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map(venue => (
                  <ClubCard
                    key={venue.id}
                    venue={venue}
                    onBookTable={v => setBookingVenue(v)}
                    onJoinGuestlist={v => setGuestlistVenue(v)}
                    onViewDetails={v => setViewingVenue(v)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY PASSES WALLET TAB */}
        {activeTab === 'passes' && (
          <MyPassesView />
        )}

        {/* VIP CONCIERGE CHAT TAB */}
        {activeTab === 'concierge' && (
          <AmbassadorConcierge
            onSelectVenue={v => setViewingVenue(v)}
            onBookTable={v => setBookingVenue(v)}
          />
        )}

        {/* BOUNCER GATE SCANNER */}
        {activeTab === 'scanner' && (
          <BouncerScanner />
        )}

        {/* VENUE ADMIN PORTAL & LEDGER */}
        {activeTab === 'admin' && (
          <VenueAdminDashboard />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-6 px-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cloudflare D1 SQLite Engine • Port 3000 Active</span>
          </div>
          <p>© 2026 AfterHours Cebu Nightlife Automation • GCash / Maya Financial Settlement</p>
          <button
            onClick={() => setShowD1Modal(true)}
            className="text-orange-400 hover:text-orange-300 transition underline flex items-center space-x-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Schema & Ledger DDL</span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {viewingVenue && (
        <ClubDetailModal
          venue={viewingVenue}
          onClose={() => setViewingVenue(null)}
          onBookTable={v => {
            setViewingVenue(null);
            setBookingVenue(v);
          }}
          onJoinGuestlist={v => {
            setViewingVenue(null);
            setGuestlistVenue(v);
          }}
        />
      )}

      {bookingVenue && (
        <BookingModal
          venue={bookingVenue}
          onClose={() => setBookingVenue(null)}
          onSuccess={booking => {
            setBookingVenue(null);
            setActivePass({ pass: booking, type: 'TABLE_BOOKING', venue: bookingVenue });
          }}
        />
      )}

      {guestlistVenue && (
        <GuestListModal
          venue={guestlistVenue}
          onClose={() => setGuestlistVenue(null)}
          onSuccess={pass => {
            setGuestlistVenue(null);
            setActivePass({ pass: pass, type: 'GUESTLIST_PASS', venue: guestlistVenue });
          }}
        />
      )}

      {activePass && (
        <DigitalPassModal
          pass={activePass.pass}
          type={activePass.type}
          venue={activePass.venue}
          onClose={() => setActivePass(null)}
        />
      )}

      {showD1Modal && (
        <D1SchemaViewer onClose={() => setShowD1Modal(false)} />
      )}

    </div>
  );
}
