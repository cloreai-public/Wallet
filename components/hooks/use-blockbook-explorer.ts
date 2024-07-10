import axios from 'axios';

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

const bbTransactionsUrl =
  'https://cors_everywhere_blockbook.clore.ai:443/api/v2/address/{ADDRESS}?details=txslight&pageSize=20';
const bbUtxoUrl =
  'https://cors_everywhere_blockbook.clore.ai:443/api/v2/utxo/{ADDRESS}';
const bbSendTransactionUrl =
  'https://cors_everywhere_blockbook.clore.ai:443/api/v2/sendtx/';

export class Blockbook {
  async getWalletData(address: string) {
    if (!address) {
      // console.log('Blockbook: No address');
      return { error: true };
    }
    const url = bbTransactionsUrl.replace('{ADDRESS}', address);

    let balance = 0;
    let txs: any[] = [];
    return axios
      .get(url)
      .then(response => {
        balance = Number(response.data['balance']) / 1e8 || 0;
        const transactions = response.data['transactions'];
        if (transactions) {
          txs = transactions.map((tx: any) => {
            let total = 0;
            tx.vout.forEach((vout: any) => {
              if (vout.isOwn) total += Number(vout.value);
            });
            const txid = tx.txid;
            const isOwn = tx.vin[0].isOwn;
            const value = total / 1e8;
            const date = getDateTime(tx.blockTime);
            const confirmations = tx.confirmations;
            return { txid, isOwn, value, date, confirmations };
          });
        }
        return { balance: balance as number, txs: txs as any[] };
      })
      .catch(error => {
        console.log(error);
        return { balance: 0, txs: [] };
      });
  }

  async getUnspent(address: string) {
    const url = bbUtxoUrl.replace('{ADDRESS}', address);
    return axios
      .get(url)
      .then(tx_resp => {
        return tx_resp.data;
      })
      .catch(error => {
        console.log(error);
        return [];
      });
  }

  async sendTransaction(hex: string) {
    return axios
      .post(bbSendTransactionUrl, hex)
      .then(response => {
        // console.log('[sendTransaction.ts]', response.data);
        return response.data;
      })
      .catch(error => {
        // console.log('[sendTransaction.ts]', error);
        return { error: error };
      });
  }
}

const getDateTime = (date: number) => {
  return new Date(date * 1000).toLocaleDateString('en-US', {
    year: 'numeric', // "2024"
    month: 'short', // "Jan"
    day: 'numeric', // "20"
    hour: 'numeric', // "11"
    minute: 'numeric', // "59"
  });
};
