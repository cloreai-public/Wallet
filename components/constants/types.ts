export type IAuthContext = {
  authenticated: boolean;
  setAuthenticated: (newState: boolean) => void;
};

export type Wallet = {
  index: number;
  name: string;
  addresses: {
    mainnet: string;
    testnet: string;
  };
  publicKeys: {
    mainnet: string;
    testnet: string;
  };
  balance: number;
  txs: any[];
};

export type Contact = {
  index: number;
  name: string;
  address: string;
};

export type Wallets = Wallet[];
export type Contacts = Contact[];

export type State = {
  currency: string;
  prices: {
    usd: 0;
    btc: 0;
    eth: 0;
  };
  language: string;
  network: string;
  encryptedMnemonic: string;
  mnemonicSalt: string;
  encryptedPassword: string;
  passSalt: string;
  contacts: Contacts;
  wallets: Wallets;
  activeWallet: Wallet;
};

export const defaultState: State = {
  currency: 'usd',
  language: 'en',
  network: 'mainnet',
  encryptedMnemonic: '',
  mnemonicSalt: '',
  encryptedPassword: '',
  passSalt: '',
  contacts: [],
  wallets: [],
  prices: {
    usd: 0,
    btc: 0,
    eth: 0,
  },
  activeWallet: {
    index: 0,
    name: '',
    addresses: {
      mainnet: '',
      testnet: '',
    },
    publicKeys: {
      mainnet: '',
      testnet: '',
    },
    balance: 0,
    txs: [],
  },
};

export type Action = {
  updateActiveWallet: (activeWallet: State['activeWallet']) => void;
  updateWallets: (wallets: Wallet[]) => void;
  updateSettings: (settings: {
    currency: string;
    language: string;
    network: string;
  }) => void;
};
