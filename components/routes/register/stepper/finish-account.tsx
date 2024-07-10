'use client';
import { IonButton, useIonRouter } from '@ionic/react';
import React from 'react';
import Image from 'next/image';
import LogoSvg from 'public/logo.svg';
import { EndPoints } from 'components/router/config';
import { useTranslation } from 'react-i18next';

function FinishAccount() {
  const { t } = useTranslation();
  const router = useIonRouter();
  const handleFinish = () => {
    router.push(EndPoints.auth.dashboard);
  };

  return (
    <div className="flex flex-col py-1">
      <div className="flex flex-col justify-center items-center">
        <Image src={LogoSvg} alt="cosmos" sizes="190" className="my-12" />
        <h1>{t('Welcome Clore Network')}</h1>
      </div>
      <IonButton onClick={handleFinish} id="submit" className="my-4">
        {t('Finish')}
      </IonButton>
    </div>
  );
}

export default FinishAccount;
