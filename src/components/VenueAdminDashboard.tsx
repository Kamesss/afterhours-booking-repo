import React, { useState } from 'react';
import { Club, Booking, TableType } from '../types';
import { db } from '../lib/storage';
import { formatPeso, formatDatePretty } from '../lib/formatters';
import { Store, DollarSign, Users, CheckCircle2, XCircle, TrendingUp, Calendar, Edit3, Plus, ShieldCheck, Sparkles, Filter } from 'lucide-react';

export const VenueAdminDashboard: React.FC = () => {
  const clubs = db.getClubs();
  const [selectedClubId, setSelectedClubId] = useState<string>(() => clubs[0]?.id || 'clb_sentral');
  const selectedClub = db.getClubById(selectedClubId) || clubs[0] || {
    id: 'clb_sentral',
    owner_id: 'usr_owner_sentral',
    name: 'Sentral Bar & Lounge',
    slug: 'sentral-bar-lounge',
    address: 'Nivel Hills, Lahug, Cebu City',
    min_age: 18,
    is_active: 1,
    created_at: new Date().toISOString(),
    area: 'Lahug / Nivel Hills',
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState<string>(todayStr);

  const bookings = db.getBookings(selectedClubId, dateFilter || undefined);
  const allClubBookings = db.getBookings(selectedClubId);
  const guestList = db.getGuestList(selectedClubId, dateFilter || undefined);
  const tableTypes = db.getTableTypes(selectedClubId);
  const physicalTables = db.getClubTables(selectedClubId);

  // Financial Metrics
  const grossMinSpend = allClubBookings.reduce((sum, b) => sum + b.min_spend_cents, 0);
  const totalDepositsCollected = allClubBookings.reduce((sum, b) => sum + b.deposit_paid_cents, 0);
  const totalCommissionEarned = allClubBookings.reduce((sum, b) => sum + b.commission_cents, 0);
  const netVenueRevenue = grossMinSpend - totalCommissionEarned;

  // Editing Table Type State
  const [editingType, setEditingType] = useState<TableType | null>(null);
  const [editMinSpend, setEditMinSpend] = useState<number>(0);
  const [editDeposit, setEditDeposit] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleStartEdit = (tt: TableType) => {
    setEditingType(tt);
    setEditMinSpend(tt.min_spend_cents / 100);
    setEditDeposit(tt.deposit_cents / 100);
    setSaveSuccess(false);
  };

  const handleSaveTableType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    db.updateTableType(editingType.id, {
      min_spend_cents: editMinSpend * 100,
      deposit_cents: editDeposit * 100,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setEditingType(null);
      setSaveSuccess(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Club Selector & Value Proposition Banner */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF2E88]/10 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30">
            <Store className="w-3.5 h-3.5 text-[#FF2E88]" />
            <span>Automated Ambassador Club Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {selectedClub.name}
          </h1>
          <p className="text-xs text-white/50">
            Zero-risk commission model &bull; 0 upfront ambassador payroll &bull; Real-time booking deposits
          </p>
        </div>

        {/* Venue Switcher */}
        <div className="flex items-center gap-3 relative z-10">
          <label className="text-xs text-white/60 whitespace-nowrap">Select Venue:</label>
          <select
            value={selectedClubId}
            onChange={e => setSelectedClubId(e.target.value)}
            className="bg-[#111] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88] font-bold cursor-pointer"
          >
            {clubs.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.area})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Overview Cards (The Zero-Risk Math) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Gross Consumable Bookings</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{formatPeso(grossMinSpend)}</p>
          <p className="text-[11px] text-emerald-400">Total driven via AfterHours</p>
        </div>

        <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>In-App Deposits Collected</span>
            <DollarSign className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <p className="text-2xl font-black text-[#8B5CF6] font-mono">{formatPeso(totalDepositsCollected)}</p>
          <p className="text-[11px] text-white/40">Guaranteed upfront payment</p>
        </div>

        <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>AfterHours Ambassador Fee</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{formatPeso(totalCommissionEarned)}</p>
          <p className="text-[11px] text-white/40">10% Success-only commission</p>
        </div>

        <div className="bg-gradient-to-br from-[#FF2E88]/15 via-[#8B5CF6]/10 to-[#0A0A0B] border border-[#FF2E88]/30 rounded-2xl p-5 space-y-2 shadow-[0_0_20px_rgba(255,46,136,0.15)]">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Net Venue Earnings</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{formatPeso(netVenueRevenue)}</p>
          <p className="text-[11px] text-emerald-400 font-medium">90% Payout directly to venue</p>
        </div>

      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#0A0A0B] border border-white/10 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-white/80 font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-[#FF2E88]" />
          <span>Active Bookings & Door Roster</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateFilter(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dateFilter === todayStr
                ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            Tonight ({todayStr})
          </button>
          <button
            onClick={() => setDateFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dateFilter === ''
                ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            All Dates
          </button>
        </div>
      </div>

      {/* Bookings & Guestlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table Bookings List (7 cols) */}
        <div className="lg:col-span-7 bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF2E88]" />
              VIP Table Reservations ({bookings.length})
            </h3>
            <span className="text-xs text-white/50">{physicalTables.length} Total Physical Tables</span>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-xs">
              No reservations recorded for this date filter.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => {
                const table = physicalTables.find(t => t.id === b.table_id);
                return (
                  <div
                    key={b.id}
                    className="p-4 bg-[#050505] border border-white/10 rounded-2xl space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">{b.customer_name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30 font-bold text-[10px]">
                            {table?.table_number || b.table_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 mt-0.5">
                          {b.customer_phone} &bull; {b.customer_email} &bull; {b.guest_count} Guests
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.status === 'confirmed'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {b.status}
                        </span>
                        <p className="text-[10px] text-white/40 mt-1">Arrival: {b.arrival_time}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#111] p-2.5 rounded-xl border border-white/10 text-[11px]">
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase">Min Spend</span>
                        <span className="font-bold text-white font-mono">{formatPeso(b.min_spend_cents)}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase">Deposit Paid</span>
                        <span className="font-bold text-emerald-400 font-mono">{formatPeso(b.deposit_paid_cents)}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase">Payment</span>
                        <span className="font-medium text-white/70">{b.payment_method}</span>
                      </div>
                    </div>

                    {b.special_requests && (
                      <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        🎁 Request: {b.special_requests}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-white/50">
                      <span className="font-mono">QR: {b.qr_code}</span>
                      <div className="flex gap-2">
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => db.updateBookingStatus(b.id, 'completed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                          >
                            Mark Checked In
                          </button>
                        )}
                        {b.status !== 'no_show' && (
                          <button
                            onClick={() => db.updateBookingStatus(b.id, 'no_show')}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-colors cursor-pointer"
                          >
                            No Show
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Guest List Queue (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Ambassador Guest List ({guestList.length})
            </h3>
            <span className="text-xs text-white/50">Auto Door Perks</span>
          </div>

          {guestList.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-xs">
              No guest list entries for this date filter.
            </div>
          ) : (
            <div className="space-y-3">
              {guestList.map(gl => (
                <div
                  key={gl.id}
                  className="p-3.5 bg-[#050505] border border-white/10 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{gl.guest_name}</p>
                      <p className="text-[11px] text-white/50">{gl.guest_email} &bull; {gl.guest_phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {gl.pax} Guests
                    </span>
                  </div>

                  <p className="text-[11px] text-white/80 bg-[#111] p-2 rounded-lg border border-white/10">
                    Perk: {gl.ambassador_perk}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>ETA: {gl.arrival_time_estimate}</span>
                    <span className="font-mono">{gl.qr_code}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Table Types & Minimum Spend Live Editor */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-white">
              Table Tiers & Consumable Pricing Setup
            </h3>
            <p className="text-xs text-white/50">
              Customize minimum consumable spend and required upfront deposit per tier. Changes sync instantly to partygoer booking flow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tableTypes.map(tt => (
            <div
              key={tt.id}
              className="p-5 bg-[#050505] border border-white/10 rounded-2xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{tt.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                    {tt.tier_badge}
                  </span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2">{tt.description}</p>
                <p className="text-[11px] text-[#FF2E88] font-medium">Capacity: Max {tt.max_guests} Guests</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Min Spend:</span>
                  <span className="font-bold text-white font-mono">{formatPeso(tt.min_spend_cents)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Upfront Deposit:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatPeso(tt.deposit_cents)}</span>
                </div>
              </div>

              <button
                onClick={() => handleStartEdit(tt)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Pricing Tier</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Table Type Modal */}
      {editingType && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h4 className="text-base font-bold text-white">
              Update Pricing &bull; {editingType.name}
            </h4>

            <form onSubmit={handleSaveTableType} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">Minimum Consumable Spend (₱)</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={editMinSpend}
                  onChange={e => setEditMinSpend(Number(e.target.value))}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-3 text-sm text-white font-bold focus:outline-none focus:border-[#FF2E88]"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">Upfront Reservation Deposit (₱)</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={100}
                  value={editDeposit}
                  onChange={e => setEditDeposit(Number(e.target.value))}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-3 text-sm text-emerald-400 font-bold focus:outline-none focus:border-[#FF2E88]"
                />
              </div>

              {saveSuccess && (
                <p className="text-xs text-emerald-400 font-bold">✓ Pricing updated and saved to database!</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,136,0.3)] cursor-pointer"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
