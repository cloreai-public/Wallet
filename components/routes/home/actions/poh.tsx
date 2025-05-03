'use client';
import {
  IonPage,
  IonCard,
  IonContent,
  IonRow,
  IonCol,
  IonGrid,
  IonIcon,
  IonTextarea,
  IonButton,
  useIonRouter,
  IonInput,
  IonLabel,
} from '@ionic/react';
import useCloreState, { buildMessage } from 'components/hooks/use-clore-state';
import { copySharp } from 'ionicons/icons';
import { useToast } from 'components/router/toast-context';
import WalletList from 'components/routes/home/actions/wallets-list';
import { useEffect, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { useTranslation } from 'react-i18next';
import UnlockModal from 'components/routes/home/unlock-modal';

const PoH = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useIonRouter();
  const [signature, setSignature] = useState('');
  const [sendMemo, setSendMemo] = useState('');
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

  const handleSignPoH = async (password: string) => {
    if (!sendMemo) {
      showToast('Error', t('Message is required'), 'danger');
      return;
    }

    const sig = await buildMessage(sendMemo, password);
    if (!sig) {
      showToast('Error', t('Failed to sign message'), 'danger');
      return;
    }
    setSignature(sig);
    showToast('Signature', t('Message signed'), 'success');
  };

  const writeToClipboard = async (clipboard: string) => {
    showToast('Clipboard', t('Copied Information'), 'success');
    await Clipboard.write({
      string: clipboard,
    });
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen scrollY={false}>
        <div className="flex items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card max-h-[38rem]">
            <UnlockModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSignPoH}
            />
            <div className="flex justify-center items-center w-full">
              <IonLabel className="text-xl text-center py-[20px]">
                {t('Proof of Holdings')} / {t('Sign')}
              </IonLabel>
            </div>
            <div className="flex justify-center items-center w-full">
              <WalletList uid="poh-wallet-list" />
            </div>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol className="ion-padding-vertical">
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={`${t('Address')} (${activeWallet.name})`}
                      labelPlacement="floating"
                      type="text"
                      value={activeWallet.address}
                      readonly
                    >
                      <IonButton
                        slot="end"
                        className="clore-poh-copy-button"
                        onClick={() => {
                          writeToClipboard(activeWallet.address);
                        }}
                      >
                        <IonIcon icon={copySharp} aria-hidden="true"></IonIcon>
                      </IonButton>
                    </IonInput>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={t('Message (Required)')}
                      labelPlacement="floating"
                      value={sendMemo}
                      onIonChange={(e: Event) =>
                        setSendMemo((e.target as HTMLInputElement).value)
                      }
                      placeholder="Enter text"
                    >
                      <IonButton
                        slot="end"
                        className="clore-poh-copy-button"
                        onClick={() => {
                          writeToClipboard(sendMemo);
                        }}
                      >
                        <IonIcon icon={copySharp} aria-hidden="true"></IonIcon>
                      </IonButton>
                    </IonInput>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={t('Signature')}
                      labelPlacement="floating"
                      value={signature}
                      onIonChange={(e: Event) =>
                        setSignature((e.target as HTMLInputElement).value)
                      }
                      readonly
                    >
                      <IonButton
                        slot="end"
                        className="clore-poh-copy-button"
                        onClick={() => {
                          writeToClipboard(signature);
                        }}
                      >
                        <IonIcon icon={copySharp} aria-hidden="true"></IonIcon>
                      </IonButton>
                    </IonInput>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>

            <div className="flex w-full justify-between ">
              {/* PoH Actions Grid */}
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
                        <span>{t('Sign')}</span>
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

export default PoH;
