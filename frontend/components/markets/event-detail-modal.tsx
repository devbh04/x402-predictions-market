'use client';

import { Event, Market } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Clock, Users } from 'lucide-react';
import MarketCard from './market-card';

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const markets = event.markets || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-yellow-400/30 shadow-2xl shadow-yellow-400/10 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 rounded-t-2xl">
            <div className="flex items-start justify-between gap-4 p-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {event.title}
                  </h2>
                  {event.category && (
                    <span className="px-3 py-1 text-sm bg-yellow-400/10 text-yellow-400 rounded-lg border border-yellow-400/20">
                      {event.category}
                    </span>
                  )}
                </div>
                {event.sub_title && (
                  <p className="text-white/60 text-sm">
                    {event.sub_title}
                  </p>
                )}
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <span>{markets.length} {markets.length === 1 ? 'Market' : 'Markets'}</span>
                  <span>•</span>
                  <span>{event.series_ticker}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-400/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Markets List */}
          <div className="p-6 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {markets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No markets available for this event.</p>
              </div>
            ) : (
              <>
                {/* Beginner Helper */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                      <span className="text-yellow-400 text-sm font-bold">?</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-yellow-400 text-sm font-semibold">How Prediction Markets Work</h4>
                      <p className="text-white/60 text-xs leading-relaxed">
                        Trade shares priced 0-100¢. <span className="text-green-400 font-medium">YES shares</span> pay $1 if the outcome happens, 
                        <span className="text-red-400 font-medium"> NO shares</span> pay $1 if it doesn't. The price reflects the market's probability.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {markets.map((market, index) => (
                    <MarketCard key={market.ticker} market={market} index={index} />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
