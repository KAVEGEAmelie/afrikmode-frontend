import { User } from './user.model';
import { Category } from './category.model';


export interface Store {
    id: string;
    name: string;
    description: string;
    slug: string;
    logo?: string;
    banner?: string;
    owner_id: string;
    owner?: User;
    category_id: string;
    category?: Category;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    is_verified: boolean;
    featured: boolean;
    address: string;
    phone: string;
    email: string;
    website?: string;
    social_links?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
    business_hours?: BusinessHours[];
    rating: number;
    reviews_count: number;
    products_count: number;
    orders_count: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface BusinessHours {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }