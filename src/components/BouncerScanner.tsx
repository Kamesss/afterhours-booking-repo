import React, { useState } from 'react';
import { db } from '../lib/storage';
import { Booking, GuestListEntry } from '../types';
import { formatPeso } from '../lib/formatters';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Search, Sparkles, RefreshCw, Users, Key } from 'lucide-react';

export const BouncerScanner: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    type: 'booking' | 'guestlist' | 'unknown';
    data?: Booking | GuestListEntry;
    message: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = db.getBookings(undefined, todayStr);
  const todayGuestlist = db.getGuestList(undefined, todayStr);

  const handleVerify = async (code: string) => {
    if (!code.trim()) return;
    const res = await db.verifyAndCheckIn(code.trim());
    setScanResult(res);
  };

  const handleClear = () => {
    setInputCode('');
    setScanResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Scanner Header */}
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 via-[#FF2E88]/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider relative z-10">
          <QrCode className="w-4 h-4" />
          <span>Door Host & Bouncer Validation Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white relative z-10">
          Nightclub Pass & Table Check-In
        </h2>
        <p className="text-xs sm:text-sm text-white/50 max-w-2xl relative z-10">
          Scan partygoer QR passes or enter pass codes at the door. Verifies real-time table locks, admitted PAX, and ambassador perks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scanner Viewfinder / Input (Left 7 cols) */}
        <div className="lg:col-span-7 bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 space-y-6">
          
          {/* Simulated Scanner Viewfinder */}
          <div className="relative aspect-[4/3] bg-[#050505] rounded-2xl border-2 border-dashed border-white/15 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(#FF2E8808_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            {/* Viewfinder Reticle Corners */}
            <div className="relative w-48 h-48 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#FF2E88]" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#FF2E88]" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FF2E88]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FF2E88]" />

              {/* Animated Laser Bar */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FF2E88] to-transparent shadow-[0_0_10px_#FF2E88] animate-pulse" />
              
              <QrCode className="w-16 h-16 text-white/15 pointer-events-none" />
            </div>

            <p className="text-xs text-white/50 mt-4">
              Point bouncer camera at partygoer's AfterHours pass or enter code below
            </p>
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(inputCode);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
              Enter Pass Code / Scan Result
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder="e.g. AH-APEX-F1-CONFIRMED-82910"
                className="flex-1 uppercase font-mono bg-[#111] border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF2E88]"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white font-extrabold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(255,46,136,0.3)] cursor-pointer"
              >
                VALIDATE
              </button>
            </div>
          </form>

          {/* Scan Result Feedback Banner */}
          {scanResult && (
            <div
              className={`p-5 rounded-2xl border text-left space-y-3 transition-all ${
                scanResult.success
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/30'
                  : 'bg-red-950/60 border-red-500 text-red-100 ring-2 ring-red-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-base">
                      {scanResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED / WARNING'}
                    </h4>
                    <p className="text-xs opacity-90">{scanResult.message}</p>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="text-xs px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 hover:bg-white/10 text-white/80 cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {scanResult.success && scanResult.data && (
                <div className="bg-[#050505] rounded-xl p-3.5 space-y-2 border border-white/10 text-xs">
                  {scanResult.type === 'booking' && (() => {
                    const b = scanResult.data as Booking;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-white/50">VIP Table:</span>
                          <span className="font-extrabold text-[#FF2E88]">{b.table_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Guest Name:</span>
                          <span className="font-bold text-white">{b.customer_name} ({b.guest_count} Guests)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Min Consumable:</span>
                          <span className="font-bold text-white font-mono">{formatPeso(b.min_spend_cents)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Deposit Paid:</span>
                          <span className="font-bold text-emerald-400 font-mono">{formatPeso(b.deposit_paid_cents)}</span>
                        </div>
                      </>
                    );
                  })()}

                  {scanResult.type === 'guestlist' && (() => {
                    const gl = scanResult.data as GuestListEntry;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-white/50">Pass Type:</span>
                          <span className="font-extrabold text-emerald-400">Ambassador Guest List</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Admitted PAX:</span>
                          <span className="font-bold text-white">{gl.pax} Guests Total</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Ambassador Perk:</span>
                          <span className="font-bold text-amber-300">{gl.ambassador_perk}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Quick Test Passes for Tonight (Right 5 cols) */}
        <div className="lg:col-span-5 bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                Active Door Queue Tonight ({todayStr})
              </h3>
            </div>

            <p className="text-xs text-white/50 mt-2 mb-3">
              Tap any test pass below to instantly simulate scanning at the door:
            </p>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-[#FF2E88] uppercase block">
                VIP Table Reservations ({todayBookings.length})
              </span>
              {todayBookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setInputCode(b.qr_code);
                    handleVerify(b.qr_code);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    b.checked_in_at
                      ? 'bg-[#050505]/60 border-white/5 text-white/40'
                      : 'bg-[#050505] border-white/10 hover:border-[#FF2E88]/40 text-white/80'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">{b.customer_name} ({b.guest_count} pax)</p>
                    <p className="text-[10px] text-[#FF2E88] font-mono mt-0.5">{b.qr_code}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${b.checked_in_at ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {b.checked_in_at ? 'Checked In' : 'Tap to Scan'}
                  </span>
                </button>
              ))}

              <span className="text-[10px] font-bold text-emerald-400 uppercase block pt-2">
                Guest List Passes ({todayGuestlist.length})
              </span>
              {todayGuestlist.map(gl => (
                <button
                  key={gl.id}
                  onClick={() => {
                    setInputCode(gl.qr_code);
                    handleVerify(gl.qr_code);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    gl.checked_in_at
                      ? 'bg-[#050505]/60 border-white/5 text-white/40'
                      : 'bg-[#050505] border-white/10 hover:border-emerald-500/40 text-white/80'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">{gl.guest_name} (+{gl.pax - 1} pax)</p>
                    <p className="text-[10px] text-emerald-300 font-mono mt-0.5">{gl.qr_code}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${gl.checked_in_at ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {gl.checked_in_at ? 'Checked In' : 'Tap to Scan'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/40">
              🔒 AfterHours Bouncer System prevents screenshot pass re-use and double entries.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
