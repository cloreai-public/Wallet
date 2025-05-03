'use client';
import {
  IonPage,
  IonContent,
  IonCard,
  IonItem,
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonText,
  IonButton,
  useIonRouter,
  IonInput,
  IonLabel,
} from '@ionic/react';
import useCloreState, { addWallet } from 'components/hooks/use-clore-state';
import { useState } from 'react';
import { useToast } from 'components/router/toast-context';
import UnlockModal from 'components/routes/home/unlock-modal';
import { Clipboard } from '@capacitor/clipboard';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'components/constants/types';

const WalletManager = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [walletName, setWalletName] = useState('');
  const wallets = useCloreState.getState().wallets;
  const router = useIonRouter();

  const addNewWallet = async (password: string) => {
    if (walletName) {
      const walletsWithName = wallets.filter(
        (w: Wallet) => w.name == walletName,
      );

      if (walletsWithName.length > 0) {
        setError(`${walletName} Already In Use`);
        return;
      }
      const newW = await addWallet(walletName, password);
      if (newW) {
        setWalletName('');
      }
    } else setError('Error adding new wallet');
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const midEllipsis = (str: string, n = 5) => {
    return str.length >= n * 2 + 3
      ? str.substring(0, n) + '...' + str.substring(str.length - n)
      : str;
  };

  const writeToClipboard = async (address: string) => {
    await Clipboard.write({ string: `${address}` });
    showToast(t(`Address Copied`), `${address}`, 'success');
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen scrollY={false}>
        <div className="flex items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card max-h-[40rem]">
            <UnlockModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={addNewWallet}
            />
            <div className="flex justify-center items-center w-full">
              <IonLabel className="text-2xl text-center py-[15px]">
                {t('Wallet Manager')}
              </IonLabel>
            </div>
            <IonList className="w-full h-[25rem]" lines="inset">
              <IonContent className="ion-padding" fullscreen scrollY={true}>
                <IonItem className="px-[5px] pt-[5px]">
                  <IonGrid>
                    <IonRow>
                      <IonCol size="4">
                        <IonText className="text-center">{t('Name')}</IonText>
                      </IonCol>
                      <IonCol size="8">
                        <IonText>{t('Address')}</IonText>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
                {wallets.map((wallet: Wallet, index: number) => (
                  <IonItem key={index} className="px-[5px] pt-[5px]">
                    <IonGrid>
                      <IonRow className="w-full">
                        <IonCol size="3" className="ion-padding-vertical">
                          <IonText style={{ fontSize: '0.85rem' }}>
                            {wallet.name}
                          </IonText>
                        </IonCol>
                        <IonCol
                          size="6"
                          className="ion-padding-vertical w-full"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {wallet.address}
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonItem>
                ))}
              </IonContent>
            </IonList>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={t('New Wallet Name')}
                      labelPlacement="floating"
                      type="text"
                      value={walletName}
                      onIonChange={(e: Event) =>
                        setWalletName((e.target as HTMLInputElement).value)
                      }
                    />
                    {error ? (
                      <div className="text-[#ff3d3d] font-bold text-xs">
                        {error || 'Wallet Name Is Required'}
                      </div>
                    ) : null}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="flex w-full justify-between ">
              {/* Wallet Manager Actions Grid */}
              <IonGrid className="m-[0px] pt-[0px]">
                <IonRow>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
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
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full ">
                      <IonButton
                        id="popover-button"
                        onClick={handleOpenModal}
                        className="w-full footer-button"
                      >
                        <span>{t('Add Wallet')}</span>
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

export default WalletManager;
