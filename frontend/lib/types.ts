// Kalshi API Types

export interface Market {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  created_time: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  status: string;
  yes_bid?: number;
  yes_ask?: number;
  no_bid?: number;
  no_ask?: number;
  last_price?: number;
  volume?: number;
  volume_24h?: number;
  open_interest?: any;
  category: string;
  liquidity?: number;
  strike_type?: string;
  floor_strike?: number;
  cap_strike?: number;
  custom_strike?: any;
}

export interface Series {
  ticker: string;
  frequency: string;
  title: string;
  category: string;
  tags: string[];
  settlement_sources?: Array<{
    name: string;
    url: string;
  }>;
}

export interface Event {
  event_ticker: string;
  series_ticker: string;
  sub_title: string;
  title: string;
  category: string;
  markets?: Market[];
}

export interface MarketsResponse {
  markets: Market[];
  cursor?: string;
}

export interface SeriesResponse {
  series: Series[];
}

export interface EventsResponse {
  events: Event[];
  cursor?: string;
}
