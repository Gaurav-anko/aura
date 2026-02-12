/**
 * React Query hooks for styling options
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { stylingApi } from '../api';
import type { GenerateStyleRequest, RegenerateRequest } from '../types';

export const useMoods = () => {
  return useQuery({
    queryKey: ['moods'],
    queryFn: stylingApi.getMoods,
  });
};

export const useStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: stylingApi.getStyles,
  });
};

export const useColorThemes = () => {
  return useQuery({
    queryKey: ['colorThemes'],
    queryFn: stylingApi.getColorThemes,
  });
};

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: stylingApi.getRooms,
  });
};

export const useGenerateStyle = () => {
  return useMutation({
    mutationFn: (request: GenerateStyleRequest) => stylingApi.generateStyle(request),
  });
};

export const useRegenerate = () => {
  return useMutation({
    mutationFn: (request: RegenerateRequest) => stylingApi.regenerate(request),
  });
};
