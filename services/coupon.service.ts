import { Coupon } from '../types';
import { StorageService, StorageKeys } from './storage.service';

const ACTIVE_COUPONS: Coupon[] = [
  {
    code: 'EASY10',
    type: 'percentage',
    value: 10,
    min_spend: 10000,
    description: '10% off on orders above ₦10,000',
    is_active: true,
  },
  {
    code: 'EASY20',
    type: 'percentage',
    value: 20,
    min_spend: 30000,
    description: '20% off on orders above ₦30,000',
    is_active: true,
  },
  {
    code: 'FREESHIP',
    type: 'free_delivery',
    value: 2000,
    min_spend: 15000,
    description: 'Free Delivery on orders above ₦15,000',
    is_active: true,
  },
  {
    code: 'WELCOME5000',
    type: 'fixed',
    value: 5000,
    min_spend: 25000,
    description: '₦5,000 flat discount on orders above ₦25,000',
    is_active: true,
  },
];

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export const CouponService = {
  /**
   * Validates a coupon code against subtotal and delivery fee
   */
  validateCoupon(
    rawCode: string,
    subtotal: number,
    deliveryFee: number = 2000
  ): CouponValidationResult {
    const code = (rawCode || '').trim().toUpperCase();

    if (!code) {
      return { isValid: false, discountAmount: 0, message: 'Please enter a coupon code.' };
    }

    const coupon = ACTIVE_COUPONS.find((c) => c.code === code && c.is_active);

    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Coupon code "${code}" is invalid or expired.`,
      };
    }

    if (coupon.min_spend && subtotal < coupon.min_spend) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Coupon "${code}" requires a minimum spend of ₦${coupon.min_spend.toLocaleString()}.`,
      };
    }

    let discountAmount = 0;

    if (coupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'free_delivery') {
      discountAmount = deliveryFee;
    }

    return {
      isValid: true,
      coupon,
      discountAmount,
      message: `Coupon "${code}" applied! You save ₦${discountAmount.toLocaleString()}.`,
    };
  },

  /**
   * Get all available promotional coupon codes for customer display
   */
  getAvailableCoupons(): Coupon[] {
    return ACTIVE_COUPONS.filter((c) => c.is_active);
  },

  /**
   * Store or remove currently applied coupon
   */
  async saveAppliedCoupon(coupon: Coupon): Promise<void> {
    await StorageService.setItem(StorageKeys.APPLIED_COUPON, coupon);
  },

  async getAppliedCoupon(): Promise<Coupon | null> {
    return await StorageService.getItem<Coupon | null>(StorageKeys.APPLIED_COUPON, null);
  },

  async removeAppliedCoupon(): Promise<void> {
    await StorageService.removeItem(StorageKeys.APPLIED_COUPON);
  },
};
