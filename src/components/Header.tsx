import React from 'react';
import { Sparkles, Ticket, ShieldCheck, Database, Compass, Store, QrCode } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (role: 'user' | 'club_admin' | 'superadmin') => void;
  activeTab: 'explore' | 'passes' | 'admin' | 'scanner' | 'schema';
  onSelectTab: (tab: 'explore' | 'passes' | 'admin' | 'scanner' | 'schema') => void;
  passCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  activeTab,
  onSelectTab,
  passCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & City Tag */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('explore')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2E88] via-[#A855F7] to-[#8B5CF6] p-[2px] shadow-[0_0_15px_rgba(255,46,136,0.35)]">
              <div className="w-full h-full bg-[#050505] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF2E88] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  After<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6]">Hours</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30 rounded-md tracking-wider">
                  CEBU
                </span>
              </div>
              <p className="text-[11px] text-white/40 hidden sm:block font-medium">
                Automated Club Ambassador & VIP Booking
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-explore-btn"
              onClick={() => onSelectTab('explore')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Clubs</span>
            </button>

            <button
              id="nav-passes-btn"
              onClick={() => onSelectTab('passes')}
              className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'passes'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Passes</span>
              {passCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF2E88] text-[10px] font-bold text-white shadow-[0_0_8px_#FF2E88]">
                  {passCount}
                </span>
              )}
            </button>

            {/* Bouncer / Door Scanner */}
            <button
              id="nav-scanner-btn"
              onClick={() => onSelectTab('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="Bouncer / Door Staff QR Scanner"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Door Scanner</span>
            </button>

            {/* Club Admin Portal */}
            <button
              id="nav-admin-btn"
              onClick={() => {
                if (currentUser.role === 'user') {
                  onSwitchUser('club_admin');
                }
                onSelectTab('admin');
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Club Admin</span>
            </button>

            {/* D1 Schema & SQL Tab */}
            <button
              id="nav-schema-btn"
              onClick={() => onSelectTab('schema')}
              className={`p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="Cloudflare D1 Schema & SQL Engine"
            >
              <Database className="w-4 h-4 text-blue-400" />
            </button>
          </nav>

          {/* User Role Switcher */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center bg-[#111] border border-white/10 rounded-xl p-1 text-xs">
              <span className="text-white/40 px-2 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-white/50" /> Role:
              </span>
              <button
                onClick={() => onSwitchUser('user')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  currentUser.role === 'user'
                    ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Partygoer
              </button>
              <button
                onClick={() => onSwitchUser('club_admin')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  currentUser.role === 'club_admin'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Apex Manager
              </button>
              <button
                onClick={() => onSwitchUser('superadmin')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  currentUser.role === 'superadmin'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                HQ Admin
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
