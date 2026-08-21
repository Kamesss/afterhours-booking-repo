// ============================================================================
// GUESTLIST PASS MODAL WITH CUTOFF ENFORCEMENT & INSTANT QR ISSUANCE
// ============================================================================
import React, { useState } from 'react';
import { Venue, GuestlistEntry } from '../types';
import { clientStore } from '../lib/storage';
import { Sparkles, Users, Clock, Calendar, CheckCircle2, ShieldCheck, X, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  venue: Venue;
  onClose: () => void;
  onSuccess: (pass: GuestlistEntry) => void;
}

export const GuestListModal: React.FC<Props> = ({
  venue,
  onClose,
  onSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-21');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [promoterCode, setPromoterCode] = useState<string>('');
  const [promoterVerified, setPromoterVerified] = useState<boolean>(false);
  const [promoterName, setPromoterName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentUser = clientStore.getCurrentUser();

  const handleVerifyPromoter = async () => {
    if (!promoterCode.trim()) return;
    const cleanCode = promoterCode.trim().toUpperCase();
    const matched = clientStore.getUsers().find(u => u.promoter_code === cleanCode);
    if (matched) {
      setPromoterVerified(true);
      setPromoterName(matched.full_name);
      setErrorMsg(null);
    } else {
      setPromoterVerified(false);
      setPromoterName('');
      setErrorMsg('Promoter code not found. Pass will still be created with standard venue entry.');
    }
  };

  const handleClaimPass = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const pass = await clientStore.createGuestlistPass({
        venue_id: venue.id,
        target_date: selectedDate,
        guest_count: guestCount,
        promoter_code: promoterVerified ? promoterCode.trim().toUpperCase() : null,
        cutoff_time: venue.guestlist_cutoff_time
      });

      onSuccess(pass);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to claim door pass.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">VIP Guestlist Pass</h3>
              <p className="text-xs text-zinc-400">{venue.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Free Door Entry Badge */}
          <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-orange-300">Complimentary Door Entry</p>
              <p className="text-zinc-400">Entry valid before strict door cutoff time: <strong className="text-white font-mono">{venue.guestlist_cutoff_time}</strong></p>
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Target Night</span>
            </label>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
            >
              <option value="2026-08-21">Tonight (Friday, Aug 21, 2026)</option>
              <option value="2026-08-22">Saturday Night (Aug 22, 2026)</option>
              <option value="2026-08-23">Sunday Special (Aug 23, 2026)</option>
            </select>
          </div>

          {/* Pax */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>Party Size</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuestCount(num)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                    guestCount === num
                      ? 'bg-orange-500 text-black border-orange-400 shadow-md shadow-orange-500/20'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </button>
              ))}
            </div>
          </div>

          {/* Promoter Code */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Ambassador / Promoter Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. CEBU_VIP_CARLO"
                value={promoterCode}
                onChange={e => {
                  setPromoterCode(e.target.value);
                  setPromoterVerified(false);
                }}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleVerifyPromoter}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition"
              >
                Apply
              </button>
            </div>
            {promoterVerified && (
              <p className="text-xs text-emerald-400 flex items-center space-x-1 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attributed to Ambassador <strong>{promoterName}</strong></span>
              </p>
            )}
          </div>

          {/* Cutoff Warning */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Door Cutoff Strict Enforcement</span>
            </div>
            <p className="text-[11px]">
              Present your QR pass at the entrance before <strong className="text-white font-mono">{venue.guestlist_cutoff_time}</strong>. Arrivals past cutoff are subject to standard door cover charge.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleClaimPass}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-black font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'Generating Digital Pass...' : 'Claim Free Guestlist Pass'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
