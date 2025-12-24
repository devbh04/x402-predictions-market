'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event, Market, EventMetadata } from '@/lib/types';
import { KalshiAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, TrendingUp, ExternalLink, DollarSign } from 'lucide-react';
import MarketCard from '@/components/markets/market-card';
import MarketCharts from '@/components/markets/market-charts';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [metadata, setMetadata] = useState<EventMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        // First fetch the event to get the event_ticker
        const eventResponse = await KalshiAPI.getEvents({
          series_ticker: ticker,
          with_nested_markets: true,
          limit: 1
        });

        if (eventResponse.events && eventResponse.events.length > 0) {
          const fetchedEvent = eventResponse.events[0];
          setEvent(fetchedEvent);

          // Then fetch metadata using the event_ticker
          const metadataResponse = await KalshiAPI.getEventMetadata(fetchedEvent.event_ticker).catch(() => null);
          if (metadataResponse) {
            setMetadata(metadataResponse);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchEvent();
    }
  }, [ticker]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          <p className="text-white/60 text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Event not found'}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const markets = (event.markets || []).sort((a, b) => (b.volume || 0) - (a.volume || 0));
  const displayedMarkets = showAllMarkets ? markets : markets.slice(0, 3);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-yellow-400/20">
        <div className="px-6 py-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-3 border-b border-white/20">
              {metadata?.image_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className=""
                >
                  <img
                    src={metadata.image_url}
                    alt={event.title}
                    className="object-contain w-30 h-30 rounded-lg"
                  />
                </motion.div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {event.title}
              </h1>
            </div>
            {event.category && (
              <span className="text-sm text-yellow-400">
                {event.category}
              </span>
            )}

            {event.sub_title && (
              <p className="text-white/60 text-sm md:text-base">
                {event.sub_title}
              </p>
            )}

            <div className="flex items-center gap-3 text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                {markets.length} {markets.length === 1 ? 'Market' : 'Markets'}
              </span>
              <span className="flex items-center gap-0.5">
                <DollarSign className="w-4 h-4" />
                {markets.reduce((total, market) => total + (market.volume || 0), 0)}
              </span>
              <span>•</span>
              <span className="font-mono">{event.series_ticker}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Markets List */}
      <div className="px-6 py-6 space-y-6">
        {markets.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-white/60">No markets available for this event.</p>
          </div>
        ) : (
          <>
            {/* Market Charts for Top 3 Markets */}
            {markets.length > 0 && (
              <MarketCharts markets={markets} metadata={metadata} />
            )}

            {/* Metadata Details */}
            {metadata && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-4 space-y-1"
              >
                {metadata.competition && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">Competition:</span>
                    <span className="text-white text-sm font-semibold">{metadata.competition}</span>
                    {metadata.competition_scope && (
                      <span className="text-white/40 text-sm">({metadata.competition_scope})</span>
                    )}
                  </div>
                )}

                {metadata.settlement_sources && metadata.settlement_sources.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-white/50 text-sm">Settlement Sources:</span>
                    <div className="flex flex-wrap gap-2">
                      {metadata.settlement_sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 py-1 text-yellow-400 text-xs"
                        >
                          {source.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Beginner Helper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4"
            >
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
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              {displayedMarkets.map((market, index) => (
                <MarketCard key={market.ticker} market={market} index={index} metadata={metadata} />
              ))}
            </div>

            {/* Show All/Show Less Button */}
            {markets.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center pt-2"
              >
                <Button
                  onClick={() => setShowAllMarkets(!showAllMarkets)}
                  className="text-white"
                >
                  {showAllMarkets ? `Show Less` : `Show All ${markets.length} Markets`}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
