import axios from 'axios';
import useCloreState from './use-clore-state';

// const ws = new WebSocket('wss://blockbook.clore.zelcore/');

// ws.onopen = () => {
//   open();
// };

// ws.onmessage = (event: any) => {
//   console.log('Received:', event.data);
// };

// ws.onclose = () => {
//   console.log('Disconnected from the server');
// };

// ws.onerror = (error: any) => {
//   console.error('WebSocket error:', error);
// };

// function open() {
//   console.log('WebSocket connection established');
//   // Subscribe to an address
//   ws.send(
//     // JSON.stringify({
//     //   method: 'subscribeAddresses',
//     //   params: {
//     //     addresses: [
//     //       'AYu4hoop4vZKWWTSqiKALqkM54jR6wvCnn',
//     //       'AJGHm1eF4y9LDbddEbbwhxXoQo8L2JppTd',
//     //     ],
//     //   },
//     // }),
//     JSON.stringify({
//       method: 'subscribeAddresses',
//       params: {
//         addresses: [
//           'AYu4hoop4vZKWWTSqiKALqkM54jR6wvCnn',
//           'AJGHm1eF4y9LDbddEbbwhxXoQo8L2JppTd',
//         ],
//       },
//     }),
//   );
// }

export class Blockbook {
  // ✅ Dynamic baseUrl: always fetches current network
  get baseUrl(): string {
    const network = useCloreState.getState().network;

    const url =
      network === 'mainnet'
        ? 'https://cors_everywhere_blockbook.clore.ai:443'
        : 'https://pos-testnet.clore.ai'; // testnet IP

    console.log('[Blockbook] Network:', network);
    console.log('[Blockbook] Base URL:', url);

    return url;
  }

  async getWalletData(address: string) {
    if (!address) return { error: true };

    const url = `${this.baseUrl}/api/v2/address/${address}?details=txslight&pageSize=20`;
    console.log('[Blockbook] GET WalletData URL:', url);

    try {
      const response = await axios.get(url);
      const balance = Number(response.data.balance) / 1e8 || 0;
      const transactions = response.data.transactions || [];

      const txs = transactions.map((tx: any) => {
        let total = 0;
        tx.vout.forEach((vout: any) => {
          if (vout.isOwn) total += Number(vout.value);
        });

        return {
          txid: tx.txid,
          isOwn: tx.vin[0]?.isOwn,
          value: total / 1e8,
          date: getDateTime(tx.blockTime),
          confirmations: tx.confirmations,
        };
      });

      return { balance, txs };
    } catch (error) {
      console.error('[Blockbook] Error fetching wallet data:', error);
      return { balance: 0, txs: [] };
    }
  }

  async getUnspent(address: string) {
    const url = `${this.baseUrl}/api/v2/utxo/${address}`;
    console.log('[Blockbook] GET UTXO URL:', url);

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('[Blockbook] Error fetching UTXOs:', error);
      return [];
    }
  }

  async getTransaction(txid: string) {
    const url = `${this.baseUrl}/api/v2/tx/${txid}`;
    console.log('[Blockbook] GET TX URL:', url);
  
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('[Blockbook] Error fetching transaction:', error);
      throw error;
    }
  }

  async sendTransaction(hex: string) {
    const url = `${this.baseUrl}/api/v2/sendtx/`;
    console.log('[Blockbook] POST TX URL:', url);

    try {
      const response = await axios.post(url, hex);
      return response.data;
    } catch (error) {
      console.error('[Blockbook] Error sending transaction:', error);
      return { error };
    }
  }
}

const getDateTime = (unixTime: number) => {
  return new Date(unixTime * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};
