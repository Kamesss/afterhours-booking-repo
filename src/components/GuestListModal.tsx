import React, { useState } from 'react';
import { Club, GuestListEntry } from '../types';
import { db } from '../lib/storage';
import { firePassConfetti } from '../lib/formatters';
import { X, Gift, Sparkles, Clock, Users, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface GuestListModalProps {
  club: Club;
  onClose: () => void;
  onSuccess: (entry: GuestListEntry) => void;
}

export const GuestListModal: React.FC<GuestListModalProps> = ({
  club,
  onClose,
  onSuccess,
}) => {
  const currentUser = db.getCurrentUser();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const [eventDate, setEventDate] = useState<string>(todayStr);
  const [guestName, setGuestName] = useState<string>(currentUser.name);
  const [guestEmail, setGuestEmail] = useState<string>(currentUser.email);
  const [guestPhone, setGuestPhone] = useState<string>(currentUser.phone || '+63 917 ');
  const [pax, setPax] = useState<number>(2);
  const [arrivalTimeEstimate, setArrivalTimeEstimate] = useState<string>('22:30');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Please provide your name and email for the door list.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await db.joinGuestList({
        club_id: club.id,
        user_id: currentUser.id,
        event_date: eventDate,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        pax,
        arrival_time_estimate: arrivalTimeEstimate,
      });

      setIsSubmitting(false);

      if (!res.success || !res.entry) {
        setError(res.error || 'Failed to generate guest list pass.');
        return;
      }

      firePassConfetti();
      onSuccess(res.entry);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to generate guest list pass.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-[#050505] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Ambassador Guest List Pass
              </h2>
              <p className="text-xs text-white/50">
                {club.name} &bull; Free Door Entry & Ambassador Perks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          
          {/* Automated Ambassador Perk Box */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#111] to-[#050505] border border-emerald-500/30 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tonight's Ambassador Perk Unlocked:</span>
            </div>
            <p className="text-xs text-white font-medium">
              {club.ambassador_perks[0] || 'Free Express Door Admission before midnight'}
            </p>
            <p className="text-[11px] text-white/50">
              Show your digital QR pass to the host at the entrance for immediate validation.
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80">
              Select Date of Entry
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventDate(todayStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  eventDate === todayStr
                    ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}
              >
                Tonight ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setEventDate(tomorrowStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  eventDate === tomorrowStr
                    ? 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}
              >
                Tomorrow ({tomorrowStr})
              </button>
            </div>
          </div>

          {/* Guest Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-white/50 mb-1">Primary Guest Name (As on ID)</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Email for Digital Pass</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Total Guests (Pax)</label>
                <select
                  value={pax}
                  onChange={e => setPax(Number(e.target.value))}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                >
                  <option value={1}>1 Person (Solo)</option>
                  <option value={2}>2 People (Pair)</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4 People (Max Guestlist)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-white/50 mb-1">Target Arrival</label>
                <select
                  value={arrivalTimeEstimate}
                  onChange={e => setArrivalTimeEstimate(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
                >
                  <option value="22:00">10:00 PM</option>
                  <option value="22:30">10:30 PM (Best)</option>
                  <option value="23:00">11:00 PM</option>
                  <option value="23:30">11:30 PM (Cutoff)</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="generate-guestlist-pass-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white font-black text-sm tracking-wide shadow-[0_0_20px_rgba(255,46,136,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Issuing Ambassador Pass...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <span>CLAIM FREE AMBASSADOR PASS</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-white/40">
            Age policy: 18+ valid government ID required at door. Dress code strictly enforced.
          </p>

        </form>

      </div>
    </div>
  );
};
