import useCloreState from './use-clore-state';
import axios from 'axios';

export default async function useClorePrice() {
  const network = useCloreState.getState().network;

  const priceApiBase =
    network === 'mainnet'
      ? 'https://cors_everywhere_blockbook.clore.ai:443'
      : 'https://cors_everywhere_blockbook.clore.ai:443';

  try {
    return await axios
      .get(`${priceApiBase}/price_api`)
      .then(response => {
        return response.data['clore-ai'];
      })
      .catch(() => 0);
  } catch {
    return 0;
  }
}
