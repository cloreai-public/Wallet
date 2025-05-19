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
  baseUrl: string;

  constructor() {
    const network = useCloreState.getState().network;

    this.baseUrl =
      network === 'mainnet'
        ? 'https://cors_everywhere_blockbook.clore.ai:443'
        : 'http://155.138.230.177:443'; // testnet IP

    console.log('[Blockbook] Network:', network);
    console.log('[Blockbook] Base URL:', this.baseUrl);
  }

  async getWalletData(address: string) {
    if (!address) return { error: true };

    const url = `${this.baseUrl}/api/v2/address/${address}?details=txslight&pageSize=20`;

    let balance = 0;
    let txs: any[] = [];

    return axios
      .get(url)
      .then(response => {
        balance = Number(response.data['balance']) / 1e8 || 0;
        const transactions = response.data['transactions'] || [];

        txs = transactions.map((tx: any) => {
          let total = 0;
          tx.vout.forEach((vout: any) => {
            if (vout.isOwn) total += Number(vout.value);
          });
          const txid = tx.txid;
          const isOwn = tx.vin[0]?.isOwn;
          const value = total / 1e8;
          const date = getDateTime(tx.blockTime);
          const confirmations = tx.confirmations;
          return { txid, isOwn, value, date, confirmations };
        });

        return { balance, txs };
      })
      .catch(() => {
        return { balance: 0, txs: [] };
      });
  }

  async getUnspent(address: string) {
    const url = `${this.baseUrl}/api/v2/utxo/${address}`;
    return axios
      .get(url)
      .then(resp => resp.data)
      .catch(() => []);
  }

  async sendTransaction(hex: string) {
    const url = `${this.baseUrl}/api/v2/sendtx/`;
    return axios
      .post(url, hex)
      .then(resp => resp.data)
      .catch(error => ({ error }));
  }
}

const getDateTime = (date: number) => {
  return new Date(date * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};
