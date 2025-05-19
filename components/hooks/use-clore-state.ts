import bitgo from 'clore-lib';
import bitcoinMessage from 'bitcoinjs-message';
const CoinKey = require('coinkey');

import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { create } from 'zustand';
import { encrypt, decrypt } from './use-crypto';
import { Blockbook } from './use-blockbook-explorer';
import { CONST_CURRENT_STORE_NAME } from 'components/constants/constants';
import secureStorage from './use-secure-storage';
import { defaultState, Wallet, Contact } from 'components/constants/types';

const CloreState = (set: any, get: any) => {
  return {
    ...defaultState,
    updateActiveWallet: (activeWallet: Wallet) =>
      set(() => ({ activeWallet })),
    updateWallets: (wallets: Wallet[]) =>
      set(() => ({ wallets })),
    updateSettings: (settings: {
      currency: string;
      language: string;
      network: string;
    }) =>
      set(() => ({
        currency: settings.currency,
        language: settings.language,
        network: settings.network,
      })),
  };
};

const useCloreState = create(CloreState);
export default useCloreState;

function getBitgoNetwork() {
  const net = useCloreState.getState().network;
  return bitgo.networks[net === 'testnet' ? 'cloreaiTestnet' : 'cloreai'];
}

async function getHDNode(
  mnemonic: string,
  account?: number,
  net: 'mainnet' | 'testnet' = 'mainnet',
) {
  const derivePath = `m/44'/1313'/0'/0/${String(account)}`;
  try {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const seedBuffer = Buffer.from(seed);
    const networkKey = net === 'mainnet' ? 'cloreai' : 'cloreaiTestnet';
    const root = bitgo.HDNode.fromSeedBuffer(seedBuffer, bitgo.networks[networkKey]);
    return { root, derivePath };
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function createMnemonic() {
  const mn = bip39.generateMnemonic(wordlist);
  const mnemonic = mn.split(' ');
  if (bip39.validateMnemonic(mn, wordlist)) return mnemonic;
  console.error('Invalid Mnemonic');
  return [];
}

export async function createWallet(
  name: string,
  mnemonic: string[],
  password: string,
) {
  try {
    const s = defaultState;

    const {
      error,
      encryptedMnemonic,
      mnemonicSalt,
      encryptedPassword,
      passSalt,
    } = await encrypt(mnemonic.join(' '), password);
    if (error) return false;

    s.encryptedMnemonic = encryptedMnemonic;
    s.mnemonicSalt = mnemonicSalt.toString('hex');
    if (!encryptedPassword || !passSalt) return false;
    s.encryptedPassword = encryptedPassword;
    s.passSalt = passSalt.toString('hex');

    await secureStorage.setItem(CONST_CURRENT_STORE_NAME, JSON.stringify(s));
    useCloreState.setState(s);
    const success = await addWallet(name, password);
    if (!success) return false;
    return s;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function addWallet(name: string, password: string) {
  try {
    const wallet: Wallet = {
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
    };

    const state = useCloreState.getState();
    const walletIndex = state.wallets.length;
    wallet.index = walletIndex;

    const mnemonic = await decrypt(state.encryptedMnemonic, password, state.mnemonicSalt);
    if (!mnemonic) return false;

    const mainnetNode = await getHDNode(mnemonic, walletIndex, 'mainnet');
    const testnetNode = await getHDNode(mnemonic, walletIndex, 'testnet');
    if (!mainnetNode || !testnetNode) return false;

    const mainnetChild = mainnetNode.root.derivePath(mainnetNode.derivePath);
    const testnetChild = testnetNode.root.derivePath(testnetNode.derivePath);

    wallet.name = name;
    wallet.addresses = {
      mainnet: mainnetChild.getAddress(),
      testnet: testnetChild.getAddress(),
    };
    wallet.publicKeys = {
      mainnet: mainnetChild.getPublicKeyBuffer().toString('hex'),
      testnet: testnetChild.getPublicKeyBuffer().toString('hex'),
    };

    addContact(`(local) ${name}`, wallet.addresses.mainnet); // optionally also add testnet

    if (wallet.index === 0) {
      useCloreState.setState({ activeWallet: wallet });
      state.activeWallet = wallet;
    }

    useCloreState.getState().updateActiveWallet(wallet);
    state.wallets = [...state.wallets, wallet];
    await secureStorage.setItem(CONST_CURRENT_STORE_NAME, JSON.stringify(state));
    useCloreState.setState(state);
    return wallet;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function addContact(name: string, address: string) {
  try {
    const state = useCloreState.getState();
    const contact: Contact = {
      index: state.contacts.length,
      name,
      address,
    };
    state.contacts.push(contact);
    await secureStorage.setItem(CONST_CURRENT_STORE_NAME, JSON.stringify(state));
  } catch (error) {
    console.error(error);
  }
}

export async function buildTransaction(
  password: string,
  toAddress: string,
  amount: number,
  fee?: number,
) {
  try {
    const state = useCloreState.getState();
    const currentNetwork = state.network;
    const fromAddress = state.activeWallet.addresses[currentNetwork];
    const walletIndex = state.activeWallet.index;

    const mnemonic = await decrypt(state.encryptedMnemonic, password, state.mnemonicSalt);
    if (!mnemonic) return false;

    const node = await getHDNode(mnemonic, walletIndex, currentNetwork);
    if (!node) return false;

    const childNode = node.root.derivePath(node.derivePath);
    if (!fee) fee = 1000000;
    amount = amount * 1e8;
    const totalWithFee = amount + fee;

    const txb = new bitgo.TransactionBuilder(getBitgoNetwork(), fee);
    const utxos = await new Blockbook().getUnspent(fromAddress);

    txb.addOutput(toAddress, amount);

    let total = 0;
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      txb.addInput(utxo.txid, utxo.vout, null, null);
      total += Number(utxo.value);
      if (total > totalWithFee) break;
    }

    const change = total - totalWithFee;
    if (change > 0) {
      txb.addOutput(fromAddress, change);
    }

    for (let i = 0; i < txb.inputs.length; i++) {
      txb.sign(
        i,
        childNode.keyPair,
        null,
        bitgo.Transaction.SIGHASH_ALL,
        Number(utxos[i].value),
      );
    }

    const hex = txb.build().toHex();
    return hex;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function buildMessage(message: string, password: string) {
  try {
    const state = useCloreState.getState();
    const currentNetwork = state.network; // 'mainnet' or 'testnet'
    const walletIndex = state.activeWallet.index;

    const mnemonic = await decrypt(state.encryptedMnemonic, password, state.mnemonicSalt);
    if (!mnemonic) return false;

    const node = await getHDNode(mnemonic, walletIndex, currentNetwork);
    if (!node) return false;

    const childNode = node.root.derivePath(node.derivePath);
    const wif = childNode.keyPair.toWIF();

    const coinkey = CoinKey.fromWif(wif);

    if (currentNetwork === 'testnet') {
      coinkey.versions = {
        bip32: {
          public: 0x043587cf,
          private: 0x04358394,
        },
        bip44: 1313,
        private: 0x72,       
        public: 0x2a,        
        scripthash: 0x7c,    
      };
    } else {
      coinkey.versions = {
        bip32: {
          private: 0x0488ade4,
          public: 0x0488b21e,
        },
        bip44: 1313,
        private: 0x70,
        public: 0x17,
        scripthash: 0x7a,
      };
    }

    const messagePrefix =
      currentNetwork === 'testnet'
        ? '\x18Clore Testnet Signed Message: \n'
        : '\x16Clore Signed Message:\n';

    const sig = bitcoinMessage.sign(
      message,
      coinkey.privateKey,
      coinkey.compressed,
      messagePrefix,
    );

    return sig.toString('base64');
  } catch (error) {
    console.error(error);
    return false;
  }
}

