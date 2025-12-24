'use client';

import { useState, useEffect } from 'react';
import { useNavigationStore, useFilterStore, useMetadataStore } from '@/lib/store';
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
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { setMetadata, getMetadata, setLoading: setMetadataLoading, isLoading: isMetadataLoading } = useMetadataStore();

  const showFilters = selectedBottomNav === 'explore';

  // Batch fetch metadata for events - lazy loading
  const fetchMetadataBatch = async (eventTickers: string[]) => {
    // Only fetch first 10 to start, rest will load on-demand
    const initialTickers = eventTickers.slice(0, 10);
    
    for (const eventTicker of initialTickers) {
      // Skip if already loaded or loading
      if (getMetadata(eventTicker) || isMetadataLoading(eventTicker)) continue;
      
      setMetadataLoading(eventTicker, true);
      try {
        const metadata = await KalshiAPI.getEventMetadata(eventTicker);
        if (metadata) {
          setMetadata(eventTicker, metadata);
        }
      } catch (error) {
        // Silently fail - metadata is optional
        console.debug(`Metadata not available for ${eventTicker}`);
      } finally {
        setMetadataLoading(eventTicker, false);
      }
      
      // Longer delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Sort events based on selected sort option
  const sortEvents = (eventsToSort: Event[]) => {
    const sorted = [...eventsToSort];
    
    switch (sortBy) {
      case 'Volume':
        return sorted.sort((a, b) => {
          const aVolume = a.markets?.reduce((sum, m) => sum + (m.volume || 0), 0) || 0;
          const bVolume = b.markets?.reduce((sum, m) => sum + (m.volume || 0), 0) || 0;
          return bVolume - aVolume;
        });
      case 'Liquidity':
        return sorted.sort((a, b) => {
          const aLiquidity = a.markets?.reduce((sum, m) => sum + (m.open_interest || 0), 0) || 0;
          const bLiquidity = b.markets?.reduce((sum, m) => sum + (m.open_interest || 0), 0) || 0;
          return bLiquidity - aLiquidity;
        });
      case 'Closing soon':
        return sorted.sort((a, b) => {
          const aClose = Math.min(...(a.markets?.map(m => new Date(m.close_time).getTime()) || [Infinity]));
          const bClose = Math.min(...(b.markets?.map(m => new Date(m.close_time).getTime()) || [Infinity]));
          return aClose - bClose;
        });
      case 'New':
        return sorted.sort((a, b) => {
          const aOpen = Math.min(...(a.markets?.map(m => new Date(m.open_time || 0).getTime()) || [0]));
          const bOpen = Math.min(...(b.markets?.map(m => new Date(m.open_time || 0).getTime()) || [0]));
          return bOpen - aOpen;
        });
      case '50-50':
        return sorted.sort((a, b) => {
          const aClosest = Math.min(...(a.markets?.map(m => Math.abs((m.last_price || m.yes_bid || 50) - 50)) || [Infinity]));
          const bClosest = Math.min(...(b.markets?.map(m => Math.abs((m.last_price || m.yes_bid || 50) - 50)) || [Infinity]));
          return aClosest - bClosest;
        });
      case 'Volatile':
      case 'Trending':
      default:
        return sorted;
    }
  };

  // Fetch event data whenever category or tags change
  useEffect(() => {
    if (selectedBottomNav !== 'explore') return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      setCursor(undefined);
      setHasMore(true);
      
      try {
        const response = await KalshiAPI.fetchEventData(
          selectedCategory,
          selectedTags,
          sortBy
        );
        const sortedEvents = sortEvents(response.events);
        setEvents(sortedEvents);
        setCursor(response.cursor);
        setHasMore(!!response.cursor);
        
        // Fetch metadata for visible events in background (non-blocking)
        const eventTickers = sortedEvents.map(e => e.event_ticker);
        fetchMetadataBatch(eventTickers).catch(err => 
          console.debug('Metadata fetch failed:', err)
        );
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedTags, selectedBottomNav]);

  // Re-sort when sortBy changes
  useEffect(() => {
    if (events.length > 0) {
      setEvents(sortEvents(events));
    }
  }, [sortBy]);

  // Load more events
  const loadMoreEvents = async () => {
    if (!hasMore || loadingMore || loading) return;

    setLoadingMore(true);
    try {
      const response = await KalshiAPI.getEvents({
        limit: 100,
        status: 'open',
        with_nested_markets: true,
        cursor: cursor,
      });
      
      const sortedNewEvents = sortEvents(response.events);
      // Filter out duplicates based on event_ticker
      setEvents(prev => {
        const existingTickers = new Set(prev.map(e => e.event_ticker));
        const uniqueNewEvents = sortedNewEvents.filter(e => !existingTickers.has(e.event_ticker));
        return [...prev, ...uniqueNewEvents];
      });
      setCursor(response.cursor);
      setHasMore(!!response.cursor);
      
      // Fetch metadata for new events
      const eventTickers = sortedNewEvents.map(e => e.event_ticker);
      fetchMetadataBatch(eventTickers);
    } catch (err) {
      console.error('Error loading more events:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    if (selectedBottomNav !== 'explore') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 500 && !loadingMore && hasMore) {
        loadMoreEvents();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedBottomNav, loadingMore, hasMore, cursor]);

  // Check if any filter is modified from default
  const hasActiveFilters = sortBy !== 'Volume' || timeRange !== 'All' || marketStatus !== 'All markets';

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
                  <div className="flex gap-2 justify-center px-2">
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
            <>
              <div className="grid grid-cols-1 gap-4">
                {events.map((event, index) => (
                  <EventCard 
                    key={event.event_ticker} 
                    event={event} 
                    index={index}
                  />
                ))}
              </div>
              
              {loadingMore && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-yellow-400 animate-spin mb-2" />
                  <p className="text-white/60 text-xs">Loading more events...</p>
                </div>
              )}
              
              {!hasMore && events.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">No more events to load</p>
                </div>
              )}
            </>
          )}
        </div>
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
