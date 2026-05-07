import { NextResponse } from "next/server";

const TOKEN_CA = "9bSZhZFAeREPhpAto5P6H4WXUNutWJTQkvporCPXpump";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_API = `https://api.helius.xyz/v0`;

// Known pool/AMM addresses to exclude (not real buyers)
const EXCLUDED_WALLETS = new Set([
  TOKEN_CA,
  "11111111111111111111111111111111",
]);

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
}

interface HeliusTx {
  signature: string;
  timestamp: number;
  feePayer: string;
  type: string;
  tokenTransfers?: TokenTransfer[];
}

export async function GET() {
  if (!HELIUS_API_KEY) {
    return NextResponse.json({
      error: "HELIUS_API_KEY not set. Add it in Vercel Environment Variables.",
      infections: [],
      total: 0,
    });
  }

  try {
    const url = `${HELIUS_API}/addresses/${TOKEN_CA}/transactions?api-key=${HELIUS_API_KEY}&limit=50`;
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({
        error: `Helius returned ${response.status}: ${errText.slice(0, 200)}`,
        infections: [],
        total: 0,
      });
    }

    const transactions: HeliusTx[] = await response.json();

    const infections = transactions
      .filter((tx) => tx.type === "SWAP" || tx.type === "TRANSFER")
      .map((tx) => {
        // feePayer = the wallet that initiated the swap (the actual buyer/seller)
        const wallet = tx.feePayer;
        let amount = 0;

        // Find token amount for our specific mint
        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          const tokenTx = tx.tokenTransfers.find((t) => t.mint === TOKEN_CA);
          if (tokenTx) {
            amount = tokenTx.tokenAmount || 0;
          }
        }

        return {
          pubkey: wallet,
          amount: Math.round(amount),
          timestamp: tx.timestamp * 1000,
          signature: tx.signature,
        };
      })
      .filter((inf) => inf.pubkey && !EXCLUDED_WALLETS.has(inf.pubkey));

    // Deduplicate by wallet (keep most recent)
    const seen = new Set<string>();
    const unique = infections.filter((inf) => {
      if (seen.has(inf.pubkey)) return false;
      seen.add(inf.pubkey);
      return true;
    });

    return NextResponse.json({
      infections: unique,
      total: unique.length,
      token: TOKEN_CA,
      fetchedAt: Date.now(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: `Server error: ${msg}`,
      infections: [],
      total: 0,
    });
  }
}
