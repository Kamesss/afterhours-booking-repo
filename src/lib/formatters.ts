// ============================================================================
// FORMATTERS & UTILITIES FOR AFTERHOURS CEBU
// ============================================================================
import { TableCategory, BookingStatus, GuestlistStatus, UserRole } from '../types';

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatCategory(cat: TableCategory): string {
  switch (cat) {
    case 'VIP_COUCH':
      return 'VIP Couch';
    case 'DANCEFLOOR_HIGH':
      return 'Dancefloor High Table';
    case 'COCKTAIL':
      return 'Cocktail Stand';
    case 'OWNER_BOOTH':
      return 'Owner Booth';
    default:
      return cat;
  }
}

export function getCategoryBadgeClass(cat: TableCategory): string {
  switch (cat) {
    case 'OWNER_BOOTH':
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    case 'VIP_COUCH':
      return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    case 'DANCEFLOOR_HIGH':
      return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    case 'COCKTAIL':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
}

export function getBookingStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    case 'CHECKED_IN':
      return 'bg-blue-950/80 text-blue-300 border-blue-800';
    case 'PENDING_PAYMENT':
      return 'bg-amber-950/80 text-amber-300 border-amber-800';
    case 'DRAFT':
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    case 'EXPIRED':
    case 'CANCELLED':
      return 'bg-rose-950/80 text-rose-300 border-rose-800';
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
}

export function getGuestlistStatusBadgeClass(status: GuestlistStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    case 'CHECKED_IN':
      return 'bg-blue-950/80 text-blue-300 border-blue-800';
    case 'EXPIRED_CUTOFF':
      return 'bg-rose-950/80 text-rose-300 border-rose-800';
    case 'REVOKED':
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
}

export function formatRole(role: UserRole): string {
  switch (role) {
    case 'CUSTOMER':
      return 'VIP Guest';
    case 'PROMOTER':
      return 'Official Promoter';
    case 'VENUE_STAFF':
      return 'Door Host / Staff';
    case 'VENUE_MANAGER':
      return 'General Manager';
    case 'ADMIN':
      return 'System Administrator';
    default:
      return role;
  }
}
