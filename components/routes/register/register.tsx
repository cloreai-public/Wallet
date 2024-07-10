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
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-[20px]">Clore {t('Wallet')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="max-w-[1500px]">
        <div className="h-full flex flex-col justify-center items-center bg-ani bg-bottom bg-no-repeat bg-contain">
          <IonCard className="p-2 rounded-lg">
            <IonCardHeader>
              <IonCardTitle className="text-lg">{t('Welcome')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="flex flex-col">
              <p>{t('Create a new wallet or Recovery an existing wallet')}</p>
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
              <IonNavLink
                routerDirection="forward"
                onClick={() => {
                  router.push(EndPoints.create.recover);
                }}
                className="w-full"
              >
                <div className="ion-activatable btn  border">
                  {t('Recover an existing wallet')}
                  <IonRippleEffect className="opacity-50" />
                </div>
              </IonNavLink>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </>
  );
};

export default CreateMethod;
