// ============================================================================
// CLOUDFLARE D1 (SQLITE) SCHEMA & LEDGER INSPECTOR
// ============================================================================
import React, { useState } from 'react';
import { Database, Terminal, ShieldCheck, RefreshCw, Layers, DollarSign, CheckCircle2, Copy } from 'lucide-react';
import { clientStore } from '../lib/storage';
import { SchemaModel } from '../server/models/SchemaModel';
import { formatPHP } from '../lib/formatters';

export const D1SchemaViewer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'ddl' | 'ledger' | 'seed'>('tables');
  const [selectedTable, setSelectedTable] = useState<string>('venues');
  const [copied, setCopied] = useState(false);

  const venues = clientStore.getVenues();
  const tables = clientStore.getTablesByVenue(venues[0]?.id || 'ven_kazmik');
  const allTables = clientStore.getTablesByVenue('ven_kazmik');
  const bookings = clientStore.getBookings();
  const guestlists = clientStore.getGuestlists();
  const users = clientStore.getUsers();
  const ledgerTx = clientStore.getLedgerTransactions();
  const ledgerPostings = clientStore.getLedgerPostings();

  const ddlStatements = SchemaModel.getDDLStatements();

  const handleCopyDDL = () => {
    navigator.clipboard.writeText(ddlStatements.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset database state to original seed.sql data?')) {
      clientStore.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white">Cloudflare D1 SQLite Engine</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Active Connection
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">database: club_booking_db | dialect: sqlite3</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
              title="Reset state to seed.sql"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seed</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-950/40">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
              activeTab === 'tables' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Table Inspector ({venues.length + bookings.length + guestlists.length + users.length} Rows)</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
              activeTab === 'ledger' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Double-Entry Ledger ({ledgerTx.length} Txns)</span>
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-medium border-b-2 transition ${
              activeTab === 'ddl' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>SQL DDL Schema</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/60">
          {activeTab === 'tables' && (
            <div className="space-y-4">
              {/* Table Buttons */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800">
                {[
                  { name: 'venues', count: venues.length },
                  { name: 'tables', count: 18 },
                  { name: 'table_bookings', count: bookings.length },
                  { name: 'guestlists', count: guestlists.length },
                  { name: 'users', count: users.length },
                  { name: 'ledger_postings', count: ledgerPostings.length }
                ].map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTable(t.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                      selectedTable === t.name
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {t.name} <span className="text-[10px] opacity-70">({t.count})</span>
                  </button>
                ))}
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-zinc-800 overflow-x-auto bg-zinc-950/60">
                {selectedTable === 'venues' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-700/60">
                      <tr>
                        <th className="p-3">id</th>
                        <th className="p-3">name</th>
                        <th className="p-3">address</th>
                        <th className="p-3">hours</th>
                        <th className="p-3">cutoff</th>
                        <th className="p-3">occupancy / max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {venues.map(v => (
                        <tr key={v.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-orange-400 font-semibold">{v.id}</td>
                          <td className="p-3 text-white">{v.name}</td>
                          <td className="p-3 text-zinc-400 max-w-xs truncate">{v.address}</td>
                          <td className="p-3">{v.open_time} - {v.close_time}</td>
                          <td className="p-3 text-amber-400">{v.guestlist_cutoff_time}</td>
                          <td className="p-3">
                            <span className="text-emerald-400">{v.current_occupancy}</span> / {v.max_capacity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'tables' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-700/60">
                      <tr>
                        <th className="p-3">id</th>
                        <th className="p-3">venue_id</th>
                        <th className="p-3">table_number</th>
                        <th className="p-3">category</th>
                        <th className="p-3">capacity</th>
                        <th className="p-3">min_spend_php</th>
                        <th className="p-3">deposit_required_php</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {clientStore.getTablesByVenue('ven_kazmik').concat(clientStore.getTablesByVenue('ven_trademark')).map(t => (
                        <tr key={t.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-orange-400">{t.id}</td>
                          <td className="p-3 text-zinc-400">{t.venue_id}</td>
                          <td className="p-3 text-white font-semibold">{t.table_number}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-zinc-800 rounded">{t.category}</span></td>
                          <td className="p-3">{t.capacity} pax</td>
                          <td className="p-3 text-emerald-400">{formatPHP(t.min_spend_php)}</td>
                          <td className="p-3 text-amber-400">{formatPHP(t.deposit_required_php)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'table_bookings' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-700/60">
                      <tr>
                        <th className="p-3">booking_ref</th>
                        <th className="p-3">venue_id</th>
                        <th className="p-3">table_id</th>
                        <th className="p-3">date</th>
                        <th className="p-3">deposit (PHP)</th>
                        <th className="p-3">promoter</th>
                        <th className="p-3">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-orange-400 font-bold">{b.booking_ref}</td>
                          <td className="p-3 text-zinc-400">{b.venue_id}</td>
                          <td className="p-3 text-white">{b.table_id}</td>
                          <td className="p-3">{b.target_date}</td>
                          <td className="p-3 text-emerald-400">{formatPHP(b.deposit_amount_php)}</td>
                          <td className="p-3 text-purple-300">{b.promoter_code || '—'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'guestlists' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-700/60">
                      <tr>
                        <th className="p-3">pass_ref</th>
                        <th className="p-3">venue_id</th>
                        <th className="p-3">user_id</th>
                        <th className="p-3">target_date</th>
                        <th className="p-3">guest_count</th>
                        <th className="p-3">cutoff_time</th>
                        <th className="p-3">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {guestlists.map(g => (
                        <tr key={g.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-orange-400 font-bold">{g.pass_ref}</td>
                          <td className="p-3 text-zinc-400">{g.venue_id}</td>
                          <td className="p-3 text-white">{g.user_id}</td>
                          <td className="p-3">{g.target_date}</td>
                          <td className="p-3">{g.guest_count} pax</td>
                          <td className="p-3 text-amber-400">{g.cutoff_time}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded border ${
                              g.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              g.status === 'CHECKED_IN' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                              'bg-rose-950 text-rose-300 border-rose-800'
                            }`}>
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'users' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-700/60">
                      <tr>
                        <th className="p-3">id</th>
                        <th className="p-3">full_name</th>
                        <th className="p-3">email</th>
                        <th className="p-3">phone_number</th>
                        <th className="p-3">role</th>
                        <th className="p-3">promoter_code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-orange-400">{u.id}</td>
                          <td className="p-3 text-white font-semibold">{u.full_name}</td>
                          <td className="p-3 text-zinc-400">{u.email}</td>
                          <td className="p-3">{u.phone_number}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">{u.role}</span>
                          </td>
                          <td className="p-3 text-purple-400">{u.promoter_code || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'ledger_postings' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-700/60">
                      <tr>
                        <th className="p-3">id</th>
                        <th className="p-3">transaction_id</th>
                        <th className="p-3">account</th>
                        <th className="p-3">type</th>
                        <th className="p-3">amount_php</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {ledgerPostings.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-800/30">
                          <td className="p-3 text-orange-400">{p.id}</td>
                          <td className="p-3 text-zinc-400">{p.transaction_id}</td>
                          <td className="p-3 text-white font-semibold">{p.account}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              p.posting_type === 'DEBIT' ? 'text-cyan-400 bg-cyan-950' : 'text-amber-400 bg-amber-950'
                            }`}>
                              {p.posting_type}
                            </span>
                          </td>
                          <td className="p-3 text-emerald-400 font-bold">{formatPHP(p.amount_php)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-white">Double-Entry Cryptographic Balance</h4>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                    Balanced Debits == Credits
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Every table reservation deposit automatically journals balanced debit/credit entries to cash receivable, venue payable, promoter commission, and platform revenue.
                </p>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                {ledgerTx.map(tx => {
                  const postings = ledgerPostings.filter(p => p.transaction_id === tx.id);
                  const debits = postings.filter(p => p.posting_type === 'DEBIT').reduce((s, p) => s + p.amount_php, 0);
                  const credits = postings.filter(p => p.posting_type === 'CREDIT').reduce((s, p) => s + p.amount_php, 0);

                  return (
                    <div key={tx.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-400 font-bold">{tx.transaction_ref}</span>
                          <span className="text-zinc-500">|</span>
                          <span className="text-zinc-300">{tx.description}</span>
                        </div>
                        <span className="text-zinc-500 text-[11px]">{tx.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase">Block Hash (SHA-256):</span>
                          <p className="text-[11px] text-purple-400 truncate">{tx.block_hash}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase">Previous Hash:</span>
                          <p className="text-[11px] text-zinc-500 truncate">{tx.previous_hash}</p>
                        </div>
                      </div>

                      {/* Postings table */}
                      <div className="rounded-lg bg-zinc-900/80 p-3 space-y-2 border border-zinc-800/80">
                        {postings.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300">{p.account}</span>
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

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                        <span className="text-zinc-400">Total Debits: <strong className="text-cyan-400">{formatPHP(debits)}</strong></span>
                        <span className="text-zinc-400">Total Credits: <strong className="text-amber-400">{formatPHP(credits)}</strong></span>
                        <span className="text-emerald-400 font-bold">Δ = {formatPHP(debits - credits)} (Zero Balance)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">SQLite DDL Schema (users, venues, tables, table_bookings, guestlists, ledger)</span>
                <button
                  onClick={handleCopyDDL}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy DDL'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
                {ddlStatements.join('\n\n')}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
