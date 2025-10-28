import { User } from './user.model';
import { Product } from './product.model';

export interface Review {
    id: string;
    product_id: string;
    product?: Product;
    user_id: string;
    user?: User;
    order_id?: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
    is_verified_purchase: boolean;
    is_approved: boolean;
    helpful_count: number;
    vendor_response?: string;  // Réponse du vendeur
    vendor_response_date?: string;  // Date de la réponse
    created_at: string;
    updated_at: string;
  }
  
  export interface ReviewStats {
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      [key: number]: number;
    };
  }