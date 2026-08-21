import React, { useState } from 'react';
import { Club } from '../types';
import { db } from '../lib/storage';
import { X, Sparkles, Send, Bot, User as UserIcon, Flame, Music, ArrowRight, ShieldCheck } from 'lucide-react';

interface AmbassadorConciergeProps {
  onClose: () => void;
  onSelectClub: (club: Club) => void;
  onJoinGuestList: (club: Club) => void;
  onBookTable: (club: Club) => void;
}

interface Message {
  id: string;
  sender: 'aria' | 'user';
  text: string;
  recommendedClubId?: string;
  time: string;
}

export const AmbassadorConcierge: React.FC<AmbassadorConciergeProps> = ({
  onClose,
  onSelectClub,
  onJoinGuestList,
  onBookTable,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'aria',
      text: "Maayong gabii! I'm Aria, your automated nightlife ambassador for Cebu City. 🌟 Tell me your vibe tonight: Are you looking for heavy EDM & festival lasers, smooth R&B & hip-hop cocktails, or an open-air rooftop skyline?",
      time: 'Just now',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const clubs = db.getClubs();

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Intelligent Nightlife Recommendation Engine
    setTimeout(() => {
      let replyText = '';
      let targetClubId: string | undefined;

      const lower = text.toLowerCase();
      if (lower.includes('edm') || lower.includes('festival') || lower.includes('big') || lower.includes('dj') || lower.includes('laser')) {
        targetClubId = 'clb_apex';
        replyText = "For maximum energy and massive EDM drops, **Club Apex Cebu** at Reclamation / Time Square is undefeated tonight! Their 20-meter 4K LED chandelier and CO2 cannons are legendary. I can get you an express VIP door pass or lock in a Mezzanine Booth!";
      } else if (lower.includes('hip hop') || lower.includes('hip-hop') || lower.includes('rnb') || lower.includes('urban') || lower.includes('cocktail') || lower.includes('intimate')) {
        targetClubId = 'clb_trademark';
        replyText = "You definitely want **Trademark Cebu** at 88th Avenue, Banilad. Super sleek urban crowd, world-class Hip-Hop and Afrobeats, and high-end craft mixology. Plus, our ambassador perk gives you a free signature bourbon shooter on guest list!";
      } else if (lower.includes('rooftop') || lower.includes('view') || lower.includes('skyline') || lower.includes('deep house') || lower.includes('chill') || lower.includes('date')) {
        targetClubId = 'clb_verified';
        replyText = "Head to **Verified Sky Lounge** on the 22nd floor of Cebu IT Park! 360-degree views of the city lights, sunset melodic house into deep techno, and luxury skyline cabanas. Complimentary Prosecco on arrival through AfterHours!";
      } else if (lower.includes('mango') || lower.includes('budget') || lower.includes('wild') || lower.includes('strip')) {
        targetClubId = 'clb_icon';
        replyText = "If you want to experience the classic high-voltage energy of Mango Square, **Club Icon Mango** is the spot. Zero door cover with the AfterHours badge and 1-take-1 beer buckets before midnight!";
      } else {
        targetClubId = 'clb_sentral';
        replyText = "For a guaranteed fun night with great throwback R&B and energetic party crowds, **Sentral Bar & Lounge** at Crossroads Banilad never misses. Guest list is free before 11 PM!";
      }

      const ariaMsg: Message = {
        id: `aria_${Date.now()}`,
        sender: 'aria',
        text: replyText,
        recommendedClubId: targetClubId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, ariaMsg]);
      setIsTyping(false);
    }, 600);
  };

  const QUICK_PROMPTS = [
    "🔥 Best EDM & Mega Club tonight",
    "🥃 Hip-Hop & Craft Cocktails",
    "✨ Rooftop lounge in IT Park",
    "⚡ Free Guest List with perks",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#050505] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF2E88] to-[#8B5CF6] p-[2px]">
                <div className="w-full h-full bg-[#050505] rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#FF2E88]" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050505] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Aria &bull; Cebu Nightlife Ambassador</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30 font-semibold">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-white/50">Zero promoter fees &bull; Instant VIP perks &bull; Full-day table locks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAria = msg.sender === 'aria';
            const matchedClub = msg.recommendedClubId ? clubs.find(c => c.id === msg.recommendedClubId) : null;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAria ? 'justify-start' : 'justify-end'}`}
              >
                {isAria && (
                  <div className="w-8 h-8 rounded-xl bg-[#FF2E88]/15 border border-[#FF2E88]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[#FF2E88]" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isAria ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAria
                        ? 'bg-[#111] text-white/90 border border-white/10 rounded-tl-none shadow-md'
                        : 'bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] text-white rounded-tr-none shadow-[0_0_15px_rgba(255,46,136,0.3)]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Embedded Match Card if club recommended */}
                  {matchedClub && (
                    <div className="p-3.5 bg-[#050505] border border-white/15 rounded-2xl text-left space-y-2.5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-xs">{matchedClub.name}</h4>
                          <p className="text-[10px] text-white/50">{matchedClub.area} &bull; {matchedClub.music_genres.join(', ')}</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          ★ {matchedClub.curator_rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onJoinGuestList(matchedClub);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
                        >
                          Free Guest List
                        </button>
                        <button
                          onClick={() => {
                            onBookTable(matchedClub);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 text-white text-[11px] font-bold shadow-[0_0_10px_rgba(255,46,136,0.25)] transition-all cursor-pointer"
                        >
                          Book Table
                        </button>
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-white/40 block px-1">{msg.time}</span>
                </div>

                {!isAria && (
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-white/50 pl-11">
              <span className="w-2 h-2 rounded-full bg-[#FF2E88] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-200" />
              <span className="text-[11px]">Aria is checking live table availability...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-[#050505]/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#050505]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask Aria about tonight's party, tables, dress code..."
              className="flex-1 bg-[#111] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FF2E88]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] hover:opacity-90 disabled:opacity-40 text-white shadow-[0_0_15px_rgba(255,46,136,0.3)] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
