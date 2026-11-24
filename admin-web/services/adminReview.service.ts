import { ProductReviewItem } from '../types';

export const AdminReviewService = {
  async getReviews(status: 'all' | 'approved' | 'pending' = 'all', productId?: string): Promise<ProductReviewItem[]> {
    try {
      let url = `/api/reviews?status=${status}`;
      if (productId) {
        url += `&productId=${encodeURIComponent(productId)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
    return [];
  },

  async moderateReview(id: string, isApproved: boolean, adminEmail?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved, adminEmail }),
      });
      return res.ok;
    } catch (e) {
      console.error('Error moderating review:', e);
      return false;
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('Error deleting review:', e);
      return false;
    }
  },
};
