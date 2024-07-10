'use client';
import {
  IonPage,
  IonCard,
  IonText,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  useIonRouter,
  IonTitle,
  useIonLoading,
  IonLabel,
} from '@ionic/react';
import { Clipboard } from '@capacitor/clipboard';
import { useEffect, useState } from 'react';
import useCloreState, {
  buildTransaction,
} from 'components/hooks/use-clore-state';
import { Blockbook } from 'components/hooks/use-blockbook-explorer';
import WalletList from 'components/routes/home/actions/wallets-list';
import { EndPoints } from 'components/router/config';
import ContactsList from 'components/routes/home/actions/contacts-list';
import { useToast } from 'components/router/toast-context';
import { useTranslation } from 'react-i18next';
import UnlockModal from 'components/routes/home/unlock-modal';
import { Validation } from 'components/hooks/use-validation';
const v = new Validation();

const Send = () => {
  const router = useIonRouter();
  const { t } = useTranslation();

  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [loading, dismissLoading] = useIonLoading();
  const [amount, setAmount] = useState(0);
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const activeWallet = useCloreState(
    (state: { activeWallet: any }) => state.activeWallet,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const unsubscribeActiveWallet = useCloreState.subscribe(
      (state: { activeWallet: any }) => state.activeWallet,
    );

    return () => {
      unsubscribeActiveWallet();
    };
  }, [activeWallet]);

  let networkFee = 0.01;

  const setContact = (contact: any) => {
    setAddress(contact.address);
    setAddressLabel(` (${contact.name})`);
  };

  const handleSendTransaction = async (password: string) => {
    try {
      const { error, message } = v.isAddress(address);
      if (error) {
        setError(message);
        return;
      }

      await loading({
        message: t('Waiting for CLORE Blockchain'),
        animated: true,
      });

      // Create transaction
      const hex = await buildTransaction(password, address, amount);
      if (!hex) dismissLoading();

      // Send transaction
      const response = await new Blockbook().sendTransaction(hex);
      await dismissLoading();

      if (response.error) {
        setError(t('Transaction Failed'));
        return;
      }

      showToast(t('Transaction Complete'), `${response.result}`, 'success');

      router.push(EndPoints.auth.dashboard);
    } catch (error) {
      console.log(error);
    }
  };

  const writeToClipboard = async (clipboard: string) => {
    showToast(t('Clipboard'), t('Copied Address'), 'success');
    await Clipboard.write({
      string: clipboard,
    });
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="flex flex-col items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card max-h-[28rem]">
            <UnlockModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSendTransaction}
            />
            <div className="flex justify-center items-center w-full">
              <IonLabel className="text-2xl text-center py-[15px]">
                {t('Send')}
              </IonLabel>
            </div>
            <div className="flex text-center w-full">
              <WalletList uid="send-wallet-list" />
            </div>
            <IonText className="text-lg ">{activeWallet.balance} CLORE</IonText>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol className="ion-padding-vertical">
                    <IonInput
                      fill="outline"
                      label={`${t('Address')} ${addressLabel}`}
                      labelPlacement="floating"
                      type="text"
                      value={address}
                      onIonChange={(e: Event) => {
                        setAddressLabel('');
                        setAddress((e.target as HTMLInputElement).value);
                      }}
                    />
                    {error ? (
                      <div className="text-red-700 font-bold text-xs">
                        {error || t('Address Is Required')}
                      </div>
                    ) : null}
                  </IonCol>
                  <IonCol className="ion-padding-vertical" size="auto">
                    <ContactsList returnContact={setContact} />
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 w-[95%] pt-[0px]">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      fill="outline"
                      label={t('Amount')}
                      labelPlacement="floating"
                      type="number"
                      value={amount}
                      onIonChange={(e: Event) =>
                        setAmount(Number((e.target as HTMLInputElement).value))
                      }
                    />
                    {error ? (
                      <div className="text-red-700 font-bold text-xs">
                        {error || t('Amount Is Required')}
                      </div>
                    ) : null}
                  </IonCol>
                  <IonCol size="auto">
                    <div className="w-full justify-end">
                      <IonButton size="small">{t('MAX')}</IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 text-sm pt-[0px]">
              {t('Network Fee')}: {networkFee} Clore
            </div>
            <div className="flex w-full justify-between ">
              {/* Send Actions Grid */}
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
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        onClick={handleOpenModal}
                        className="w-full footer-button"
                      >
                        <span>{t('Send')}</span>
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

export default Send;
