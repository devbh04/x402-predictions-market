import { create } from 'zustand';
import { EventMetadata } from './types';

interface NavigationStore {
  selectedBottomNav: string;
  setSelectedBottomNav: (id: string) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  selectedBottomNav: 'explore',
  setSelectedBottomNav: (id) => set({ selectedBottomNav: id }),
}));

interface MetadataStore {
  metadata: Record<string, EventMetadata>;
  loading: Record<string, boolean>;
  setMetadata: (eventTicker: string, data: EventMetadata) => void;
  getMetadata: (eventTicker: string) => EventMetadata | undefined;
  setLoading: (eventTicker: string, isLoading: boolean) => void;
  isLoading: (eventTicker: string) => boolean;
}

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  metadata: {},
  loading: {},
  setMetadata: (eventTicker, data) => set((state) => ({
    metadata: { ...state.metadata, [eventTicker]: data }
  })),
  getMetadata: (eventTicker) => get().metadata[eventTicker],
  setLoading: (eventTicker, isLoading) => set((state) => ({
    loading: { ...state.loading, [eventTicker]: isLoading }
  })),
  isLoading: (eventTicker) => get().loading[eventTicker] || false,
}));

interface CategoryTag {
  [category: string]: string[] | null;
}

interface FilterStore {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  tagsByCategories: CategoryTag;
  setTagsByCategories: (tags: CategoryTag) => void;
  
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  
  sortBy: string;
  setSortBy: (sort: string) => void;
  
  timeRange: string;
  setTimeRange: (range: string) => void;
  
  marketStatus: string;
  setMarketStatus: (status: string) => void;
  
  isTagsOpen: boolean;
  setIsTagsOpen: (open: boolean) => void;
  
  isFiltersOpen: boolean;
  setIsFiltersOpen: (open: boolean) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedCategory: 'trending',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  tagsByCategories: {},
  setTagsByCategories: (tags) => set({ tagsByCategories: tags }),
  
  selectedTags: [],
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  
  sortBy: 'Volume',
  setSortBy: (sort) => set({ sortBy: sort }),
  
  timeRange: 'All',
  setTimeRange: (range) => set({ timeRange: range }),
  
  marketStatus: 'All markets',
  setMarketStatus: (status) => set({ marketStatus: status }),
  
  isFiltersOpen: false,
  setIsFiltersOpen: (open) => set({ isFiltersOpen: open }),
  
  isTagsOpen: false,
  setIsTagsOpen: (open) => set({ isTagsOpen: open }),
}));

interface ChartStore {
  chartInterval: number;
  setChartInterval: (interval: number) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  chartInterval: 10080,
  setChartInterval: (interval) => set({ chartInterval: interval }),
}));