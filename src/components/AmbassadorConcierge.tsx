// ============================================================================
// VIP AMBASSADOR CONCIERGE & RECOMMENDATION CHAT
// ============================================================================
import React, { useState } from 'react';
import { clientStore } from '../lib/storage';
import { Venue } from '../types';
import { formatPHP } from '../lib/formatters';
import { Sparkles, Send, Bot, User, Lock, Ticket, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
  onSelectVenue: (venue: Venue) => void;
  onBookTable: (venue: Venue) => void;
}

export const AmbassadorConcierge: React.FC<Props> = ({
  onSelectVenue,
  onBookTable
}) => {
  const venues = clientStore.getVenues();
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'concierge' | 'user';
    text: string;
    suggestedVenueId?: string;
  }>>([
    {
      id: '1',
      sender: 'concierge',
      text: "Mabuhay! I'm Carlo, your AfterHours Cebu VIP Ambassador. Whether you want a high-energy multi-level megaclub like Kazmik, urban hip-hop vibes at Trademark, or an open-air roofdeck cocktail lounge at Verified, tell me what music or vibe you're craving tonight!"
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: userText
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Intelligent recommendation matching
    setTimeout(() => {
      let reply = "Here's what I recommend for tonight in Cebu:";
      let matchedVenue: Venue | undefined;

      const lower = userText.toLowerCase();
      if (lower.includes('hip') || lower.includes('rnb') || lower.includes('trademark') || lower.includes('urban')) {
        matchedVenue = venues.find(v => v.id === 'ven_trademark');
        reply = "For top-tier Hip-Hop, R&B, and Cebu's elite urban crowd, Trademark Cebu at 88th Avenue is unbeatable tonight! VIP tables start from ₱25,000 min spend.";
      } else if (lower.includes('cocktail') || lower.includes('chill') || lower.includes('speakeasy') || lower.includes('morals')) {
        matchedVenue = venues.find(v => v.id === 'ven_morals');
        reply = "If you're seeking artisanal botanical cocktails and deep vinyl beats, Morals & Malice at BTC Banilad is the perfect vibe.";
      } else if (lower.includes('roof') || lower.includes('view') || lower.includes('sunset') || lower.includes('verified')) {
        matchedVenue = venues.find(v => v.id === 'ven_verified');
        reply = "Verified Lounge in Cebu Business Park offers open-air rooftop views, afro-house beats, and premium cabana lounges.";
      } else if (lower.includes('mango') || lower.includes('icon') || lower.includes('wild')) {
        matchedVenue = venues.find(v => v.id === 'ven_club_icon');
        reply = "Club ICON at Mango Square is legendary for energetic big-room festival sounds and late-night partying until 6 AM!";
      } else {
        matchedVenue = venues.find(v => v.id === 'ven_kazmik');
        reply = "Kazmik Club in IT Park is Cebu's flagship high-energy megaclub! Multi-level staging, festival lighting, and VIP couch tables.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'concierge',
          text: reply,
          suggestedVenueId: matchedVenue?.id
        }
      ]);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">VIP Concierge & Ambassador Desk</h2>
            <p className="text-xs text-zinc-400 font-mono">Real-time table recommendations & guestlist coordination</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
          Online Tonight
        </span>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col h-[520px]">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(m => {
            const isConcierge = m.sender === 'concierge';
            const suggested = m.suggestedVenueId ? venues.find(v => v.id === m.suggestedVenueId) : undefined;

            return (
              <div key={m.id} className={`flex flex-col ${isConcierge ? 'items-start' : 'items-end'}`}>
                <div className={`flex items-start space-x-2.5 max-w-xl ${isConcierge ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isConcierge ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-white'
                  }`}>
                    {isConcierge ? 'VIP' : 'YOU'}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isConcierge 
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-md' 
                      : 'bg-orange-500 text-black font-medium'
                  }`}>
                    {m.text}
                  </div>
                </div>

                {/* Suggested Venue Quick Card */}
                {suggested && (
                  <div className="mt-3 ml-10 p-4 rounded-2xl bg-zinc-900 border border-orange-500/40 max-w-md space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{suggested.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                        Cutoff: {suggested.guestlist_cutoff_time}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{suggested.address}</p>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onBookTable(suggested)}
                        className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition flex items-center justify-center space-x-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Reserve Table</span>
                      </button>
                      <button
                        onClick={() => onSelectVenue(suggested)}
                        className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition font-mono"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            placeholder="Ask about hip-hop venues, table minimums, or guestlist cutoffs..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition flex items-center space-x-1 shadow-lg shadow-orange-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};
