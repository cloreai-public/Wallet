'use client';
import { IonCol, IonRow, IonGrid, IonInput, IonButton, useIonLoading, IonAvatar, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonModal, IonTitle, IonLoading } from '@ionic/react';
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useToast } from 'components/router/toast-context';
import { createWallet } from 'components/hooks/use-clore-state';
import { useTranslation } from 'react-i18next';
import { Validation } from 'components/hooks/use-validation';
const v = new Validation();

interface IProps {
  handleNext: () => void;
  recover: boolean;
  recoverMnemonic: string[];
  mnemonic: string[];
}

type TState = {
  verifyWord1: string;
  verifyWord2: string;
  password: string;
  name: string;
  confirmPassword: string;
};

const defaultValues: TState = {
  verifyWord1: '',
  verifyWord2: '',
  name: '',
  password: '',
  confirmPassword: '',
};

function VerifyPhrase(props: IProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { mnemonic, recover, recoverMnemonic, handleNext } = props;
  const [loading, dismissLoading] = useIonLoading();

  const modal = useRef<HTMLIonModalElement>(null);
  const page = useRef(null);
  const [presentingElement, setPresentingElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPresentingElement(page.current);
  }, []);

  const SignUpSchema = Yup.object().shape({
    verifyWord1: Yup.string().required(t('Word is required')),
    verifyWord2: Yup.string().required(t('Word is required')),
    name: Yup.string().required(t('Name is required')),
    password: Yup.string()
      .required(t('Password is required'))
      .min(6, t('Password must be at least 6 characters')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('Passwords must match'))
      .required(t('Confirm Password is required')),
  });

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(SignUpSchema),
    defaultValues,
  });

  const {
    setValue,
    getValues,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = methods;

  const verifyingWords = useMemo(() => {
    // reset fields
    setValue('verifyWord1', '');
    setValue('verifyWord2', '');
    setValue('name', '');
    setValue('password', '');
    setValue('confirmPassword', '');

    // get two random numbers for word verification  
    const one = Math.floor(Math.random() * 12);
    const two = (() => {
      let r = Math.floor(Math.random() * 12);
      while (r === one) {
        r = Math.floor(Math.random() * 12);
      }
      return r;
    })();

    const result = [one,two].sort((a, b) => Math.abs(a) - Math.abs(b))
    return result;
  }, [recover, mnemonic, recoverMnemonic]);

  const handleDismissNotice = async () => {
    await loading({
      message: `Generating wallet, please wait...`,
      animated: true,
      backdropDismiss: false,
      spinner: 'lines-sharp-small',
      keyboardClose: false,
    })
    setTimeout(() => {
      handleCreateWallet();
    }, 2000);
  }

  const closeNoticeModal = async () => {
    await modal.current?.dismiss();
    await dismissLoading();
  }

  const handleCreateWallet = async () => {
    try {
      const finalMnemonic = recover ? recoverMnemonic : mnemonic;
      const verifyWordOne = finalMnemonic[verifyingWords[0]];
      const verifyWordTwo = finalMnemonic[verifyingWords[1]];

      if (getValues().verifyWord1 !== verifyWordOne) {
        await closeNoticeModal();
        setError('verifyWord1', { message: t('Invalid word') });
        return;
      }
      if (getValues().verifyWord2 !== verifyWordTwo) {
        await closeNoticeModal();
        setError('verifyWord2', { message: t('Invalid word') });
        return;
      }

      if (getValues().password === getValues().confirmPassword) {
        const { error, message } = v.isPassword(getValues().password);
        if (error) {
          await closeNoticeModal();
          setError('password', { message });
          return;
        }
        
        const wallet = await createWallet(
          getValues().name,
          finalMnemonic,
          getValues().confirmPassword,
        );
        
        await closeNoticeModal();
        if (wallet) {
          handleNext();
        } else {
          showToast('Error', t('Creating wallet failed'), 'danger');
          reset();
        }
      } else {
        await closeNoticeModal();
        setError('confirmPassword', { message: t('Password match error') });
        showToast('Error', t('Password Match Error'), 'danger');
        return;
      }
    } catch (error) {
      console.error(error);
      await closeNoticeModal();
      showToast('Panic Error', t('Creating wallet failed'), 'danger');
      reset();
    }
  };

  const showError = (_fieldName: string) => {
    const error = (errors as any)[_fieldName];
    return error ? (
      <div className="text-red-700 font-bold text-xs">
        {error.message || t('Field Is Required')}
      </div>
    ) : null;
  };

  useEffect(() => {
    reset();
    clearErrors();
  }, [clearErrors, reset]);

  return (
    <div className="flex flex-col items-stretch h-full">
      <IonGrid className="p-0 m-0">
        <IonRow>
          <IonCol className="px-0">
            <IonInput
              fill="outline"
              label={`#${verifyingWords[0] + 1}`}
              labelPlacement="stacked"
              value={getValues().verifyWord1}
              onIonInput={(e: Event) => 
                setValue('verifyWord1', (e.target as HTMLInputElement).value)
              }
              onIonChange={(e: Event) => {
                const currentMnemonic = recover ? recoverMnemonic : mnemonic;
                if(getValues().verifyWord1 !== currentMnemonic[verifyingWords[0]]) {
                  setError('verifyWord1', { message: t('Invalid word') });
                }else{
                  clearErrors('verifyWord1');
                }
               }
              }
            />
            {showError('verifyWord1')}
          </IonCol>
          <IonCol className="px-0 ml-4">
            <IonInput
              fill="outline"
              label={`#${verifyingWords[1] + 1}`}
              labelPlacement="stacked"
              value={getValues().verifyWord2}
              onIonInput={(e: Event) => 
                setValue('verifyWord2', (e.target as HTMLInputElement).value)
              }
              onIonChange={(e: Event) => {
                const currentMnemonic = recover ? recoverMnemonic : mnemonic;
                if(getValues().verifyWord2 !== currentMnemonic[verifyingWords[1]]) {
                  setError('verifyWord2', { message: t('Invalid word') });
                }else{
                  clearErrors('verifyWord2');
                }
               }
              }
            />
            {showError('verifyWord2')}
          </IonCol>
        </IonRow>
      </IonGrid>
      <div className="my-4">
        <IonInput
          fill="outline"
          label={t('Wallet Name')}
          labelPlacement="floating"
          placeholder="e.g. Trading, NFT Vault, Investment"
          value={getValues().name}
          onIonInput={(e: Event) => 
            setValue('name', (e.target as HTMLInputElement).value)
          }
          
        />
        {showError('name')}
      </div>
      <div>
        <IonInput
          fill="outline"
          label={t('Create Password')}
          labelPlacement="floating"
          placeholder="*************"
          value={getValues().password}
          onIonInput={(e: Event) => 
            setValue('password', (e.target as HTMLInputElement).value)
          }
          type="password"
        />
        {showError('password')}
      </div>
      <div className="my-4">
        <IonInput
          fill="outline"
          label={t('Confirm Password')}
          labelPlacement="floating"
          type="password"
          placeholder="*************"
          value={getValues().confirmPassword}
          onIonInput={(e: Event) => 
            setValue('confirmPassword', (e.target as HTMLInputElement).value)
          }
        />
        {showError('confirmPassword')}
      </div>
      <IonButton id="open-modal">{t('Next')}</IonButton>
      <IonModal ref={modal} trigger="open-modal" presentingElement={presentingElement!} className='notice-modal'>
        <IonContent style={{height: '200px'}} className='ion-padding'>
          <h2 className='ion-padding text-center'>
              Notice
          </h2>
          <IonList>
            <IonItem>
              <IonLabel>
                Generating the wallet may take several seconds. Please be patient.
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                Have you stored your recovery phrase in a safe place?
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                To reset your password, log out, then follow recover steps.
              </IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
        <div className="ion-padding" style={{display: 'grid'}}>
          <IonButton onClick={handleDismissNotice}>Proceed</IonButton>
        </div>
      </IonModal>
    </div>
  );
}

export default VerifyPhrase;
