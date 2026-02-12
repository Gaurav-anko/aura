/**
 * API client for Smart Product Styler backend
 */

import axios from 'axios';
import type {
  FilterResponse,
  CategoriesResponse,
  ColorsResponse,
  PriceRangeResponse,
  MoodsResponse,
  StylesResponse,
  ColorThemesResponse,
  RoomsResponse,
  GenerateStyleRequest,
  GenerateStyleResponse,
  RegenerateRequest,
} from '../types';

// API base URL - uses Vite proxy in development
const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Product API
 */
export const productApi = {
  /**
   * Get filtered products
   */
  getProducts: async (params?: {
    category?: string;
    color?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<FilterResponse> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Get available categories
   */
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  /**
   * Get available colors
   */
  getColors: async (): Promise<ColorsResponse> => {
    const response = await apiClient.get('/colors');
    return response.data;
  },

  /**
   * Get price range
   */
  getPriceRange: async (): Promise<PriceRangeResponse> => {
    const response = await apiClient.get('/price-range');
    return response.data;
  },
};

/**
 * Styling API
 */
export const stylingApi = {
  /**
   * Get mood options
   */
  getMoods: async (): Promise<MoodsResponse> => {
    const response = await apiClient.get('/styling/moods');
    return response.data;
  },

  /**
   * Get style options
   */
  getStyles: async (): Promise<StylesResponse> => {
    const response = await apiClient.get('/styling/styles');
    return response.data;
  },

  /**
   * Get color theme options
   */
  getColorThemes: async (): Promise<ColorThemesResponse> => {
    const response = await apiClient.get('/styling/color-themes');
    return response.data;
  },

  /**
   * Get room options
   */
  getRooms: async (): Promise<RoomsResponse> => {
    const response = await apiClient.get('/styling/rooms');
    return response.data;
  },

  /**
   * Generate styled image
   */
  generateStyle: async (request: GenerateStyleRequest): Promise<GenerateStyleResponse> => {
    const response = await apiClient.post('/generate-style', request);
    return response.data;
  },

  /**
   * Regenerate image with feedback
   */
  regenerate: async (request: RegenerateRequest): Promise<GenerateStyleResponse> => {
    const response = await apiClient.post('/regenerate', request);
    return response.data;
  },
};

export default apiClient;
