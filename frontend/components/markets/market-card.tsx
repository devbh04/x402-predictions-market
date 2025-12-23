'use client';

import { Market } from '@/lib/types';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, ReceiptIcon } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  index: number;
}

export default function MarketCard({ market, index }: MarketCardProps) {
  // Calculate price percentage
  const yesPrice = market.last_price || market.yes_bid || 50;
  const noPrice = 100 - yesPrice;
  
  // Format close time
  const closeDate = new Date(market.close_time);
  const now = new Date();
  const daysUntilClose = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Format date for display
  const formatCloseDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: closeDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    };
    return closeDate.toLocaleDateString('en-US', options);
  };
  
  // Format volume
  const formatVolume = (volume?: number) => {
    if (!volume) return '$0';
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume}`;
  };

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
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative bg-zinc-900 rounded-xl border border-zinc-800 hover:border-yellow-400/30 p-5 transition-all cursor-pointer overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-300" />
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-white font-semibold text-base leading-tight line-clamp-2 flex-1">
              {market.title}
            </h3>
            {market.category && (
              <span className="shrink-0 px-2 py-1 text-xs bg-yellow-400/10 text-yellow-400 rounded-md border border-yellow-400/20">
                {market.category}
              </span>
            )}
          </div>
          
          {market.subtitle && (
            <p className="text-white/50 text-sm line-clamp-1">
              {market.subtitle}
            </p>
          )}
        </div>

        {/* Price Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative bg-linear-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4 space-y-2 hover:border-green-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="text-green-400 text-xs font-semibold uppercase tracking-wide">YES</div>
              {market.yes_bid !== undefined && market.yes_ask !== undefined && (
                <div className="text-green-400/60 text-[10px]">
                  Bid/Ask
                </div>
              )}
            </div>
            <div className="text-white text-3xl font-bold">{yesPrice}%</div>
            <div className="text-white/40 text-xs">{yesPrice}¢ per share</div>
            {market.yes_sub_title && (
              <div className="pt-2 border-t border-green-500/20">
                <p className="text-green-400/90 text-xs leading-relaxed line-clamp-2">{market.yes_sub_title}</p>
              </div>
            )}
            {market.yes_bid !== undefined && market.yes_ask !== undefined && (
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <span className="px-1.5 py-0.5 bg-green-500/10 rounded text-green-400">{market.yes_bid}¢</span>
                <span className="text-white/50">/</span>
                <span className="px-1.5 py-0.5 bg-green-500/10 rounded text-green-400">{market.yes_ask}¢</span>
              </div>
            )}
          </div>
          
          <div className="relative bg-linear-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4 space-y-2 hover:border-red-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="text-red-400 text-xs font-semibold uppercase tracking-wide">NO</div>
              {market.no_bid !== undefined && market.no_ask !== undefined && (
                <div className="text-red-400/60 text-[10px]">
                    Bid/Ask
                </div>
              )}
            </div>
            <div className="text-white text-3xl font-bold">{noPrice}%</div>
            <div className="text-white/40 text-xs">{noPrice}¢ per share</div>
            {market.no_sub_title && (
              <div className="pt-2 border-t border-red-500/20">
                <p className="text-red-400/90 text-xs leading-relaxed line-clamp-2">{market.no_sub_title}</p>
              </div>
            )}
            {market.no_bid !== undefined && market.no_ask !== undefined && (
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <span className="px-1.5 py-0.5 bg-red-500/10 rounded text-red-400">{market.no_bid}¢</span>
                <span className="text-white/50">/</span>
                <span className="px-1.5 py-0.5 bg-red-500/10 rounded text-red-400">{market.no_ask}¢</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
          <div className="flex flex-col items-center justify-center gap-1 py-2 px-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span className="text-white/50 text-[10px] uppercase">Volume</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatVolume(market.volume || market.volume)}
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-1 py-2 px-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-1">
              <ReceiptIcon className="w-4 h-4 text-blue-400" />
              <span className="text-white/50 text-[10px] text-center leading-tight uppercase">Open-Interest</span>
            </div>
            <span className="text-white text-xs font-semibold text-center leading-tight">
              {market.open_interest > 0 ? (
                market.open_interest
              ) : '0'}
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-1 py-2 px-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-white/50 text-[10px] uppercase">Interest</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatVolume(market.open_interest)}
            </span>
          </div>
        </div>
        
        {/* Custom Strike Details */}
        {market.custom_strike && Object.keys(market.custom_strike).length > 0 && (
          <div className="pt-2 border-t border-zinc-800">
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">Strike Conditions</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(market.custom_strike).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-white/60 font-medium capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-white/90 font-semibold text-right">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Close Date Detail */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-1">
          <div className="text-white/50 text-xs">
            Market closes: <span className="text-white/70 font-medium">{formatCloseDate()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
