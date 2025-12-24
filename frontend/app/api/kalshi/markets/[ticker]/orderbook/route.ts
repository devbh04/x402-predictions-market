import { NextRequest, NextResponse } from 'next/server';

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const searchParams = request.nextUrl.searchParams;
    const depth = searchParams.get('depth');

    const queryParams = new URLSearchParams();
    if (depth) {
      queryParams.append('depth', depth);
    }

    const url = `${KALSHI_API_BASE}/markets/${ticker}/orderbook${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kalshi API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch orderbook from Kalshi API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in orderbook route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
