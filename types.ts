
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type TabType = 'home' | 'earn' | 'wallet' | 'refer' | 'admin';

export interface VideoItem {
    id: string;
    title: string;
    url: string;
    reward: number;
    status: 'pending' | 'approved' | 'rejected';
    views: number;
    thumbnail?: string;
}

export interface UserStats {
    balance: number;
    coins: number;
    referrals: {
        l1: number;
        l2: number;
        l3: number;
    };
    todayEarnings: number;
}

export interface Artifact {
  id: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface Session {
    id: string;
    prompt: string;
    timestamp: number;
    artifacts: Artifact[];
}
