import { ProductReview } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

export const ReviewService = {
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as ProductReview[];
        }
      }
    } catch {
      // Supabase table may not exist yet, fallback to local storage
    }

    const allReviews = await StorageService.getItem<ProductReview[]>(StorageKeys.REVIEWS, []);
    return allReviews.filter((r) => r.product_id === productId);
  },

  async submitReview(reviewInput: {
    product_id: string;
    customer_name: string;
    customer_avatar?: string;
    rating: number;
    comment: string;
    is_verified_purchase?: boolean;
  }): Promise<ProductReview> {
    const newReview: ProductReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      product_id: reviewInput.product_id,
      customer_name: reviewInput.customer_name || 'Anonymous Customer',
      customer_avatar: reviewInput.customer_avatar,
      rating: Math.max(1, Math.min(5, Math.round(reviewInput.rating))),
      comment: reviewInput.comment.trim(),
      is_verified_purchase: reviewInput.is_verified_purchase ?? true,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('product_reviews').insert([newReview]);
      }
    } catch {
      // Continue to local save
    }

    const existingReviews = await StorageService.getItem<ProductReview[]>(StorageKeys.REVIEWS, []);
    const updated = [newReview, ...existingReviews];
    await StorageService.setItem(StorageKeys.REVIEWS, updated);

    return newReview;
  },

  async getRatingSummary(productId: string): Promise<{ average: number; count: number; breakdown: Record<number, number> }> {
    const reviews = await this.getProductReviews(productId);
    if (reviews.length === 0) {
      return { average: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      sum += r.rating;
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    const average = Number((sum / reviews.length).toFixed(1));
    return {
      average,
      count: reviews.length,
      breakdown,
    };
  },
};
