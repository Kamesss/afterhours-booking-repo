import React, { useState, useEffect } from 'react';
import { db } from './lib/storage';
import { Club, Booking, GuestListEntry, User, UserRole } from './types';
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
import { Sparkles, MapPin, ShieldCheck, Flame, Compass, MessageSquare } from 'lucide-react';

export default function App() {
  const [, setDbTick] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'explore' | 'passes' | 'admin' | 'scanner' | 'schema'>('explore');

  // Subscribe to live database updates from Cloudflare D1
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setDbTick(prev => prev + 1);
      setCurrentUser(db.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Cebu Districts');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Vibes');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [viewingClub, setViewingClub] = useState<Club | null>(null);
  const [bookingClub, setBookingClub] = useState<Club | null>(null);
  const [guestListClub, setGuestListClub] = useState<Club | null>(null);
  const [activePass, setActivePass] = useState<{
    item: Booking | GuestListEntry;
    type: 'booking' | 'guestlist';
  } | null>(null);
  const [showConcierge, setShowConcierge] = useState<boolean>(false);

  // All clubs from database
  const clubs = db.getClubs();

  // User's active passes count
  const userBookings = db.getUserBookings(currentUser.id);
  const userGuestList = db.getUserGuestList(currentUser.id);
  const totalPasses = userBookings.length + userGuestList.length;

  const handleSwitchUser = (role: UserRole) => {
    const updated = db.switchUser(role);
    setCurrentUser(updated);
  };

  // Filtered Clubs
  const filteredClubs = clubs.filter(club => {
    if (selectedDistrict !== 'All Cebu Districts' && club.area !== selectedDistrict) {
      return false;
    }
    if (selectedGenre !== 'All Vibes') {
      const hasGenre = club.music_genres.some(g => g.toLowerCase().includes(selectedGenre.toLowerCase()));
      if (!hasGenre) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = club.name.toLowerCase().includes(q);
      const matchArea = club.area.toLowerCase().includes(q);
      const matchDesc = club.description.toLowerCase().includes(q);
      const matchGenre = club.music_genres.some(g => g.toLowerCase().includes(q));
      if (!matchName && !matchArea && !matchDesc && !matchGenre) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-[#FF2E88] selection:text-white flex flex-col justify-between">
      
      {/* Top Application Bar */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        passCount={totalPasses}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        
        {/* EXPLORE CLUBS TAB */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Hero & Ambassador Value Proposition */}
            <AmbassadorHeroBanner
              selectedDistrict={selectedDistrict}
              onSelectDistrict={setSelectedDistrict}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenConcierge={() => setShowConcierge(true)}
            />

            {/* Club Catalog Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#FF2E88]" />
                  Cebu City Nightclubs & Lounges ({filteredClubs.length})
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Verified venues with automated guest lists & zero double-booking table locks
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span>Live Table Availability Active</span>
              </div>
            </div>

            {/* Clubs Grid */}
            {filteredClubs.length === 0 ? (
              <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-3xl p-12 text-center space-y-3">
                <p className="text-sm text-zinc-400">No clubs matched your district or genre search filter.</p>
                <button
                  onClick={() => {
                    setSelectedDistrict('All Cebu Districts');
                    setSelectedGenre('All Vibes');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/15 border border-white/10"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map(club => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    onSelectClub={c => setViewingClub(c)}
                    onJoinGuestList={c => setGuestListClub(c)}
                    onBookTable={c => setBookingClub(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY PASSES WALLET TAB */}
        {activeTab === 'passes' && (
          <MyPassesView
            onExploreClubs={() => setActiveTab('explore')}
          />
        )}

        {/* BOUNCER / DOOR SCANNER TAB */}
        {activeTab === 'scanner' && (
          <BouncerScanner />
        )}

        {/* CLUB VENUE ADMIN DASHBOARD TAB */}
        {activeTab === 'admin' && (
          <VenueAdminDashboard />
        )}

        {/* D1 SCHEMA & SQL VIEWER TAB */}
        {activeTab === 'schema' && (
          <D1SchemaViewer />
        )}

      </main>

      {/* Floating Aria Ambassador AI Button (Bottom Right) */}
      {activeTab === 'explore' && !showConcierge && (
        <button
          onClick={() => setShowConcierge(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#FF2E88] via-[#A855F7] to-[#8B5CF6] text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(255,46,136,0.45)] hover:shadow-[0_0_35px_rgba(255,46,136,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          </div>
          <span>Ask Aria Ambassador</span>
        </button>
      )}

      {/* MODALS */}
      {/* 1. Club Detail & Floor Plan Preview */}
      {viewingClub && (
        <ClubDetailModal
          club={viewingClub}
          onClose={() => setViewingClub(null)}
          onJoinGuestList={c => {
            setViewingClub(null);
            setGuestListClub(c);
          }}
          onBookTable={c => {
            setViewingClub(null);
            setBookingClub(c);
          }}
        />
      )}

      {/* 2. Interactive VIP Table Booking Flow */}
      {bookingClub && (
        <BookingModal
          club={bookingClub}
          onClose={() => setBookingClub(null)}
          onBookingSuccess={booking => {
            setBookingClub(null);
            setActivePass({ item: booking, type: 'booking' });
          }}
        />
      )}

      {/* 3. Free Ambassador Guest List Signup */}
      {guestListClub && (
        <GuestListModal
          club={guestListClub}
          onClose={() => setGuestListClub(null)}
          onSuccess={entry => {
            setGuestListClub(null);
            setActivePass({ item: entry, type: 'guestlist' });
          }}
        />
      )}

      {/* 4. Digital QR Pass Wallet Preview */}
      {activePass && (
        <DigitalPassModal
          item={activePass.item}
          type={activePass.type}
          onClose={() => setActivePass(null)}
        />
      )}

      {/* 5. Aria Nightlife Ambassador Concierge */}
      {showConcierge && (
        <AmbassadorConcierge
          onClose={() => setShowConcierge(false)}
          onSelectClub={c => {
            setShowConcierge(false);
            setViewingClub(c);
          }}
          onJoinGuestList={c => {
            setShowConcierge(false);
            setGuestListClub(c);
          }}
          onBookTable={c => {
            setShowConcierge(false);
            setBookingClub(c);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-900 bg-zinc-950/80 py-8 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white">AfterHours Cebu</span>
            <span>&bull; Automated Club Ambassador Platform</span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Operating in Mango Square, IT Park, Crossroads Banilad & Reclamation. 100% Commission-Based.
          </p>
        </div>
      </footer>

    </div>
  );
}
