'use client';
import { createContext, ReactNode, use, useState } from 'react';
import { useEffect } from 'react';
import { EndPoints, getAllPaths } from 'components/router/config';
import useCloreState from 'components/hooks/use-clore-state';
import { useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { IAuthContext } from 'components/constants/types';
import useClorePrice from 'components/hooks/use-clore-price';
import { useTranslation } from 'react-i18next';
import secureStorage from 'components/hooks/use-secure-storage';
import {
  CONST_CURRENT_STORE_NAME,
  CONST_OLD_STORE_NAMES,
} from 'components/constants/constants';
import { Blockbook } from 'components/hooks/use-blockbook-explorer';

const bb = new Blockbook();

type Props = {
  children?: ReactNode;
};

const initialValue = {
  authenticated: false,
  setAuthenticated: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: Props) => {
  const { i18n } = useTranslation();
  const router = useIonRouter();
  const location = useLocation();

  //Initializing an auth state with false value (unauthenticated)
  const [authenticated, setAuthenticated] = useState(
    initialValue.authenticated,
  );
  const currentNetwork = useCloreState.getState().network as 'mainnet' | 'testnet';
  console.log('currentNetwork', currentNetwork);
  const wallets = useCloreState((state: { wallets: any }) => state.wallets);
  const updateWallets = useCloreState((state: any) => state.updateWallets);
  const getWalletData = async () => {
    if (!wallets) return;
    console.log('wallets', wallets);
    for (let i = 0; i < wallets.length; i++) {
      console.log('wallets[i].address[currentNetwork]', wallets[i].addresses[currentNetwork]);
      const data = await bb.getWalletData(wallets[i].addresses[currentNetwork]);

      try {
        // if (!data) throw new Error('No address found');
        if ('balance' in data) {
          if (data.balance) {
            wallets[i].balance = data.balance;
          }
          if (data.txs) {
            wallets[i].txs = data.txs;
          }
        }
      } catch (e) {
        // console.log(e);
      }
    }
    if (wallets.length > 0) updateWallets(wallets);
  };

  setTimeout(getWalletData, 1000 * 60); // 60 seconds

  // Get latest price in all currencies
  useClorePrice().then(data => {
    useCloreState.setState({ prices: data });
  });

  // Monitor routers for proper access control
  useEffect(() => {
    // console.log('Location Changed: Checking for authentication...');
    if (!authenticated) {
      // console.log('Not authenticated');
      // console.log('Checking for stored states...');

      // Clear old states
      CONST_OLD_STORE_NAMES.forEach(async name => {
        await secureStorage.removeItem(name);
      });

      secureStorage.removeItem;
      secureStorage
        .getItem(CONST_CURRENT_STORE_NAME)
        .then(s => {
          if (s) {
            const state = JSON.parse(s);
            // console.log('Found State');

            if (
              state.encryptedMnemonic &&
              state.encryptedPassword &&
              state.wallets
            ) {
              // Restore state
              // console.log('Restoring...');
              i18n.changeLanguage(state.language);
              useCloreState.setState(state);
              // console.log('State Restored');
              setAuthenticated(true);
              router.push(EndPoints.auth.dashboard);
            }
          }
        })
        .catch(e => {
          // console.log(e);
        });
    } else {
      // console.log('Authenticated');
    }
  }, [location]);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
