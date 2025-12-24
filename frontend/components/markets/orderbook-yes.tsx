'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';

interface OrderbookYesProps {
    yesOrders: number[][]; // YES bids
    noOrders: number[][]; // NO bids (used to derive YES asks)
    lastPrice?: number;
}

interface OrderLevel {
    price: number;
    contracts: number;
    total: number;
}

export default function OrderbookYes({ yesOrders, noOrders, lastPrice = 50 }: OrderbookYesProps) {
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
    const asksScrollRef = useRef<HTMLDivElement>(null);

    // Process orderbook data
    const { asks, bids, maxContracts } = useMemo(() => {
        if (!yesOrders && !noOrders) {
            return { asks: [], bids: [], maxContracts: 0 };
        }

        // YES bids come directly from yesOrders
        const yesBids: OrderLevel[] = (yesOrders || []).map(([price, contracts]) => ({
            price,
            contracts,
            total: (price * contracts) / 100,
        }));

        // YES asks are derived from NO bids: 100 - NO bid price
        const yesAsks: OrderLevel[] = (noOrders || []).map(([price, contracts]) => ({
            price: 100 - price,
            contracts,
            total: ((100 - price) * contracts) / 100,
        }));

        // Sort asks descending (highest ask at top, lowest at bottom near mid-price)
        const asks = yesAsks.sort((a, b) => b.price - a.price);

        // Sort bids descending (highest bid first)
        const bids = yesBids.sort((a, b) => b.price - a.price);

        const allOrders = [...asks, ...bids];
        const maxContracts = allOrders.length > 0 ? Math.max(...allOrders.map(o => o.contracts)) : 0;

        return { asks, bids, maxContracts };
    }, [yesOrders, noOrders]);

    // Scroll asks to bottom on load
    useEffect(() => {
        if (asksScrollRef.current && asks.length > 0) {
            asksScrollRef.current.scrollTop = asksScrollRef.current.scrollHeight;
        }
    }, [asks]);

    const formatTotal = (value: number) => {
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toFixed(0)}`;
    };

    const OrderRow = ({ 
        order, 
        type, 
        maxContracts 
    }: { 
        order: OrderLevel; 
        type: 'ask' | 'bid'; 
        maxContracts: number;
    }) => {
        const depthPercent = (order.contracts / maxContracts) * 100;
        const isAsk = type === 'ask';

        return (
            <motion.div
                onClick={() => setSelectedPrice(order.price)}
                whileHover={{ backgroundColor: isAsk ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)' }}
                className="relative cursor-pointer overflow-hidden"
            >
                {/* Depth bar */}
                <div
                    className={`absolute inset-y-0 right-0 ${
                        isAsk ? 'bg-red-500/10' : 'bg-green-500/10'
                    }`}
                    style={{ width: `${depthPercent}%` }}
                />
                
                {/* Content */}
                <div className="relative grid grid-cols-3 gap-3 px-3 py-2 text-xs">
                    <div className={`text-right font-semibold tabular-nums ${
                        isAsk ? 'text-red-400' : 'text-green-400'
                    }`}>
                        {order.price}¢
                    </div>
                    <div className="text-right text-white/70 tabular-nums">
                        {order.contracts.toLocaleString()}
                    </div>
                    <div className="text-right text-white/50 tabular-nums">
                        {formatTotal(order.total)}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-2">
            {/* Asks Section */}
            {asks.length > 0 && (
                <div>
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-red-500/20">
                        <span className="text-red-400 text-xs font-semibold uppercase">Asks</span>
                        <div className="grid grid-cols-3 gap-3 flex-1 text-right">
                            <span className="text-red-400/50 text-[10px] uppercase">Price</span>
                            <span className="text-red-400/50 text-[10px] uppercase">Contracts</span>
                            <span className="text-red-400/50 text-[10px] uppercase">Total</span>
                        </div>
                    </div>
                    <div ref={asksScrollRef} className="bg-red-500/5 max-h-[200px] overflow-auto">
                        {asks.map((order, idx) => (
                            <OrderRow 
                                key={`ask-${order.price}-${idx}`} 
                                order={order} 
                                type="ask" 
                                maxContracts={maxContracts}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Mid-Price Divider */}
            <div className="relative py-3">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-zinc-700" />
                <div className="relative flex items-center justify-center gap-2 bg-zinc-900 px-3 mx-auto w-fit">
                    <span className="text-blue-400 font-semibold text-sm">Trade Yes</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/40 text-xs">Last {lastPrice}¢</span>
                </div>
            </div>

            {/* Bids Section */}
            {bids.length > 0 && (
                <div>
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-green-500/20">
                        <span className="text-green-400 text-xs font-semibold uppercase">Bids</span>
                        <div className="grid grid-cols-3 gap-3 flex-1 text-right">
                            <span className="text-green-400/50 text-[10px] uppercase">Price</span>
                            <span className="text-green-400/50 text-[10px] uppercase">Contracts</span>
                            <span className="text-green-400/50 text-[10px] uppercase">Total</span>
                        </div>
                    </div>
                    <div className="bg-green-500/5 max-h-[200px] overflow-auto">
                        {bids.map((order, idx) => (
                            <OrderRow 
                                key={`bid-${order.price}-${idx}`} 
                                order={order} 
                                type="bid" 
                                maxContracts={maxContracts}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {asks.length === 0 && bids.length === 0 && (
                <div className="text-center py-12 text-white/40 text-sm">
                    No orders in book
                </div>
            )}
        </div>
    );
}
