'use client';
import {
  IonCard,
  IonIcon,
  IonToast,
  IonTitle,
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonCardTitle,
  useIonRouter,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { chevronBackOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom, Keyboard } from 'swiper/modules';
import SwiperRef from 'swiper';
import { EndPoints } from 'components/router/config';
import RecoveryPhrase from './recovery-phrase';
import VerifyPhrase from './verify-phrase';
import FinishAccount from './finish-account';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/keyboard';

// Clore Wallet Lug
import { createMnemonic } from 'components/hooks/use-clore-state';
import useCloreState from 'components/hooks/use-clore-state';

let mnemonic = createMnemonic();

const CreateStep = () => {
  const { t } = useTranslation();
  const [recoverMnemonic, setRecoverMnemonic] = useState<string[]>([]);
  const [recover, setRecover] = useState<boolean>(false);

  const HeadingDatas = [
    { title: t('New Recovery Phrase') },
    {
      title: t('Wallet Created'),
      description: t('Store your recovery phrase in a safe & secure place'),
    },
  ];
  
  const [swiper, setSwiper] = useState<SwiperRef | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [heading, setHeading] = useState<{
    title?: string;
    description?: string;
  }>(HeadingDatas[0]);
  const router = useIonRouter();
  
  useEffect(() => {
    const wallets = useCloreState.getState().wallets;
    if (wallets && useCloreState.getState().wallets.length > 0) {
      router.push(EndPoints.auth.dashboard);
    }
    if (!mnemonic && !recover) {
      console.log('ERROR: Mnemonic not generated');
      router.push(EndPoints.register);
    }
    // initial check
    checkForRecovery();
  }, []);

  const location = useLocation();
  const checkForRecovery = () => {
    try {
      if (location.pathname === EndPoints.create.recover) {
        setRecover(true);
      } else setRecover(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleBack = () => {
    if (activeIndex) {
      if (swiper) swiper.slideTo(activeIndex - 1);
    } else {
      router.push(EndPoints.register);
    }
  };

  const handleNext = () => {
    if (swiper) swiper.slideTo(activeIndex + 1);
  };

  const onSlideChange = (s: SwiperRef) => {
    setHeading(HeadingDatas[activeIndex]);
    setActiveIndex(s.activeIndex);
    if(s.activeIndex === 0){
      // reset in case user goes back and chooses 
      // create new recovery phrase
      checkForRecovery();
      setRecoverMnemonic([]);
      mnemonic = createMnemonic();
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start" onClick={handleBack}>
            <IonIcon slot="end" icon={chevronBackOutline} size="medium" />
          </IonButtons>
          <IonTitle className="IonTitlex-0 text-[20px]">
            {activeIndex === 1
              ? 'Verify Your Recovery Phrase'
              : 'Create New Wallet'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding w-full">
        <div
          className="w-full "
          style={{
            textAlignLast: 'center',
            textAlign: '-webkit-center' as any,
          }}
        >
          <IonCard
            className="rounded-lg "
            style={{ maxWidth: '500px', justifySelf: 'center' }}
          >
            <IonCardHeader>
              <div>
                <IonCardSubtitle className="text-center">
                  {t('Step')} {activeIndex + 1}/3
                </IonCardSubtitle>
                <IonCardTitle className="text-[20px] text-center">
                  {heading.title}
                </IonCardTitle>
                <p className="mt-2 text-center normal-case">
                  &nbsp;&nbsp;
                  {heading.description}
                </p>
              </div>
            </IonCardHeader>
            <IonCardContent>
              <Swiper
                modules={[Keyboard, Zoom]}
                keyboard
                zoom={false}
                autoHeight={true}
                noSwiping
                allowTouchMove={false}
                onSwiper={s => {
                  setSwiper(s);
                }}
                onSlideChange={onSlideChange}
              >
                <SwiperSlide>
                  <RecoveryPhrase
                    mnemonic={mnemonic}
                    recover={recover}
                    setRecoverMnemonic={setRecoverMnemonic}
                    handleNext={handleNext}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <VerifyPhrase
                    mnemonic={mnemonic}
                    recover={recover}
                    recoverMnemonic={recoverMnemonic}
                    handleNext={handleNext}
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <FinishAccount />
                </SwiperSlide>
              </Swiper>

              <IonToast
                trigger="submit"
                message={t('Account was created successfully!')}
                duration={3000}
                color="success"
              />
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </>
  );
};

export default CreateStep;
