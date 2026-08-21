import React from 'react';
import { Club, ClubTable, TableType } from '../types';
import { db } from '../lib/storage';
import { formatPeso } from '../lib/formatters';
import { Lock, CheckCircle2, Sparkles, Users, Wine, Info } from 'lucide-react';

interface InteractiveFloorPlanProps {
  club: Club;
  selectedDate: string;
  selectedTable: ClubTable | null;
  onSelectTable: (table: ClubTable, tableType: TableType) => void;
}

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
  club,
  selectedDate,
  selectedTable,
  onSelectTable,
}) => {
  const tables = db.getClubTables(club.id);
  const tableTypes = db.getTableTypes(club.id);

  const getTableType = (typeId: string): TableType | undefined => {
    return tableTypes.find(t => t.id === typeId);
  };

  return (
    <div className="space-y-4">
      {/* Floor Plan Legend & Date Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0A0A0B] border border-white/10 rounded-xl text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/80 inline-block shadow-sm" />
            <span className="text-white/80 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-[#FF2E88] to-[#8B5CF6] border border-white inline-block shadow-[0_0_8px_#FF2E88]" />
            <span className="text-white/80 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-950/60 border border-red-800/80 inline-block flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-red-400" />
            </span>
            <span className="text-white/40">Locked / Booked</span>
          </div>
        </div>
        <div className="text-[11px] text-white/50">
          Showing layout for: <span className="font-semibold text-white">{selectedDate}</span>
        </div>
      </div>

      {/* SVG Interactive Blueprint Canvas */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#050505] border border-white/10 rounded-2xl overflow-hidden p-4 select-none shadow-inner">
        {/* Architectural Grid & Ambient lighting */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* DJ Stage & LED Wall Top */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 bg-gradient-to-r from-[#FF2E88]/40 via-[#8B5CF6]/50 to-[#FF2E88]/40 border border-[#FF2E88]/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,46,136,0.25)]">
          <span className="text-[10px] font-black tracking-widest text-fuchsia-200 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            DJ BOOTH & 4K LED WALL
          </span>
        </div>

        {/* Dance Floor Zone Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-32 sm:h-44 rounded-2xl border border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-[#8B5CF6]/80 tracking-[0.3em] uppercase">MAIN DANCEFLOOR</span>
          <span className="text-[10px] text-white/40">Acoustic Sweet Spot</span>
        </div>

        {/* Main Bar Bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-56 sm:w-80 h-7 bg-[#111] border border-white/15 rounded-md flex items-center justify-center">
          <span className="text-[10px] font-bold tracking-wider text-white/50 flex items-center gap-1">
            <Wine className="w-3 h-3 text-amber-400" />
            PREMIUM COCKTAIL & SERVICE BAR
          </span>
        </div>

        {/* Entrance Left Bottom */}
        <div className="absolute bottom-2 left-3 text-[9px] text-white/40 font-mono border-l-2 border-emerald-500 pl-1.5">
          VIP / GUEST ENTRANCE
        </div>

        {/* Render Interactive Physical Tables */}
        {tables.map(table => {
          const type = getTableType(table.table_type_id);
          const { isAvailable } = db.getTableBookingStatus(table.id, selectedDate);
          const isSelected = selectedTable?.id === table.id;

          let colorStyles = '';
          if (isSelected) {
            colorStyles = 'bg-gradient-to-br from-[#FF2E88] to-[#8B5CF6] text-white border-2 border-white shadow-[0_0_20px_rgba(255,46,136,0.6)] scale-105 z-20 ring-4 ring-[#FF2E88]/30';
          } else if (!isAvailable) {
            colorStyles = 'bg-[#111]/80 text-white/30 border border-red-900/60 cursor-not-allowed opacity-60';
          } else if (type?.tier_badge === 'Ultra VIP') {
            colorStyles = 'bg-amber-950/40 text-amber-300 border-2 border-amber-500/70 hover:border-amber-400 hover:scale-105 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
          } else if (type?.tier_badge === 'VIP') {
            colorStyles = 'bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/50 hover:border-[#8B5CF6] hover:scale-105';
          } else {
            colorStyles = 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 hover:scale-105';
          }

          return (
            <button
              key={table.id}
              disabled={!isAvailable}
              onClick={() => type && onSelectTable(table, type)}
              style={{
                left: `${table.x}%`,
                top: `${table.y}%`,
                width: `${table.width || 12}%`,
                height: `${table.height || 10}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-200 cursor-pointer ${colorStyles}`}
              title={`${table.table_number} - ${type?.name || ''} (${isAvailable ? 'Available' : 'Booked'})`}
            >
              <div className="flex items-center justify-center gap-0.5">
                {!isAvailable && <Lock className="w-3 h-3 text-red-400 shrink-0" />}
                <span className="text-[10px] sm:text-xs font-black tracking-tight leading-none text-center truncate max-w-full">
                  {table.table_number.split(' ')[0]}
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] opacity-80 leading-none mt-0.5 hidden sm:block font-mono">
                {type ? formatPeso(type.min_spend_cents) : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Table Preview Banner */}
      {selectedTable && (() => {
        const type = getTableType(selectedTable.table_type_id);
        if (!type) return null;
        return (
          <div className="bg-gradient-to-r from-[#111] via-[#0A0A0B] to-[#050505] border border-[#FF2E88]/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Table {selectedTable.table_number}
                  </h4>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30">
                    {type.tier_badge}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">{selectedTable.location_description}</p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-[10px] text-white/40">Min Consumable</p>
                  <p className="text-base font-extrabold text-white font-mono">{formatPeso(type.min_spend_cents)}</p>
                </div>
                <div className="pl-3 border-l border-white/10">
                  <p className="text-[10px] text-white/40">Lock Deposit</p>
                  <p className="text-base font-extrabold text-emerald-400 font-mono">{formatPeso(type.deposit_cents)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                <span>Capacity: <strong>Up to {type.max_guests} Guests</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Deposit credited to bill consumable</span>
              </div>
            </div>

            {type.perks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {type.perks.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] bg-white/5 text-white/70 border border-white/10">
                    ✨ {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
