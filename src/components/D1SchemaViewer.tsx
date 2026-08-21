import React, { useState } from 'react';
import { db } from '../lib/storage';
import { Database, Table, Key, Check, Copy, Download, RefreshCw, Layers, ShieldCheck, Code } from 'lucide-react';

export const D1SchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTable, setActiveTable] = useState<'users' | 'clubs' | 'table_types' | 'club_tables' | 'bookings'>('bookings');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const users = db.getUsers();
  const clubs = db.getClubs();
  const tableTypes = db.getTableTypes();
  const clubTables = db.getClubTables();
  const bookings = db.getBookings();

  const sqlDump = db.generateD1SqlDump();

  const handleSyncD1 = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    const success = await db.syncFromD1();
    setIsSyncing(false);
    if (success) {
      setSyncMessage('D1 Cloud Synced Successfully!');
    } else {
      setSyncMessage('Synced with local cache.');
    }
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlDump], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `afterhours_cebu_d1_dump_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    if (confirm('Reset database to default seed state? This will restore sample bookings.')) {
      db.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#8B5CF6]/15 via-[#FF2E88]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF2E88]/10 text-[#FF2E88] border border-[#FF2E88]/20">
            <Database className="w-3.5 h-3.5 text-[#FF2E88]" />
            <span>Cloudflare D1: club_booking_db</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Schema & Live D1 Data Explorer
          </h1>
          <p className="text-xs text-white/50 max-w-xl">
            Directly connected to Cloudflare D1 binding <code className="text-[#FF2E88] font-mono">DB</code> (<code className="text-white/70 font-mono text-[11px]">ceb841b0-6066-4196-9bc2-b79e2ca2aaf3</code>). Enforces foreign keys and <code className="text-[#FF2E88] font-mono">uq_prevent_table_double_booking</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={handleSyncD1}
            disabled={isSyncing}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing D1...' : 'Sync Live D1'}</span>
          </button>
          <button
            onClick={handleCopySql}
            className="py-2.5 px-4 rounded-xl bg-[#111] hover:bg-white/10 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
            <span>{copied ? 'SQL Copied' : 'Copy D1 SQL'}</span>
          </button>
          <button
            onClick={handleDownloadSql}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,136,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Schema Constraints Highlight */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Enforced D1 Partial Unique Index:
            </h4>
            <p className="text-xs font-mono text-emerald-400 mt-0.5">
              CREATE UNIQUE INDEX uq_prevent_table_double_booking ON bookings (table_id, booking_date) WHERE status IN ('confirmed', 'pending');
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#111] hover:bg-white/10 text-white/50 hover:text-white border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Table Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'bookings', label: 'bookings', count: bookings.length },
          { id: 'club_tables', label: 'club_tables', count: clubTables.length },
          { id: 'table_types', label: 'table_types', count: tableTypes.length },
          { id: 'clubs', label: 'clubs', count: clubs.length },
          { id: 'users', label: 'users', count: users.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTable(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTable === t.id
                ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.25)]'
                : 'bg-[#0A0A0B] text-white/60 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{t.label}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-md bg-black/50 text-white/80">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Data Preview */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 bg-[#050505] flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white/90 flex items-center gap-2">
            <Code className="w-4 h-4 text-[#FF2E88]" />
            SELECT * FROM {activeTable}
          </span>
          <span className="text-xs text-white/40">Live Browser D1 Store</span>
        </div>

        <div className="overflow-x-auto">
          {activeTable === 'bookings' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505] text-white/50 border-b border-white/10">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">club_id</th>
                  <th className="p-3">table_id</th>
                  <th className="p-3">booking_date</th>
                  <th className="p-3">arrival_time</th>
                  <th className="p-3">pax</th>
                  <th className="p-3">min_spend_cents</th>
                  <th className="p-3">deposit_paid_cents</th>
                  <th className="p-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[#FF2E88]">{b.id}</td>
                    <td className="p-3">{b.club_id}</td>
                    <td className="p-3 text-[#8B5CF6] font-bold">{b.table_id}</td>
                    <td className="p-3">{b.booking_date}</td>
                    <td className="p-3">{b.arrival_time}</td>
                    <td className="p-3">{b.guest_count}</td>
                    <td className="p-3 font-mono">{b.min_spend_cents}</td>
                    <td className="p-3 text-emerald-400 font-mono">{b.deposit_paid_cents}</td>
                    <td className="p-3 font-bold">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'club_tables' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505] text-white/50 border-b border-white/10">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">club_id</th>
                  <th className="p-3">table_type_id</th>
                  <th className="p-3">table_number</th>
                  <th className="p-3">location_description</th>
                  <th className="p-3">is_active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {clubTables.map(t => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[#FF2E88]">{t.id}</td>
                    <td className="p-3">{t.club_id}</td>
                    <td className="p-3 text-[#8B5CF6]">{t.table_type_id}</td>
                    <td className="p-3 font-bold text-white">{t.table_number}</td>
                    <td className="p-3 text-white/50">{t.location_description}</td>
                    <td className="p-3">{t.is_active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'table_types' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505] text-white/50 border-b border-white/10">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">club_id</th>
                  <th className="p-3">name</th>
                  <th className="p-3">min_spend_cents</th>
                  <th className="p-3">deposit_cents</th>
                  <th className="p-3">max_guests</th>
                  <th className="p-3">is_active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {tableTypes.map(tt => (
                  <tr key={tt.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[#FF2E88]">{tt.id}</td>
                    <td className="p-3">{tt.club_id}</td>
                    <td className="p-3 font-bold text-white">{tt.name}</td>
                    <td className="p-3 text-emerald-400 font-mono">{tt.min_spend_cents}</td>
                    <td className="p-3 text-emerald-400 font-mono">{tt.deposit_cents}</td>
                    <td className="p-3">{tt.max_guests}</td>
                    <td className="p-3">{tt.is_active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'clubs' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505] text-white/50 border-b border-white/10">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">name</th>
                  <th className="p-3">slug</th>
                  <th className="p-3">address</th>
                  <th className="p-3">min_age</th>
                  <th className="p-3">dress_code</th>
                  <th className="p-3">is_active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {clubs.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[#FF2E88]">{c.id}</td>
                    <td className="p-3 font-bold text-white">{c.name}</td>
                    <td className="p-3 text-white/50">{c.slug}</td>
                    <td className="p-3">{c.address}</td>
                    <td className="p-3">{c.min_age}</td>
                    <td className="p-3 text-white/50 truncate max-w-xs">{c.dress_code}</td>
                    <td className="p-3">{c.is_active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'users' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050505] text-white/50 border-b border-white/10">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">name</th>
                  <th className="p-3">email</th>
                  <th className="p-3">phone</th>
                  <th className="p-3">role</th>
                  <th className="p-3">created_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[#FF2E88]">{u.id}</td>
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3 font-bold text-[#8B5CF6]">{u.role}</td>
                    <td className="p-3 text-white/40">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
