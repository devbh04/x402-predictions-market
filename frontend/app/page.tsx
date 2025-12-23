'use client';

import { useState, useEffect } from 'react';
import { useNavigationStore, useFilterStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, SlidersHorizontal, Loader2 } from 'lucide-react';
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
import { KalshiAPI } from '@/lib/api';
import { Event } from '@/lib/types';
import EventCard from '@/components/markets/event-card';
import EventDetailModal from '@/components/markets/event-detail-modal';

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
  
  // Event data state
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const showFilters = selectedBottomNav === 'explore';

  // Fetch event data whenever category or tags change
  useEffect(() => {
    if (selectedBottomNav !== 'explore') return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await KalshiAPI.fetchEventData(
          selectedCategory,
          selectedTags,
          sortBy
        );
        setEvents(response.events);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedTags, sortBy, selectedBottomNav]);

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

      {/* Events Section */}
      {selectedBottomNav === 'explore' && (
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-3" />
              <p className="text-white/60 text-sm">Loading events...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <p className="text-white/60">No events found for the selected filters.</p>
              <p className="text-white/40 text-sm mt-2">Try adjusting your category or tags.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {events.map((event, index) => (
                <EventCard 
                  key={event.event_ticker} 
                  event={event} 
                  index={index}
                  onEventClick={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

      {/* Other content for non-explore sections */}
      {selectedBottomNav !== 'explore' && (
        <>
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">
            Welcome to x402PM
          </h1>
          <p className="text-white/70 mb-8">
            Your predictions market platform
          </p>
        </>
      )}
    </div>
  );
}
