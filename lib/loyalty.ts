import { User } from '../types';

export interface LoyaltyTier {
  id: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  name: string;
  minPoints: number;
  maxPoints: number; // Use Infinity for Diamond
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  perks: string[];
  description: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: '#CD7F32',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/5',
    borderColor: 'border-amber-500/30 dark:border-amber-500/10',
    textColor: 'text-amber-700 dark:text-amber-400',
    accentColor: 'from-amber-600 to-amber-800',
    description: 'Entry-level loyalty member. Add funds to unlock higher tiers.',
    perks: [
      'Standard Speed Downloads',
      'Basic Support Queue',
      'Standard Processing Times'
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    color: '#C0C0C0',
    bgColor: 'bg-slate-400/15 dark:bg-slate-400/10',
    borderColor: 'border-slate-400/40 dark:border-slate-400/20',
    textColor: 'text-slate-700 dark:text-slate-300',
    accentColor: 'from-slate-400 to-slate-600',
    description: 'Active supporter tier. Gain priority queues and responsive support.',
    perks: [
      'Priority WhatsApp Support Response',
      'Faster Order Validation & Approvals',
      'Access to Silver-level Releases',
      '1% bonus on all bulk wallet additions'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 3499,
    color: '#FFD700',
    bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/5',
    borderColor: 'border-yellow-500/30 dark:border-yellow-500/10',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    accentColor: 'from-yellow-500 to-yellow-600',
    description: 'Valued premium partner. Premium pricing support and rapid replies.',
    perks: [
      'Direct WhatsApp Line to Chief Admin',
      '5% Flat Discount on Custom Orders & IMEIs',
      'Express Order Approvals (typically under 1 hour)',
      'Unlocked high-speed firmware download pipes'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 3500,
    maxPoints: 7499,
    color: '#E5E4E2',
    bgColor: 'bg-cyan-500/15 dark:bg-cyan-500/10',
    borderColor: 'border-cyan-500/40 dark:border-cyan-500/20',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    accentColor: 'from-cyan-500 to-cyan-600',
    description: 'Vanguard flashing professional. Enterprise level turnaround times.',
    perks: [
      'VIP Flashing Support & Custom IMEI Auditing',
      '10% Flat Discount on Custom Requests',
      'Super Priority Queue (Instant auto-routing for approvals)',
      'Early access to beta firmware and private tools'
    ]
  },
  {
    id: 'diamond',
    name: 'VIP Diamond',
    minPoints: 7500,
    maxPoints: Infinity,
    color: '#B9F2FF',
    bgColor: 'bg-blue-500/20 dark:bg-blue-500/10',
    borderColor: 'border-blue-500/40 dark:border-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    accentColor: 'from-blue-500 via-indigo-500 to-cyan-500',
    description: 'Elite reseller tier. The highest level of privileges and discounts.',
    perks: [
      'Elite Partner - direct Skype/Telegram voice backchannel',
      '15% Reseller Discount on all orders and packages',
      'Absolute Highest Priority: Instant Delivery Guarantee',
      'Personal account representative for complex flashing projects'
    ]
  }
];

/**
 * Calculates a user's total lifetime points/funds purchased/deposited.
 */
export const getLifetimePointsPurchased = (user: User | null): number => {
  if (!user) return 0;
  
  // Calculate based on positive deposits or admin adjustments in transaction history
  const transactions = user.transactionHistory || [];
  const positiveTxTotal = transactions
    .filter(tx => (tx.type === 'admin_adjustment' || tx.type === 'deposit') && tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Fallback to check if a local profile property is stored (just in case history is cleared)
  const directValue = (user as any).lifetimePointsPurchased || 0;

  return Math.max(positiveTxTotal, directValue);
};

/**
 * Retrieves the loyalty tier for a given score of points.
 */
export const getTierByPoints = (points: number): LoyaltyTier => {
  const matched = LOYALTY_TIERS.find(tier => points >= tier.minPoints && points <= tier.maxPoints);
  return matched || LOYALTY_TIERS[0];
};

/**
 * Retrieves the current user's loyalty tier object.
 */
export const getUserLoyaltyTier = (user: User | null): LoyaltyTier => {
  if (!user) return LOYALTY_TIERS[0];
  const points = getLifetimePointsPurchased(user);
  return getTierByPoints(points);
};

/**
 * Gets the next tier and points required to reach it.
 */
export const getNextTierDetails = (points: number) => {
  const currentTier = getTierByPoints(points);
  const currentIdx = LOYALTY_TIERS.findIndex(t => t.id === currentTier.id);
  
  if (currentIdx === -1 || currentIdx === LOYALTY_TIERS.length - 1) {
    return null; // Maximum tier reached
  }
  
  const nextTier = LOYALTY_TIERS[currentIdx + 1];
  const pointsNeeded = nextTier.minPoints - points;
  const totalTierRange = nextTier.minPoints - currentTier.minPoints;
  const currentTierProgress = points - currentTier.minPoints;
  const progressPercentage = Math.min(100, Math.max(0, (currentTierProgress / totalTierRange) * 100));

  return {
    nextTier,
    pointsNeeded,
    progressPercentage
  };
};
