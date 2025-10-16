export interface Category {
    id: string;
    name: string;
    description?: string;
    slug: string;
    image?: string;
    icon?: string;
    parent_id?: string;
    parent?: Category;
    children?: Category[];
    level: number;
    sort_order: number;
    is_active: boolean;
    is_featured: boolean;
    products_count: number;
    seo?: {
      meta_title?: string;
      meta_description?: string;
    };
    created_at: string;
    updated_at: string;
  }
  
  