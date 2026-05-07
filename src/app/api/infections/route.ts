import { NextResponse } from "next/server";

const TOKEN_CA = "9bSZhZFAeREPhpAto5P6H4WXUNutWJTQkvporCPXpump";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_API = `https://api.helius.xyz/v0`;

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
  description?: string;
  tokenTransfers?: TokenTransfer[];
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
}

export async function GET() {
  if (!HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Helius API key not configured", infections: [], total: 0 },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(
      `${HELIUS_API}/addresses/${TOKEN_CA}/transactions?api-key=${HELIUS_API_KEY}&limit=50`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Helius API error:", response.status, errText);
      return NextResponse.json(
        { error: "Helius API error", infections: [], total: 0 },
        { status: 200 }
      );
    }

    const transactions: HeliusTx[] = await response.json();

    // Parse: every SWAP tx on this token address = someone interacted with the token
    // The feePayer is the wallet that initiated the swap (buyer/seller)
    const infections = transactions
      .filter((tx) => tx.type === "SWAP" || tx.type === "TRANSFER")
      .map((tx) => {
        let wallet = tx.feePayer;
        let amount = 0;

        // Try to find the actual token transfer amount for our mint
        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          const tokenTx = tx.tokenTransfers.find(
            (t) => t.mint === TOKEN_CA
          );
          if (tokenTx) {
            // The receiver of the token is the "infected" wallet
            wallet = tokenTx.toUserAccount || tx.feePayer;
            amount = tokenTx.tokenAmount || 0;
          }
        }

        // If no specific token transfer found, still use feePayer
        // because they interacted with this token's address
        return {
          pubkey: wallet,
          amount: Math.round(amount * 1e6), // normalize to raw units
          timestamp: tx.timestamp * 1000,
          signature: tx.signature,
        };
      })
      .filter((inf) => inf.pubkey && inf.pubkey !== TOKEN_CA);

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
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error", infections: [], total: 0 },
      { status: 200 }
    );
  }
}
