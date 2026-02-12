/**
 * Product types matching the backend data structure
 */

export interface Product {
  VARIATION_ID: string;
  ITEM_ID: string;
  ITEM_NAME: string;
  COLOR: string;
  SECONDARYCOLOUR: string;
  IMAGE_URL: string[];
  CLEARANCE: boolean;
  PRODUCT_DESCRIPTION: string;
  DEPARTMENT_DESCRIPTION: string;
  CATEGORY: string;
  CLASS_DESCRIPTION: string;
  SUB_CLASS_DESCRIPTION: string;
  DETAILED_DESCRIPTION: string;
  PRIMARY_CATEGORY: string;
  PRICE: number;
  generated_tags: string[];
}

export interface FilterResponse {
  products: Product[];
  count: number;
  filters_applied: {
    category: string | null;
    color: string | null;
    min_price: number | null;
    max_price: number | null;
  };
}

export interface CategoriesResponse {
  categories: string[];
  count: number;
}

export interface ColorsResponse {
  colors: string[];
  count: number;
}

export interface PriceRangeResponse {
  min_price: number;
  max_price: number;
}

export interface StyleOption {
  value: string;
  label: string;
  description?: string;
}

export interface MoodsResponse {
  moods: StyleOption[];
}

export interface StylesResponse {
  styles: StyleOption[];
}

export interface ColorThemesResponse {
  color_themes: StyleOption[];
}

export interface RoomsResponse {
  rooms: StyleOption[];
}

export interface StylingPlan {
  scene_prompt: string;
  scene_description: string;
  styling_parameters: {
    mood: string;
    style: string;
    color_theme: string;
    room_type: string;
  };
  product_count: number;
  products_included: string[];
  feedback_applied?: string;
  is_refinement?: boolean;
}

export interface GenerateStyleRequest {
  product_ids: string[];
  mood: string;
  style: string;
  color_theme: string;
  room_type: string;
  model_quality: 'fast' | 'high';
}

export interface GenerateStyleResponse {
  success: boolean;
  image_base64?: string;
  styling_plan: StylingPlan;
  model_used?: string;
  skipped_products: string[];
  error?: string;
}

export interface RegenerateRequest {
  product_ids: string[];
  previous_plan: StylingPlan;
  feedback: string;
  model_quality: 'fast' | 'high';
}
