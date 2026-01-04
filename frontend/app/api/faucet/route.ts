import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    console.log('[Faucet] Funding address:', address);

    // Movement faucet expects query params
    const faucetUrl = `https://faucet.testnet.movementnetwork.xyz/?address=${address}`;

    const faucetResponse = await fetch(faucetUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
      },
    });

    const text = await faucetResponse.text();

    if (!faucetResponse.ok) {
      console.error('[Faucet] Failed:', text);
      return NextResponse.json(
        {
          error: 'Faucet request failed',
          details: text,
        },
        { status: faucetResponse.status }
      );
    }

    console.log('[Faucet] Success:', text);

    return NextResponse.json({
      success: true,
      message: 'Faucet request submitted',
      raw: text,
    });

  } catch (err) {
    console.error('[Faucet] Error:', err);
    return NextResponse.json(
      {
        error: 'Internal faucet proxy error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
