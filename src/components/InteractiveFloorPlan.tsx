// ============================================================================
// INTERACTIVE 2D NIGHTCLUB FLOOR PLAN WITH ATOMIC OCCUPANCY & RESERVATIONS
// ============================================================================
import React from 'react';
import { TableItem, TableCategory } from '../types';
import { formatPHP, formatCategory } from '../lib/formatters';
import { Users, Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  tables: TableItem[];
  selectedTableId: string | null;
  onSelectTable: (table: TableItem) => void;
  bookedTableIds: string[];
  currentDate: string;
}

export const InteractiveFloorPlan: React.FC<Props> = ({
  tables,
  selectedTableId,
  onSelectTable,
  bookedTableIds,
  currentDate
}) => {
  const getTableShapeStyle = (category: TableCategory, isBooked: boolean, isSelected: boolean) => {
    if (isBooked) {
      return 'bg-zinc-800/80 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-60';
    }
    if (isSelected) {
      return 'bg-orange-500 text-black border-white ring-4 ring-orange-500/40 font-bold scale-110 shadow-lg shadow-orange-500/30';
    }

    switch (category) {
      case 'OWNER_BOOTH':
        return 'bg-purple-900/60 border-purple-500/80 text-purple-200 hover:bg-purple-800/70 hover:border-purple-400';
      case 'VIP_COUCH':
        return 'bg-amber-900/60 border-amber-500/80 text-amber-200 hover:bg-amber-800/70 hover:border-amber-400';
      case 'DANCEFLOOR_HIGH':
        return 'bg-blue-900/60 border-blue-500/80 text-blue-200 hover:bg-blue-800/70 hover:border-blue-400';
      case 'COCKTAIL':
        return 'bg-emerald-900/60 border-emerald-500/80 text-emerald-200 hover:bg-emerald-800/70 hover:border-emerald-400';
      default:
        return 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Floor Plan Stage Container */}
      <div className="relative w-full aspect-[16/10] bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 overflow-hidden shadow-2xl">
        {/* Background Grid & DJ Booth Decor */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        
        {/* Stage / DJ Center Header */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-orange-500/20 border border-orange-500/40 text-[11px] font-mono tracking-widest text-orange-300 uppercase shadow-lg shadow-orange-500/10">
          🎧 DJ BOOTH & MAIN STAGE
        </div>

        {/* Dancefloor Center Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-28 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-600">
            DANCE FLOOR
          </span>
        </div>

        {/* Interactive Tables Placed According to coord_x & coord_y */}
        {tables.map(table => {
          const isBooked = bookedTableIds.includes(table.id);
          const isSelected = selectedTableId === table.id;

          return (
            <button
              key={table.id}
              onClick={() => !isBooked && onSelectTable(table)}
              disabled={isBooked}
              style={{
                left: `${table.coord_x}%`,
                top: `${table.coord_y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute p-2 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[84px] min-h-[56px] text-center group ${getTableShapeStyle(
                table.category,
                isBooked,
                isSelected
              )}`}
            >
              <div className="flex items-center space-x-1">
                {isBooked ? (
                  <Lock className="w-3 h-3 text-zinc-500" />
                ) : isSelected ? (
                  <CheckCircle2 className="w-3 h-3 text-black" />
                ) : null}
                <span className="text-xs font-bold font-mono tracking-tight">
                  {table.table_number}
                </span>
              </div>

              <div className="flex items-center space-x-1 text-[10px] opacity-80 mt-0.5">
                <Users className="w-2.5 h-2.5" />
                <span>{table.capacity}p</span>
              </div>

              <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-black font-semibold' : 'text-emerald-400'}`}>
                {formatPHP(table.min_spend_php)}
              </span>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none hidden group-hover:block z-30 w-44 p-2 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl text-left">
                <p className="text-xs font-bold text-white">{table.table_number}</p>
                <p className="text-[10px] text-zinc-400">{formatCategory(table.category)}</p>
                <div className="mt-1 pt-1 border-t border-zinc-800 text-[10px] space-y-0.5">
                  <p className="text-zinc-300">Capacity: <span className="text-white">{table.capacity} guests</span></p>
                  <p className="text-zinc-300">Min Spend: <span className="text-emerald-400 font-semibold">{formatPHP(table.min_spend_php)}</span></p>
                  <p className="text-zinc-300">Deposit Lock: <span className="text-amber-400 font-semibold">{formatPHP(table.deposit_required_php)}</span></p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500/80 border border-purple-400" />
            <span className="text-zinc-400">Owner Booth</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400" />
            <span className="text-zinc-400">VIP Couch</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500/80 border border-blue-400" />
            <span className="text-zinc-400">Dancefloor High</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400" />
            <span className="text-zinc-400">Cocktail</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
            <span className="text-zinc-400">Reserved / Locked</span>
          </div>
        </div>

        <span className="text-[11px] text-zinc-400 font-mono">
          Target Date: <strong className="text-white">{currentDate}</strong>
        </span>
      </div>
    </div>
  );
};
