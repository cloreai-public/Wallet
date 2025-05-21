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
import { EndPoints } from 'components/router/config';
import RecoveryPhrase from './recovery-phrase';
import VerifyPhrase from './verify-phrase';
import FinishAccount from './finish-account';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/keyboard';
import 'swiper/css/navigation';

// Clore Wallet Lug
import { createMnemonic } from 'components/hooks/use-clore-state';
import useCloreState from 'components/hooks/use-clore-state';
import { State, Wallet } from 'components/constants/types';

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

  const [currentView, setCurrentView] = useState(1);
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

  useEffect(() => {
    const unsubscribe = useCloreState.subscribe(
      (state: State) => state.wallets,
      (wallets: Wallet[]) => {
        if (wallets && wallets.length > 0) {
          router.push(EndPoints.auth.dashboard);
        }
      }
    );
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    switchView(currentView);
  }, [currentView]);

  const checkForRecovery = () => {
    try {
      if (currentView === 1 && location.search === '?recover=true') {
        setRecover(true);
      } else setRecover(false);
    } catch (e) {
      // console.log(e);
    }
  };

  const handleBack = () => {
    let newView = currentView - 1;
    if (newView < 1) router.push(EndPoints.register);
    else setCurrentView(newView);
  };

  const handleNext = () => {
    let newView = currentView + 1;
    if (newView < 3) setCurrentView(newView);
  };

  const switchView = (view: number) => {
    setCurrentView(view);
    if (view === 0) {
      checkForRecovery();
      setRecoverMnemonic([]);
      mnemonic = createMnemonic();
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 1:
        return (
          <RecoveryPhrase
            mnemonic={mnemonic}
            recover={recover}
            setRecoverMnemonic={setRecoverMnemonic}
            handleNext={handleNext}
          />
        );
      case 2:
        return (
          <VerifyPhrase
            mnemonic={mnemonic}
            recover={recover}
            recoverMnemonic={recoverMnemonic}
            handleNext={handleNext}
          />
        );
      case 3:
        return <FinishAccount />;
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
            {currentView === 1
              ? 'Verify Your Recovery Phrase'
              : 'Create New Wallet'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding w-full" scrollY={false}>
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
                  {t('Step')} {currentView}/2
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
              {renderView()}

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
