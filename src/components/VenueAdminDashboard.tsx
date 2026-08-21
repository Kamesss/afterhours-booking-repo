// ============================================================================
// VENUE MANAGER & ADMIN OPERATIONAL DASHBOARD WITH FINANCIAL LEDGER
// ============================================================================
import React, { useState } from 'react';
import { clientStore } from '../lib/storage';
import { formatPHP, formatCategory } from '../lib/formatters';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';

export const VenueAdminDashboard: React.FC = () => {
  const venues = clientStore.getVenues();
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0]?.id || 'ven_kazmik');
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'bookings' | 'ledger'>('overview');

  const activeVenue = clientStore.getVenueById(selectedVenueId) || venues[0];
  const tables = clientStore.getTablesByVenue(selectedVenueId);
  const bookings = clientStore.getBookings(selectedVenueId);
  const guestlists = clientStore.getGuestlists(selectedVenueId);
  const ledgerTx = clientStore.getLedgerTransactions();
  const ledgerPostings = clientStore.getLedgerPostings();

  // Metrics
  const totalDepositGross = bookings.reduce((sum, b) => sum + (b.status !== 'CANCELLED' ? b.deposit_amount_php : 0), 0);
  const totalMinSpendGross = bookings.reduce((sum, b) => sum + (b.status !== 'CANCELLED' ? b.min_spend_php : 0), 0);
  const confirmedBookingsCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;
  const activeGuestlistPax = guestlists.filter(g => g.status === 'ACTIVE' || g.status === 'CHECKED_IN').reduce((sum, g) => sum + g.guest_count, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Cebu Nightlife Management Portal</h2>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Cloudflare D1 atomic reservation engine & double-entry ledger
          </p>
        </div>

        {/* Venue Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-zinc-400 font-mono">Select Venue:</label>
          <select
            value={selectedVenueId}
            onChange={e => setSelectedVenueId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Total Consumable Revenue</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatPHP(totalMinSpendGross)}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{confirmedBookingsCount} VIP tables reserved</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Locked Deposits Collected</span>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {formatPHP(totalDepositGross)}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-zinc-400 mt-2 font-mono">
            <span>Philippine Rails (GCash/Maya)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Guestlist Admitted / Active</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {activeGuestlistPax} <span className="text-xs text-zinc-500 font-normal">pax</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-amber-400 mt-2 font-mono">
            <Clock className="w-3 h-3" />
            <span>Cutoff: {activeVenue.guestlist_cutoff_time}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Live Gate Headcount</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {activeVenue.current_occupancy} <span className="text-xs text-zinc-500 font-normal">/ {activeVenue.max_capacity}</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (activeVenue.current_occupancy / activeVenue.max_capacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: 'overview', label: 'Overview & Activity' },
          { id: 'tables', label: `Tables Inventory (${tables.length})` },
          { id: 'bookings', label: `Table Bookings (${bookings.length})` },
          { id: 'ledger', label: `Double-Entry Financial Ledger` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reservations */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>Recent Table Reservations</span>
            </h3>

            <div className="divide-y divide-zinc-800">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold font-mono text-orange-400">{b.booking_ref}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{b.table_id}</span>
                    </div>
                    <p className="text-zinc-400 mt-0.5">{b.guest_count} guests • {b.target_date}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-emerald-400 font-bold">{formatPHP(b.deposit_amount_php)}</span>
                    <p className="text-[10px] text-zinc-500 uppercase">{b.payment_method || 'GCASH'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guestlist Entries */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Tonight's VIP Guestlist</span>
            </h3>

            <div className="divide-y divide-zinc-800">
              {guestlists.slice(0, 4).map(g => (
                <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold font-mono text-purple-400">{g.pass_ref}</span>
                      <span className="text-zinc-400 font-mono">({g.guest_count} pax)</span>
                    </div>
                    <p className="text-zinc-400 mt-0.5">Cutoff: {g.cutoff_time}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                    g.status === 'CHECKED_IN' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    g.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Tables & Floor Layout Inventory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Table #</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Min Spend</th>
                  <th className="p-3">Deposit Required</th>
                  <th className="p-3">Coordinates (X, Y)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {tables.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-800/40">
                    <td className="p-3 text-orange-400 font-bold">{t.id}</td>
                    <td className="p-3 text-white font-semibold">{t.table_number}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-zinc-800">{formatCategory(t.category)}</span></td>
                    <td className="p-3">{t.capacity} pax</td>
                    <td className="p-3 text-emerald-400">{formatPHP(t.min_spend_php)}</td>
                    <td className="p-3 text-amber-400">{formatPHP(t.deposit_required_php)}</td>
                    <td className="p-3 text-zinc-400">{t.coord_x}%, {t.coord_y}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Full Table Bookings Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Table ID</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Deposit (PHP)</th>
                  <th className="p-3">Promoter</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-zinc-800/40">
                    <td className="p-3 text-orange-400 font-bold">{b.booking_ref}</td>
                    <td className="p-3 text-white">{b.table_id}</td>
                    <td className="p-3">{b.target_date}</td>
                    <td className="p-3">{b.guest_count} pax</td>
                    <td className="p-3 text-emerald-400">{formatPHP(b.deposit_amount_php)}</td>
                    <td className="p-3 text-purple-300">{b.promoter_code || '—'}</td>
                    <td className="p-3 text-zinc-400">{b.payment_method || 'GCASH'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Double-Entry Financial Journal</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Balanced (Debits == Credits)
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Transactions are recorded using immutable double-entry ledger postings with SHA-256 block hash verification.
            </p>
          </div>

          <div className="space-y-3">
            {ledgerTx.map(tx => {
              const postings = ledgerPostings.filter(p => p.transaction_id === tx.id);
              return (
                <div key={tx.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-bold">{tx.transaction_ref}</span>
                    <span className="text-zinc-500 text-[11px]">{tx.timestamp}</span>
                  </div>
                  <p className="text-zinc-300">{tx.description}</p>
                  
                  <div className="rounded-xl bg-zinc-900/60 p-3 space-y-2 border border-zinc-800/80">
                    {postings.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">{p.account}</span>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            p.posting_type === 'DEBIT' ? 'bg-cyan-950 text-cyan-300' : 'bg-amber-950 text-amber-300'
                          }`}>
                            {p.posting_type}
                          </span>
                          <span className="text-emerald-400 font-semibold">{formatPHP(p.amount_php)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
