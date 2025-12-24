import { NextRequest, NextResponse } from 'next/server';

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const marketTickers = searchParams.get('market_tickers');
    const startTs = searchParams.get('start_ts');
    const endTs = searchParams.get('end_ts');
    const periodInterval = searchParams.get('period_interval');
    const includeLatestBeforeStart = searchParams.get('include_latest_before_start');

    if (!marketTickers || !startTs || !endTs || !periodInterval) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append('market_tickers', marketTickers);
    params.append('start_ts', startTs);
    params.append('end_ts', endTs);
    params.append('period_interval', periodInterval);
    if (includeLatestBeforeStart) {
      params.append('include_latest_before_start', includeLatestBeforeStart);
    }

    const response = await fetch(
      `${KALSHI_API_BASE}/markets/candlesticks?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kalshi API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch candlesticks from Kalshi API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in candlesticks route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
