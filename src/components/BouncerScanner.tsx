// ============================================================================
// BOUNCER & DOOR HOST QR PASS SCANNER / VALIDATOR
// ============================================================================
import React, { useState } from 'react';
import { clientStore } from '../lib/storage';
import { Venue } from '../types';
import { formatPHP } from '../lib/formatters';
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  DollarSign, 
  Search, 
  UserCheck, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

export const BouncerScanner: React.FC = () => {
  const [refInput, setRefInput] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'expired' | 'invalid';
    message: string;
    type?: 'TABLE_BOOKING' | 'GUESTLIST_PASS';
    details?: any;
  }>({ status: 'idle', message: '' });

  const venues = clientStore.getVenues();
  const [activeVenueId, setActiveVenueId] = useState<string>(venues[0]?.id || 'ven_kazmik');
  const activeVenue = clientStore.getVenueById(activeVenueId) || venues[0];

  const handleScanOrVerify = async (action: 'verify' | 'check_in') => {
    if (!refInput.trim()) return;
    const code = refInput.trim().toUpperCase();

    try {
      const res = await fetch(`/api/verify-pass?ref=${code}&action=${action}`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setScanResult({
            status: json.data.status === 'EXPIRED_CUTOFF' ? 'expired' : 'success',
            message: action === 'check_in' ? 'Guest successfully checked in!' : 'Pass is valid and verified.',
            type: json.type,
            details: json.data
          });
          return;
        }
      }
    } catch (e) {}

    // Local fallback check
    const booking = clientStore.getBookings().find(b => b.booking_ref === code);
    if (booking) {
      if (action === 'check_in') {
        await clientStore.verifyAndCheckIn(code);
      }
      const v = clientStore.getVenueById(booking.venue_id);
      const u = clientStore.getUsers().find(user => user.id === booking.user_id);
      const t = clientStore.getTableById(booking.table_id);

      setScanResult({
        status: 'success',
        message: action === 'check_in' ? 'VIP Table successfully checked in!' : 'VIP Table Reservation Valid',
        type: 'TABLE_BOOKING',
        details: { ...booking, venue: v, user: u, table: t }
      });
      return;
    }

    const guestlist = clientStore.getGuestlists().find(g => g.pass_ref === code);
    if (guestlist) {
      if (guestlist.status === 'EXPIRED_CUTOFF') {
        setScanResult({
          status: 'expired',
          message: 'Pass has expired due to late arrival past door cutoff.',
          type: 'GUESTLIST_PASS',
          details: guestlist
        });
        return;
      }
      if (action === 'check_in') {
        await clientStore.verifyAndCheckIn(code);
      }
      const v = clientStore.getVenueById(guestlist.venue_id);
      const u = clientStore.getUsers().find(user => user.id === guestlist.user_id);

      setScanResult({
        status: 'success',
        message: action === 'check_in' ? 'Guestlist pass checked in!' : 'Active VIP Guestlist Pass',
        type: 'GUESTLIST_PASS',
        details: { ...guestlist, venue: v, user: u }
      });
      return;
    }

    setScanResult({
      status: 'invalid',
      message: 'No active reservation or guestlist pass found with this code.'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner / Venue Select */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Door Host & Bouncer Gate Terminal</h2>
            <p className="text-xs text-zinc-400 font-mono">Real-time D1 pass validation & capacity tracking</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-zinc-400 font-mono">Gate Station:</label>
          <select
            value={activeVenueId}
            onChange={e => setActiveVenueId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.current_occupancy}/{v.max_capacity})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Occupancy Metric */}
      {activeVenue && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400">Live Gate Headcount</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {activeVenue.current_occupancy} <span className="text-xs text-zinc-500 font-normal">/ {activeVenue.max_capacity} max</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (activeVenue.current_occupancy / activeVenue.max_capacity) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400">Guestlist Door Cutoff</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {activeVenue.guestlist_cutoff_time}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Strict door enforcement enabled</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400">Venue Operating Hours</span>
            <div className="text-lg font-bold font-mono text-zinc-200 mt-1">
              {activeVenue.open_time} - {activeVenue.close_time}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">Status: Open Tonight</p>
          </div>
        </div>
      )}

      {/* Scan / Manual Verification Form */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
        <h3 className="text-sm font-semibold text-zinc-200">Scan QR or Enter Booking / Pass Reference</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="e.g. AH-KAZ-9182 or GL-KAZ-1049"
              value={refInput}
              onChange={e => setRefInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl text-sm font-mono text-white placeholder-zinc-600 uppercase focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleScanOrVerify('verify')}
              className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition"
            >
              Verify Only
            </button>
            <button
              onClick={() => handleScanOrVerify('check_in')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-black font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-orange-500/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Admit & Check In</span>
            </button>
          </div>
        </div>

        {/* Quick Test Codes */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500">Quick Test Codes:</span>
          {['AH-KAZ-9182', 'AH-TM-4412', 'GL-KAZ-1049', 'GL-TM-7714', 'GL-ICON-9011'].map(code => (
            <button
              key={code}
              onClick={() => setRefInput(code)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 font-mono text-zinc-300 text-[11px] transition"
            >
              {code}
            </button>
          ))}
        </div>

        {/* Scan Result Card */}
        {scanResult.status !== 'idle' && (
          <div className={`p-5 rounded-2xl border ${
            scanResult.status === 'success' ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300' :
            scanResult.status === 'expired' ? 'bg-amber-950/30 border-amber-800/80 text-amber-300' :
            'bg-rose-950/30 border-rose-800/80 text-rose-300'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {scanResult.status === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
                 scanResult.status === 'expired' ? <AlertTriangle className="w-6 h-6 text-amber-400" /> :
                 <XCircle className="w-6 h-6 text-rose-400" />}
                <div>
                  <h4 className="font-bold text-base text-white">{scanResult.message}</h4>
                  <p className="text-xs font-mono opacity-80">{scanResult.type || 'Verification Error'}</p>
                </div>
              </div>

              {scanResult.details?.status && (
                <span className="text-xs px-2.5 py-1 rounded-full font-mono uppercase font-bold bg-zinc-900 border border-zinc-700 text-white">
                  {scanResult.details.status}
                </span>
              )}
            </div>

            {scanResult.details && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-zinc-500">Guest / Holder:</span>
                  <p className="text-white font-semibold">{scanResult.details.user?.full_name || 'VIP Client'}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Party Size:</span>
                  <p className="text-white font-semibold">{scanResult.details.guest_count || 1} Guests</p>
                </div>
                <div>
                  <span className="text-zinc-500">Target Date:</span>
                  <p className="text-white">{scanResult.details.target_date}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Attributed Promoter:</span>
                  <p className="text-purple-300">{scanResult.details.promoter_code || 'Direct Booking'}</p>
                </div>

                {scanResult.type === 'TABLE_BOOKING' && (
                  <>
                    <div>
                      <span className="text-zinc-500">Table Number:</span>
                      <p className="text-orange-400 font-bold">{scanResult.details.table?.table_number || scanResult.details.table_id}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Deposit Locked:</span>
                      <p className="text-emerald-400 font-bold">{formatPHP(scanResult.details.deposit_amount_php || 0)}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
