'use client';
import {
  IonPage,
  IonContent,
  IonCard,
  IonItem,
  IonLabel,
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
  IonText,
  IonNote,
  IonButton,
  useIonRouter,
} from '@ionic/react';
import WalletList from 'components/routes/home/actions/wallets-list';
import { arrowDownCircle, arrowForward, arrowUpCircle } from 'ionicons/icons';
import useCloreState from 'components/hooks/use-clore-state';
import { Wallet } from 'components/constants/types';
import { useTranslation } from 'react-i18next';

const History = () => {
  const { t } = useTranslation();
  const activeWallet = useCloreState(
    (state: { activeWallet: Wallet }) => state.activeWallet,
  );
  console.log('activewallet', activeWallet);
  const network = useCloreState.getState().network;

    const url =
      network === 'mainnet'
        ? 'https://blockbook.clore.ai'
        : 'https://pos-testnet.clore.ai'; // testnet IP

  const router = useIonRouter();

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen scrollY={false}>
        <div className="flex items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card max-h-[40rem]">
            <div className="flex justify-center items-center w-full">
              <IonLabel className="text-2xl text-center py-[15px]">
                {t('History')}
              </IonLabel>
            </div>
            <div className="flex justify-center items-center w-full mb-2">
              <WalletList uid="history-wallet-list" />
            </div>
            <IonList className="w-full h-[25rem]" lines="inset">
              <IonContent className="ion-padding" fullscreen scrollY={true}>
                {activeWallet.txs.length > 0 ? (
                  activeWallet.txs.map((t: any, index: number) => (
                    <IonItem
                      key={index}
                      style={{ cursor: 'pointer' }}
                      href={`${url}/tx/${t.txid}`}
                      target="_blank"
                    >
                      <IonGrid>
                        <IonRow>
                          <IonCol size="1">
                            <IonLabel className="text-center">
                              <IonIcon
                                icon={t.isOwn ? arrowUpCircle : arrowDownCircle}
                                color={t.isOwn ? 'danger' : 'success'}
                              />{' '}
                            </IonLabel>
                          </IonCol>
                          <IonCol size="10" className="text-center">
                            <IonText className="pl-[10px] text-center ">
                              <strong>{t.value}</strong>
                              <IonNote className="sub-text ml-2">CLORE</IonNote>
                            </IonText>
                          </IonCol>
                          <IonCol size="1">
                            <IonIcon
                              color="dark"
                              size="small"
                              icon={arrowForward}
                            />
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonText className="history-date-text">
                            {t.date}
                          </IonText>
                        </IonRow>
                      </IonGrid>
                    </IonItem>
                  ))
                ) : (
                  <IonItem>
                    {' '}
                    <IonLabel className="text-center">
                      No History Found
                    </IonLabel>
                  </IonItem>
                )}
              </IonContent>
            </IonList>
            <div className="flex w-full justify-between ">
              {/* History Actions Grid */}
              <IonGrid className="m-[0px] pt-[0px]">
                <IonRow className="justify-center">
                  <IonCol size="12">
                    <div className="ion-activatable btn w-full ion-margin-vertical">
                      <IonButton
                        className="w-full footer-button"
                        onClick={() => {
                          router.goBack();
                        }}
                      >
                        <span>{t('Go Back')}</span>
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

export default History;
