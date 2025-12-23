import { create } from 'zustand';

interface NavigationStore {
  selectedBottomNav: string;
  setSelectedBottomNav: (id: string) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  selectedBottomNav: 'explore',
  setSelectedBottomNav: (id) => set({ selectedBottomNav: id }),
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
  
  sortBy: 'Trending',
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