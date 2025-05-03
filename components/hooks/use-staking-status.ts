import { useEffect, useState } from 'react';

export interface CloreStakingStatus {
  staking_status: number;
  staking_enabled: number;
  coldstaking_enabled: number;
  haveconnections: number;
  walletunlocked: number;
  stakeablecoins: number;
  stakingbalance: number;
  stakesplitthreshold: number;
  lastattempt_age: number;
  lastattempt_depth: number;
  lastattempt_hash: string;
  lastattempt_coins: number;
  lastattempt_tries: number;
}

export function useStakingStatus() {
  const [status, setStatus] = useState<CloreStakingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await window.electronAPI.getStakingStatus();
        if (!result) {
          console.log('getStakingStatus returned null or undefined');
        } else {
          console.log('Staking result:', result);
          setStatus(result);
        }
      } catch (err) {
        console.error('RPC error:', err);
        setError('Failed to fetch staking status');
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  return { status, loading, error };
}
