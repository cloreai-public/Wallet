import { useEffect, useState } from 'react';

export interface ColdStakingSummary {
  balance: number;
  address: string;
  utxos: any[];
}

export function useStakingStatus() {
  const [status, setStatus] = useState<ColdStakingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await window.electronAPI.listColdUtxos();
        if (!result) {
          console.log('listColdUtxos returned null or undefined');
        } else {
          console.log('listColdUtxos result:', result);
          setStatus(result);
        }
      } catch (err) {
        console.error('RPC error:', err);
        setError('Failed to fetch cold staking status');
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  return { status, loading, error };
}
