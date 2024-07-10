'use client';
import Image from 'next/image';
import { IonContent, useIonRouter } from '@ionic/react';
import LoadingGif from 'public/loading.gif';
import { EndPoints } from 'components/router/config';
import { useEffect } from 'react';

const LoadingScreen = () => {
  const router = useIonRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push(EndPoints.auth.dashboard);
    }, 3000);
  }, [router]);

  return (
    <IonContent fullscreen>
      <div className="flex justify-center items-center w-full h-full bg-[#030303]">
        <Image src={LoadingGif} alt="logotitle" priority width={400} />
      </div>
    </IonContent>
  );
};

export default LoadingScreen;
