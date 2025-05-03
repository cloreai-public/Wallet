'use client';
import {
  IonItem,
  IonLabel,
  IonContent,
  useIonRouter,
  IonList,
  IonPopover,
  IonSegment,
  IonSegmentButton,
  IonIcon,
} from '@ionic/react';
import Image from 'next/image';
import { useState } from 'react';
import SettingSvg from 'public/icons/home/setting.svg';
import { EndPoints } from 'components/router/config';
import secureStorage from 'components/hooks/use-secure-storage';
import { arrowBackOutline, peopleOutline, walletOutline } from 'ionicons/icons';
import useCloreState from 'components/hooks/use-clore-state';
import { useTranslation } from 'react-i18next';
import { useToast } from 'components/router/toast-context';
import { defaultState } from 'components/constants/types';
import { CONST_CURRENT_STORE_NAME } from 'components/constants/constants';

const Settings = () => {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [network, setNetwork] = useState(
    useCloreState.getState().network || t('mainnet') || 'mainnet',
  );
  const [currency, setCurrency] = useState(
    useCloreState.getState().currency || 'usd',
  );
  const [language, setLanguage] = useState(
    useCloreState.getState().language || 'en',
  );

  function setLang(lang: string) {
    i18n.changeLanguage(lang);
    useCloreState.setState({
      language: lang,
    });
    setLanguage(lang);
  }

  function setCurr(curr: string) {
    useCloreState.setState({
      currency: curr,
    });
    setCurrency(curr);
  }

  const router = useIonRouter();
  const handleLogOut = async () => {
    try {
      await secureStorage.removeItem(CONST_CURRENT_STORE_NAME);
      useCloreState.setState(defaultState);
      showToast(t('Session'), t('Logging out'), 'success');
      setTimeout(function () {
        router.push(EndPoints.register);
      }, 2000);
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <>
      <Image
        id="settings-popover"
        src={SettingSvg}
        style={{ cursor: 'pointer' }}
        alt="logotitle"
        priority
        width={28}
      />
      <IonPopover
        mode="md"
        trigger="settings-popover"
        side="left"
        alignment="start"
        dismissOnSelect={true}
      >
        <IonContent>
          <IonList>
            <IonItem button={true} detail={false}>
              <IonSegment value={t('mainnet')}>
                <IonSegmentButton
                  value={t('testnet')}
                  disabled
                  style={{ display: 'none' }}
                >
                  <IonLabel>Testnet</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value={t('mainnet')}>
                  <IonLabel>Mainnet</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonItem>
            <IonItem button={true} detail={false}>
              <IonSegment value={currency}>
                <IonSegmentButton value="usd" onClick={() => setCurr('usd')}>
                  <IonLabel className="ion-align-self-end">USD</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="eur" onClick={() => setCurr('eur')}>
                  <IonLabel>EUR</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="btc" onClick={() => setCurr('btc')}>
                  <IonLabel className="ion-align-self-start">BTC</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonItem>
            <IonItem button={true} detail={false}>
              <IonSegment scrollable={true} value={language}>
                <IonSegmentButton value="en" onClick={() => setLang('en')}>
                  <IonLabel>en</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="es" onClick={() => setLang('es')}>
                  <IonLabel>es</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="ru" onClick={() => setLang('ru')}>
                  <IonLabel>ru</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="ch" onClick={() => setLang('ch')}>
                  <IonLabel>ch</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="tur" onClick={() => setLang('tur')}>
                  <IonLabel>tur</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonItem>
            <IonItem
              onClick={() => {
                router.push(EndPoints.auth.walletsManager);
              }}
              button={true}
              detail={false}
            >
              <IonIcon className="pr-3" icon={walletOutline}></IonIcon>
              {t('Wallets Manager')}
            </IonItem>

            <IonItem
              onClick={() => {
                router.push(EndPoints.auth.contactsManager);
              }}
              button={true}
              detail={false}
            >
              <IonIcon className="pr-3" icon={peopleOutline}></IonIcon>
              {t('Contacts Manager')}
            </IonItem>

            {/* <IonItem id="show-mnemonic-popover" button={true} detail={false}>
              <IonIcon className="pr-3" icon={documentLockOutline}></IonIcon>
              Show Mnemonic
            </IonItem> */}

            <IonItem onClick={handleLogOut} button={true} detail={false}>
              <IonIcon className="pr-3" icon={arrowBackOutline}></IonIcon>
              {t('Logout')}
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>
    </>
  );
};

export default Settings;
