'use client';
import {
  IonPage,
  IonCard,
  IonText,
  IonContent,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  useIonRouter,
  IonSkeletonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { useToast } from 'components/router/toast-context';
import { copySharp } from 'ionicons/icons';
import Image from 'next/image';
import LogoTitle from 'public/logo-title.svg';
import { EndPoints } from 'components/router/config';
import useCloreState from 'components/hooks/use-clore-state';
import WalletList from './actions/wallets-list';
import { useTranslation } from 'react-i18next';
import { Blockbook } from 'components/hooks/use-blockbook-explorer';
import Settings from './settings';
const bb = new Blockbook();

const Dashboard = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { showToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const updateWallets = useCloreState(
    (state: { updateWallets: any }) => state.updateWallets,
  );
  const activeWallet = useCloreState(
    (state: { activeWallet: any }) => state.activeWallet,
  );
  const currency = useCloreState((state: { currency: any }) => state.currency);
  const price = useCloreState(
    (state: { prices: { [x: string]: any } }) =>
      state?.prices[currency as keyof typeof state.prices],
  );
  const [balance, setBalance] = useState(
    useCloreState(
      (state: { activeWallet: { balance: any } }) => state.activeWallet.balance,
    ),
  );
  const network = useCloreState((state: { network: string }) => state.network); // 'mainnet' or 'testnet'

  async function getCurrentBalance() {
    const { activeWallet, network } = useCloreState.getState(); 
    const currentAddress = activeWallet?.addresses?.[network];
    console.log('Fetching balance for:', currentAddress);
    console.log('currentAddress', currentAddress);
  
    if (!currentAddress) return;
  
    setLoaded(false); // Move this to top and outside any async calls
  
    try {
      const data = await bb.getWalletData(currentAddress);
      console.log('data', data);
  
      if ('balance' in data && data.balance != null) {
        setBalance(data.balance);
        setLoaded(true); 
  
        const wallets = useCloreState.getState().wallets;
        const idx = wallets.findIndex((w: any) => w.addresses[network] === currentAddress);
        if (idx !== -1) {
          wallets[idx].balance = data.balance;
          wallets[idx].txs = data.txs;
          updateWallets(wallets);
        }
      } else {
        setLoaded(true); 
      }
    } catch (e) {
      console.error(e);
      setLoaded(true); 
    }
  }
  

  useEffect(() => {
    // if no address then confirm there is a logged in user
   
    getCurrentBalance();
    let intervalId = setInterval(getCurrentBalance, 1000 * 60 * 5);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
   
    getCurrentBalance();
  }, [network]);
  

  const writeToClipboard = async () => {
    const address = activeWallet?.addresses?.[network];
    if (address) {
      await Clipboard.write({ string: `${address}` });
      showToast(`${activeWallet.name} Wallet Address Copied`, address, 'success');
    }
  };  

  return (
    <IonPage>
      {/* <Header /> */}
      <IonContent className="ion-padding" fullscreen>
        <div className="flex flex-col items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card">
            <div className="settings-header">
              <div className="flex ">
                <IonButton
                  slot="end"
                  className="header-copy-button"
                  onClick={() => {
                    writeToClipboard();
                  }}
                >
                  <IonIcon icon={copySharp} aria-hidden="true"></IonIcon>
                </IonButton>

                <Settings />
              </div>
            </div>

            <div className="logo-header">
              {/* <Image src={LogoSvg} alt="logo" priority width={90} /> */}
              <Image src={LogoTitle} alt="logotitle" priority width={110} />
            </div>

            <div className="bg-ani bg-no-repeat absolute bg-contain bg-center top-[10%] h-[14rem] w-[98%]" />

            <div className="flex justify-center items-center w-[80%] ion-padding">
              <IonText className="text-4xl">
                {loaded && `${balance}`}
                {!loaded && (
                  <IonSkeletonText animated={true} style={{ width: '40px', height: '20px' }} />
                )}
                <span className="text-sm float-right"> Clore</span>
              </IonText>
            </div>
            <div className="flex justify-center items-center w-2/3 ">
              <IonText className="text-2xl">
                {loaded &&
                  `${(balance * (price ?? 0)).toFixed(currency === 'btc' ? 8 : 2)} ${currency.toUpperCase()}`}
                {!loaded && (
                  <IonSkeletonText animated={true} style={{ width: '40px', height: '20px' }} />
                )}
              </IonText>
            </div>
            <div className="flex w-full justify-between ">
              {/* Dashboard Actions Grid */}
              <IonGrid className="m-[0px]">
                <IonRow>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        onClick={() => {
                          router.push(EndPoints.auth.send);
                        }}
                        className="w-full footer-button"
                      >
                        <span>{t('Send')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className="btn w-full">
                      <WalletList uid="dashboard-wallet-list" />
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full ">
                      <IonButton
                        className="w-full footer-button"
                        onClick={() => {
                          router.push(EndPoints.auth.poh);
                        }}
                      >
                        <span>PoH / {t('Sign')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        className="w-full footer-button"
                        onClick={() => {
                          router.push(EndPoints.auth.history);
                        }}
                      >
                        <span>{t('History')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        className="w-full footer-button"
                        onClick={() => {
                          router.push(EndPoints.auth.pos);
                        }}
                      >
                        <span>{t('POS / Staking')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

function componentDidMount() {
  throw new Error('Function not implemented.');
}

function componentWillUnmount() {
  throw new Error('Function not implemented.');
}
