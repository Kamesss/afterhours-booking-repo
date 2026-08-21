// ============================================================================
// HEADER NAVIGATION & USER ROLE SWITCHER
// ============================================================================
import React from 'react';
import { clientStore } from '../lib/storage';
import { User, UserRole } from '../types';
import { formatRole } from '../lib/formatters';
import { 
  Flame, 
  Database, 
  Ticket, 
  ScanLine, 
  LayoutDashboard, 
  UserCircle, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

interface Props {
  activeTab: 'venues' | 'passes' | 'scanner' | 'admin' | 'concierge';
  onTabChange: (tab: 'venues' | 'passes' | 'scanner' | 'admin' | 'concierge') => void;
  onOpenD1Modal: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenD1Modal
}) => {
  const currentUser = clientStore.getCurrentUser();
  const allUsers = clientStore.getUsers();

  const handleUserSwitch = (userId: string) => {
    clientStore.setCurrentUserId(userId);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => onTabChange('venues')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-black text-lg tracking-tight text-white">AFTERHOURS</h1>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  CEBU
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">D1 Nightlife Engine</p>
            </div>
          </div>

          {/* Mobile D1 Trigger */}
          <button
            onClick={onOpenD1Modal}
            className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs font-mono text-orange-300"
          >
            <Database className="w-3.5 h-3.5" />
            <span>D1</span>
          </button>
        </div>

        {/* Center Navigation Bar */}
        <nav className="flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => onTabChange('venues')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'venues'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Explore Clubs</span>
          </button>

          <button
            onClick={() => onTabChange('passes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'passes'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-purple-400" />
            <span>My Passes</span>
          </button>

          <button
            onClick={() => onTabChange('concierge')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'concierge'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Ambassador</span>
          </button>

          <button
            onClick={() => onTabChange('scanner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bouncer Gate</span>
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Venue Admin</span>
          </button>
        </nav>

        {/* Right Tools: D1 Inspector & User Persona Switcher */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenD1Modal}
            className="hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-mono text-orange-300 transition"
          >
            <Database className="w-4 h-4 text-orange-400" />
            <span>Inspect D1 & Ledger</span>
          </button>

          {/* User Role Switcher Dropdown */}
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-2xl">
            <UserCircle className="w-4 h-4 text-zinc-400" />
            <select
              value={currentUser.id}
              onChange={e => handleUserSwitch(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 font-mono focus:outline-none cursor-pointer"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id} className="bg-zinc-900 text-white">
                  {u.full_name} ({formatRole(u.role)})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
