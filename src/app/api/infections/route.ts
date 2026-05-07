import { NextResponse } from "next/server";

const TOKEN_CA = "9bSZhZFAeREPhpAto5P6H4WXUNutWJTQkvporCPXpump";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_API = `https://api.helius.xyz/v0`;

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HeliusTx {
  signature: string;
  timestamp: number;
  feePayer: string;
  type: string;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
  }>;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
}

export async function GET() {
  if (!HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Helius API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch recent transactions for the token address
    const response = await fetch(
      `${HELIUS_API}/addresses/${TOKEN_CA}/transactions?api-key=${HELIUS_API_KEY}&limit=50`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 15 },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Helius API error:", response.status, errText);
      return NextResponse.json(
        { error: "Failed to fetch from Helius", detail: errText },
        { status: response.status }
      );
    }

    const transactions: HeliusTx[] = await response.json();

    // Parse transactions into infection records
    const infections = transactions
      .filter((tx) => {
        // Filter for swaps/transfers involving our token
        return (
          tx.type === "SWAP" ||
          tx.type === "TRANSFER" ||
          tx.type === "UNKNOWN" ||
          (tx.tokenTransfers && tx.tokenTransfers.some((t) => t.mint === TOKEN_CA))
        );
      })
      .map((tx) => {
        // Find the buyer/receiver wallet
        let wallet = tx.feePayer;
        let amount = 0;

        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          const relevantTransfer = tx.tokenTransfers.find(
            (t) => t.mint === TOKEN_CA
          );
          if (relevantTransfer) {
            wallet = relevantTransfer.toUserAccount || tx.feePayer;
            amount = relevantTransfer.tokenAmount || 0;
          }
        }

        return {
          pubkey: wallet,
          amount: Math.round(amount),
          timestamp: tx.timestamp * 1000, // Convert to ms
          signature: tx.signature,
          type: tx.type,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
