'use client';

import { Event, Market } from '@/lib/types';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMetadataStore } from '@/lib/store';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
  index: number;
}

export default function EventCard({ event, index }: EventCardProps) {
  const router = useRouter();
  const { getMetadata } = useMetadataStore();
  const metadata = getMetadata(event.event_ticker);
  const markets = event.markets || [];
  const marketCount = markets.length;

  // Calculate average price and total volume from all markets
  const stats = markets.reduce((acc, market) => {
    const price = market.last_price || market.yes_bid || 0;
    acc.totalVolume += market.volume || market.volume || 0;
    acc.totalOpenInterest += market.open_interest || 0;
    acc.prices.push(price);
    return acc;
  }, { totalVolume: 0, totalOpenInterest: 0, prices: [] as number[] });

  const avgPrice = stats.prices.length > 0
    ? Math.round(stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length)
    : 50;

  // Get the earliest close time
  const closeTimes = markets.map(m => new Date(m.close_time).getTime()).filter(t => !isNaN(t));
  const earliestCloseTime = closeTimes.length > 0 ? Math.min(...closeTimes) : null;

  const daysUntilClose = earliestCloseTime
    ? Math.ceil((earliestCloseTime - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Format close time more friendly
  const formatCloseTime = () => {
    if (!earliestCloseTime) return null;
    const closeDate = new Date(earliestCloseTime);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return closeDate.toLocaleDateString('en-US', options);
  };

  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume}`;
  };

  // Get top 3 markets preview
  const topMarkets = markets.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      onClick={() => router.push(`/events/${event.series_ticker}`)}
      className="group relative bg-zinc-900 rounded-xl border border-zinc-800 hover:border-yellow-400/30 p-5 transition-all cursor-pointer overflow-hidden shadow-xs shadow-white/20"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-300" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {metadata?.image_url && (
                <img
                  src={metadata.image_url}
                  alt={event.title}
                  className="object-contain w-14 h-14 rounded-lg"
                />
            )}
            <h3 className="text-white font-semibold text-lg items-center leading-tight flex-1">
              {event.title}
            </h3>
          </div>
          {event.category && (
            <span className="py-1 text-xs text-yellow-400">
              {event.category}
            </span>
          )}

          {event.sub_title && (
            <p className="text-white/50 text-sm line-clamp-2">
              {event.sub_title}
            </p>
          )}
        </div>

        {/* Markets Count & Stats Bar */}
        <div className="gap-2">
          {stats.totalVolume > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-white/50 text-sm">Volume:</span>
              <span className="text-white text-sm font-bold">{formatVolume(stats.totalVolume)}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-white/60 text-sm">Closes: </span>
            </div>
            {earliestCloseTime ? (
              <span className="text-white text-sm font-bold text-center leading-tight px-1">
                {new Date(earliestCloseTime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: new Date(earliestCloseTime).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </span>
            ) : (
              <span className="text-white/50 text-sm">TBD</span>
            )}
          </div>
        </div>

        {/* Quick Preview of Markets */}
        {topMarkets.length > 0 && (
          <div className="space-y-2">
            <div className="text-white/50 text-xs font-medium uppercase tracking-wide px-1">
              Top Markets
            </div>
            {topMarkets.map((market, idx) => {
              const yesPrice = market.last_price || market.yes_bid || 50;
              const yesPercent = yesPrice;
              const noPercent = 100 - yesPrice;
              
              // Get market image from metadata
              const marketDetail = metadata?.market_details?.find(
                detail => detail.market_ticker === market.ticker
              );
              
              return (
                <div key={market.ticker} className="group/market relative">
                  <div className="flex items-center justify-between gap-3 py-2.5 px-3 bg-zinc-800/40 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-all">
                    {marketDetail?.image_url && (
                      <img
                        src={marketDetail.image_url}
                        alt={market.title}
                        className="w-8 h-8 object-contain shrink-0"
                      />
                    )}
                    <span className="text-white/80 text-sm line-clamp-1 flex-1 font-medium">
                      {market.title || market.subtitle}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex flex-col items-center">
                        <div className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                          <span className="text-green-400 text-sm font-bold">{yesPercent}%</span>
                        </div>
                        <span className="text-white/40 text-[10px] mt-0.5">YES</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                          <span className="text-red-400 text-sm font-bold">{noPercent}%</span>
                        </div>
                        <span className="text-white/40 text-[10px] mt-0.5">NO</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {marketCount > 3 && (
              <div className="text-center py-1.5 px-3 rounded-lg">
                <span className="text-yellow-400 text-xs font-semibold">
                  +{marketCount - 3} more {marketCount - 3 === 1 ? 'market' : 'markets'} • Click to view all
                </span>
              </div>
            )}
          </div>
        )}

        {/* View Details Button */}
        <div className="flex items-center justify-end pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium group-hover:gap-2 transition-all">
            <span>View Markets</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
