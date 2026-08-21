import confetti from 'canvas-confetti';

export function formatPeso(cents: number, showDecimals: boolean = false): string {
  const pesos = cents / 100;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(pesos);
}

export function formatDatePretty(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  if (isToday) return `Tonight (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
  if (isTomorrow) return `Tomorrow (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function firePassConfetti(): void {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });
  } catch (e) {
    // Ignore if canvas confetti isn't ready
  }
}

export const CEBU_DISTRICTS = [
  'All Cebu Districts',
  'Crossroads Banilad',
  'Mandaue / Reclamation',
  'Cebu IT Park',
  'Mango Square',
] as const;
