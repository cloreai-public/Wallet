import bitgo from 'clore-lib';
const network = bitgo.networks['cloreai'];
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
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const CloreState = (set: any, get: any) => {
  return {
    ...defaultState,
    updateActiveWallet: (activeWallet: Wallet) =>
      set(() => ({ activeWallet: activeWallet })),
    updateWallets: (wallets: Wallet[]) => {
      set(() => ({ wallets: wallets }));
    },
    updateSettings: (settings: {
      currency: string;
      language: string;
      network: string;
    }) => {
      set(() => ({
        currency: settings.currency,
        language: settings.language,
        network: settings.network,
      }));
    },
  };
};
const useCloreState = create(CloreState);
export default useCloreState;

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
    // New Wallet State with default values
    const wallet = <Wallet>{
      index: 0,
      name: '',
      address: '',
      publicKey: '',
      balance: 0,
      txs: [],
    };
    const walletIndex = useCloreState.getState().wallets.length;
    wallet.index = walletIndex;
    const encryptedMnemonic = useCloreState.getState().encryptedMnemonic;
    const mnemonicSalt = useCloreState.getState().mnemonicSalt;
    const mnemonic = await decrypt(encryptedMnemonic, password, mnemonicSalt);
    if (!mnemonic) return false;
    const node = await getHDNode(mnemonic, walletIndex);
    if (!node) {
      // console.log('failed');
      return false;
    }
    const childNode = node.root.derivePath(node.derivePath);

    wallet.name = name;

    wallet.address = childNode.getAddress();
    addContact(`(local) ${name}`, wallet.address);
    wallet.publicKey = childNode.getPublicKeyBuffer().toString('hex');

    const s = useCloreState.getState();
    if (wallet.index === 0) {
      useCloreState.setState({ activeWallet: wallet });
      s.activeWallet = wallet;
    }
    useCloreState.getState().updateActiveWallet(wallet);
    s.wallets = [...useCloreState.getState().wallets, wallet];
    await secureStorage.setItem(CONST_CURRENT_STORE_NAME, JSON.stringify(s));
    useCloreState.setState(s);
    return wallet;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function addContact(name: string, address: string) {
  try {
    // New Contact State with default values
    const contact = <Contact>{
      index: useCloreState.getState().contacts.length,
      name: name,
      address: address,
    };
    useCloreState.getState().contacts.push(contact);
    const s = useCloreState.getState();
    await secureStorage.setItem(CONST_CURRENT_STORE_NAME, JSON.stringify(s));
  } catch (error) {
    console.error(error);
  }
}

async function getHDNode(mnemonic: string, account?: number) {
  // 1313 found: chainparams.cpp nExtCoinType = 1313; ln 196
  const derivePath = `m/44'/1313'/0'/0/${String(account)}`;
  try {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const seedBuffer = Buffer.from(seed);
    const root = bitgo.HDNode.fromSeedBuffer(seedBuffer, network);

    return { root, derivePath };
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function createMnemonic() {
  const mn = bip39.generateMnemonic(wordlist);
  const mnemonic = Array<string>();
  mn.split(' ').forEach(word => {
    mnemonic.push(word);
  });
  if (bip39.validateMnemonic(mn, wordlist)) return mnemonic;
  else {
    console.error('Invalid Mnemonic');
    return [];
  }
}

// ----------------------------------------------------------------------

export async function buildTransaction(
  password: string,
  toAddress: string,
  amount: number,
  fee?: number,
) {
  try {
    const fromAddress = useCloreState.getState().activeWallet.address;
    const walletIndex = useCloreState.getState().activeWallet.index;

    const encryptedMnemonic = useCloreState.getState().encryptedMnemonic;
    const mnemonicSalt = useCloreState.getState().mnemonicSalt;
    if (!encryptedMnemonic) return false;
    const mnemonic = await decrypt(encryptedMnemonic, password, mnemonicSalt);
    if (!mnemonic) return false;
    const node = await getHDNode(mnemonic, walletIndex);
    if (!node) {
      // console.log('failed');
      return false;
    }
    const childNode = node.root.derivePath(node.derivePath);

    if (!fee) fee = 1000000;
    amount = amount * 1e8;
    const totalWithFee = amount + fee;

    const txb = new bitgo.TransactionBuilder(network, fee);
    const utxos = await new Blockbook().getUnspent(fromAddress);

    txb.addOutput(toAddress, amount);
    let total = 0;
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      txb.addInput(utxo.txid, utxo.vout, null, null);
      total += Number(utxo.value);
      if (total > totalWithFee) break;
    }
    const change = total - (amount + fee);
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
    const walletIndex = useCloreState.getState().activeWallet.index;
    const mnemonicSalt = useCloreState.getState().mnemonicSalt;
    const encryptedMnemonic = useCloreState.getState().encryptedMnemonic;
    const mnemonic = await decrypt(encryptedMnemonic, password, mnemonicSalt);
    if (!mnemonic) {
      // console.log('failed');
      return false;
    }
    const node = await getHDNode(mnemonic, walletIndex);
    if (!node) {
      // console.log('failed');
      return false;
    }
    const childNode = node.root.derivePath(node.derivePath);

    const wif = childNode.keyPair.toWIF();
    const coinkey = CoinKey.fromWif(wif);
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

    const messagePrefix = '\x16Clore Signed Message:\n';
    const privateKey = coinkey.privateKey;
    const sig = bitcoinMessage.sign(
      message,
      privateKey,
      coinkey.compressed,
      messagePrefix,
    );

    const signature = sig.toString('base64');

    return signature;
  } catch (error) {
    console.error(error);
    return false;
  }
}
