'use client';
import {
  IonCard,
  IonTitle,
  IonHeader,
  IonContent,
  IonNavLink,
  IonToolbar,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonRippleEffect,
  useIonRouter,
  IonButton,
} from '@ionic/react';
import { EndPoints } from 'components/router/config';
import { useTranslation } from 'react-i18next';

const CreateMethod = () => {
  const { t } = useTranslation();
  const router = useIonRouter();

  return (
    <>
      <IonHeader
        style={{ position: 'fixed', top: 0, width: '100%', zIndex: 10000 }}
      >
        <IonToolbar>
          <IonTitle className="text-[20px]">Clore {t('Wallet')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="max-w-[1500px]">
        <div className="h-full flex flex-col justify-center items-center bg-ani bg-bottom bg-no-repeat bg-contain">
          <IonCard className="p-2 rounded-lg welcome-card">
            <IonCardHeader>
              <IonCardTitle className="text-lg">{t('Welcome')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="flex flex-col">
              <IonButton
                routerDirection="forward"
                onClick={() => {
                  router.push(EndPoints.create.new);
                }}
                className="w-full my-4"
                style={{ fontSize: '18px' }}
              >
                {t('Create a new wallet')}
                <IonRippleEffect className="opacity-50" />
              </IonButton>
              <IonButton
                routerDirection="forward"
                onClick={() => {
                  router.push(EndPoints.create.new + '?recover=true');
                }}
                className="w-full my-4"
                style={{ fontSize: '18px' }}
              >
                {t('Recover a wallet')}
                <IonRippleEffect className="opacity-50" />
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </>
  );
};

export default CreateMethod;
