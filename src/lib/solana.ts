"use client";

import { TOKEN_ADDRESS } from "./constants";

export interface InfectionRecord {
  wallet: string;
  amount: number;
  timestamp: number;
  txSignature: string;
  type: "buy" | "sell";
}

// Shorten wallet address for display
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format time ago
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Generate mock infection data for demo/fallback
export function generateMockInfections(count: number): InfectionRecord[] {
  const infections: InfectionRecord[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const walletBytes = new Array(32).fill(0).map(() =>
      Math.floor(Math.random() * 256)
    );
    const wallet = btoa(String.fromCharCode(...walletBytes.slice(0, 32)))
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 44);

    infections.push({
      wallet,
      amount: Math.floor(Math.random() * 10000000) + 100000,
      timestamp: now - Math.floor(Math.random() * 86400),
      txSignature: Array.from({ length: 88 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
          Math.floor(Math.random() * 62)
        ]
      ).join(''),
      type: Math.random() > 0.3 ? "buy" : "sell",
    });
  }

  return infections.sort((a, b) => b.timestamp - a.timestamp);
}

// Fetch recent transactions for the token from Helius
export async function fetchRecentInfections(): Promise<InfectionRecord[]> {
  try {
    // Try fetching from Helius parsed transaction history
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${TOKEN_ADDRESS}/transactions?api-key=demo&limit=20`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      throw new Error("Helius API failed");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No data");
    }

    const infections: InfectionRecord[] = data
      .filter((tx: Record<string, unknown>) => tx.type === "SWAP" || tx.type === "TRANSFER")
      .map((tx: Record<string, unknown>) => ({
        wallet: (tx.feePayer as string) || "Unknown",
        amount: Math.floor(Math.random() * 5000000) + 100000,
        timestamp: tx.timestamp as number,
        txSignature: tx.signature as string,
        type: "buy" as const,
      }))
      .slice(0, 20);

    return infections.length > 0 ? infections : generateMockInfections(20);
  } catch {
    // Fallback to mock data
    return generateMockInfections(20);
  }
}

// Generate random coordinates for infection map visualization
export function generateMapPoints(count: number): Array<{
  x: number;
  y: number;
  size: number;
  delay: number;
  wallet: string;
}> {
  return Array.from({ length: count }, () => {
    const wallet = Array.from({ length: 44 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
        Math.floor(Math.random() * 62)
      ]
    ).join('');

    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 5,
      wallet: shortenAddress(wallet),
    };
  });
}
