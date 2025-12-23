'use client';

import { useState } from 'react';
import { useNavigationStore, useFilterStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const sortByOptions = ['Trending', 'Volatile', 'New', 'Closing soon', 'Volume', 'Liquidity', '50-50'];
const timeRangeOptions = ['All', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Annually'];
const marketStatusOptions = ['All markets', 'Open markets', 'Closed markets'];

export default function Home() {
  const { selectedBottomNav } = useNavigationStore();
  const {
    selectedCategory,
    tagsByCategories,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    timeRange,
    setTimeRange,
    marketStatus,
    setMarketStatus,
    isFiltersOpen,
    setIsFiltersOpen,
  } = useFilterStore();

  const [sortByOpen, setSortByOpen] = useState(false);
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [marketStatusOpen, setMarketStatusOpen] = useState(false);

  const showFilters = selectedBottomNav === 'explore';

  // Check if any filter is modified from default
  const hasActiveFilters = sortBy !== 'Trending' || timeRange !== 'All' || marketStatus !== 'All markets';

  // Get tags for the selected category
  const getTagsForCategory = () => {
    // If it's one of the special categories, return all tags
    if (selectedCategory === 'trending' || selectedCategory === 'new' || selectedCategory === 'all') {
      const allTags: string[] = [];
      Object.values(tagsByCategories).forEach((tags) => {
        if (tags && Array.isArray(tags)) {
          allTags.push(...tags);
        }
      });
      return allTags;
    }
    
    // Otherwise return tags for the specific category
    const tags = tagsByCategories[selectedCategory];
    return tags && Array.isArray(tags) ? tags : [];
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const categoryTags = getTagsForCategory();

  return (
    <div className="px-6">
      <AnimatePresence mode="wait">
        {showFilters && categoryTags.length > 0 && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="mb-6 space-y-4"
          >
            {/* Tags Slider with Filter Button */}
            <div className="flex items-center gap-3">
              <div className="flex-1 overflow-x-auto scrollbar-hide rounded-sm">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex gap-2"
                >
                  {categoryTags.map((tag, index) => (
                    <motion.button
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.02,
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        selectedTags.includes(tag)
                          ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/30'
                          : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* Filter Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="relative shrink-0 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
                {hasActiveFilters && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"
                  />
                )}
              </motion.button>
            </div>

            {/* Sort Options - Animated Dropdown */}
            <AnimatePresence>
              {isFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 justify-center">
                    {/* Sort By Combobox */}
                    <Popover open={sortByOpen} onOpenChange={setSortByOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={sortByOpen}
                          className="w-1/3 justify-between bg-zinc-900 border-zinc-800 hover:border-yellow-400/30 text-white hover:bg-zinc-800 hover:text-white"
                        >
                          {sortBy}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0 ml-2 bg-zinc-900 border-zinc-800">
                        <Command className="bg-zinc-900">
                          <CommandInput placeholder="Search..." className="h-9 text-white" />
                          <CommandList>
                            <CommandEmpty className="text-white/60">No option found.</CommandEmpty>
                            <CommandGroup>
                              {sortByOptions.map((option) => (
                                <CommandItem
                                  key={option}
                                  value={option}
                                  onSelect={() => {
                                    setSortBy(option);
                                    setSortByOpen(false);
                                  }}
                                  className="text-white hover:bg-zinc-800"
                                >
                                  {option}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      sortBy === option ? "opacity-100 text-yellow-400" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Time Range Combobox */}
                    <Popover open={timeRangeOpen} onOpenChange={setTimeRangeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={timeRangeOpen}
                          className="w-1/3 justify-between bg-zinc-900 border-zinc-800 hover:border-yellow-400/30 text-white hover:bg-zinc-800 hover:text-white"
                        >
                          {timeRange}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0 bg-zinc-900 border-zinc-800">
                        <Command className="bg-zinc-900">
                          <CommandInput placeholder="Search..." className="h-9 text-white" />
                          <CommandList>
                            <CommandEmpty className="text-white/60">No option found.</CommandEmpty>
                            <CommandGroup>
                              {timeRangeOptions.map((option) => (
                                <CommandItem
                                  key={option}
                                  value={option}
                                  onSelect={() => {
                                    setTimeRange(option);
                                    setTimeRangeOpen(false);
                                  }}
                                  className="text-white hover:bg-zinc-800"
                                >
                                  {option}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      timeRange === option ? "opacity-100 text-yellow-400" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Market Status Combobox */}
                    <Popover open={marketStatusOpen} onOpenChange={setMarketStatusOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={marketStatusOpen}
                          className="w-1/3 justify-between bg-zinc-900 border-zinc-800 hover:border-yellow-400/30 text-white hover:bg-zinc-800 hover:text-white"
                        >
                          {marketStatus}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0 mr-2 bg-zinc-900 border-zinc-800">
                        <Command className="bg-zinc-900">
                          <CommandInput placeholder="Search..." className="h-9 text-white" />
                          <CommandList>
                            <CommandEmpty className="text-white/60">No option found.</CommandEmpty>
                            <CommandGroup>
                              {marketStatusOptions.map((option) => (
                                <CommandItem
                                  key={option}
                                  value={option}
                                  onSelect={() => {
                                    setMarketStatus(option);
                                    setMarketStatusOpen(false);
                                  }}
                                  className="text-white hover:bg-zinc-800"
                                >
                                  {option}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      marketStatus === option ? "opacity-100 text-yellow-400" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold text-yellow-400 mb-4">
        Welcome to x402PM
      </h1>
      <p className="text-white/70 mb-8">
        Your predictions market platform
      </p>
      
      {/* Temporary content to test scrolling */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="mb-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 className="text-yellow-400 font-semibold mb-2">Prediction Market {i + 1}</h3>
          <p className="text-white/60 text-sm">This is a sample prediction market card to test scrolling behavior.</p>
        </div>
      ))}
    </div>
  );
}
