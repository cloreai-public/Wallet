import axios from 'axios';

export default async function useClorePrice() {
  try {
    return await axios
      .get('https://cors_everywhere_blockbook.clore.ai/price_api')
      .then(response => {
        return response.data['clore-ai'];
      })
      .catch(error => {
        // console.log(error);
        return 0;
      });
  } catch (error) {
    // console.log(error);
    return 0;
  }
}
