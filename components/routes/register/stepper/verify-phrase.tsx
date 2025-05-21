'use client';
import {
  IonCol,
  IonRow,
  IonGrid,
  IonInput,
  IonButton,
  useIonLoading,
  IonContent,
  IonText,
  IonModal,
  IonCheckbox,
  useIonRouter,
} from '@ionic/react';
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useToast } from 'components/router/toast-context';
import { createWallet } from 'components/hooks/use-clore-state';
import { useTranslation } from 'react-i18next';
import { Validation } from 'components/hooks/use-validation';
import isBiometric, {
  generatePassword,
  saveBiometric,
  verifyBiometric,
} from '../../utils/biometric';
import { EndPoints } from 'components/router/config';
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
};

const defaultValues: TState = {
  verifyWord1: '',
  verifyWord2: '',
  name: '',
  password: '',
};

function VerifyPhrase(props: IProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useIonRouter();
  const { mnemonic, recover, recoverMnemonic, handleNext } = props;
  const [loading, dismissLoading] = useIonLoading();
  const [showPass, setShowPass] = useState(true);

  const modal = useRef<HTMLIonModalElement>(null);
  const page = useRef(null);
  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);
  const [isAvailable, setAvailable] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  // const [proceedIsDisabled, setProceedIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPresentingElement(page.current);
    // check Biometrics
    const checkIfAvailableBiometric = async () => {
      const res = await isBiometric();
      setAvailable(res);
    };
    checkIfAvailableBiometric();
  }, []);

  // check Biometrics
  useEffect(() => {
    const checkBiometric = async () => {
      const verify = await verifyBiometric();
      if (!verify) {
        setUseBiometric(false);
        showToast(
          t('Biometric verification'),
          t('You are failed in biometric verification!'),
          'danger',
        );
      }
    };
    if (useBiometric) {
      checkBiometric();
    }
  }, [useBiometric]);

  const SignUpSchema = Yup.object().shape({
    verifyWord1: Yup.string().required(t('Word is required')),
    verifyWord2: Yup.string().required(t('Word is required')),
    name: Yup.string().required(t('Name is required')),
    password: Yup.string()
      .required(t('Password is required'))
      .min(6, t('Password must be at least 6 characters')),
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

    // get two random numbers for word verification
    const one = Math.floor(Math.random() * 12);
    const two = (() => {
      let r = Math.floor(Math.random() * 12);
      while (r === one) {
        r = Math.floor(Math.random() * 12);
      }
      return r;
    })();

    const result = [one, two].sort((a, b) => Math.abs(a) - Math.abs(b));
    return result;
  }, [recover, mnemonic, recoverMnemonic]);

  // const closeNoticeModal = async () => {
  //   await modal.current?.dismiss();
  // };

  // const openNoticeModal = async () => {
  //   await modal.current?.present();
  // };

  const inputError = async (fieldName: string, message: string) => {
    // await closeNoticeModal();
    setError(fieldName, { message });
  };

  const checkInputs = async () => {
    let { error, message } = { error: false, message: '' };

    const finalMnemonic = recover ? recoverMnemonic : mnemonic;
    const verifyWordOne = finalMnemonic[verifyingWords[0]];
    const verifyWordTwo = finalMnemonic[verifyingWords[1]];

    if (getValues().verifyWord1 !== verifyWordOne) {
      await inputError('verifyWord1', t('Invalid word'));
      return false;
    }

    if (getValues().verifyWord2 !== verifyWordTwo) {
      await inputError('verifyWord2', t('Invalid word'));
      return false;
    }

    ({ error, message } = v.isName(getValues().name));
    if (error) {
      await inputError('name', message);
      return false;
    }

    let password = '';
    if (isAvailable && useBiometric) {
      password = generatePassword();
      saveBiometric(getValues().name, password);
    } else {
      password = getValues().password;
      ({ error, message } = v.isPassword(getValues().password));
      if (error) {
        await inputError('password', message);
        return false;
      }
    }

    return true;
  };

  const handleCreateWallet = async () => {
    // setProceedIsDisabled(true);
    if (isSubmitting) return;
    setIsSubmitting(true);
    const isValid = await checkInputs();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    await loading({
      message: `Generating wallet, please wait...`,
      animated: true,
      backdropDismiss: false,
      spinner: 'lines-sharp-small',
      keyboardClose: false,
    });

    setTimeout(async () => {
      try {
        const wallet = await createWallet(
          getValues().name,
          recover ? recoverMnemonic : mnemonic,
          getValues().password,
        );
        await dismissLoading();
        router.push(EndPoints.auth.dashboard);
      } catch (err) {
        await dismissLoading();
        showToast('Error', 'Failed to create wallet', 'danger');
        console.error('Wallet creation error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const showError = (_fieldName: string) => {
    const error = (errors as any)[_fieldName];
    return error ? (
      <div className="text-[#ff3d3d] font-bold text-xs">
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
              required
              mode="md"
              fill="outline"
              label={`#${verifyingWords[0] + 1}`}
              labelPlacement="stacked"
              value={getValues().verifyWord1}
              onIonInput={(e: Event) =>
                setValue('verifyWord1', (e.target as HTMLInputElement).value)
              }
              onIonChange={(e: Event) => {
                const currentMnemonic = recover ? recoverMnemonic : mnemonic;
                if (
                  getValues().verifyWord1 !== currentMnemonic[verifyingWords[0]]
                ) {
                  setError('verifyWord1', { message: t('Invalid word') });
                } else {
                  clearErrors('verifyWord1');
                }
              }}
            />
            {showError('verifyWord1')}
          </IonCol>
          <IonCol className="px-0 ml-4">
            <IonInput
              required
              mode="md"
              fill="outline"
              label={`#${verifyingWords[1] + 1}`}
              labelPlacement="stacked"
              value={getValues().verifyWord2}
              onIonInput={(e: Event) =>
                setValue('verifyWord2', (e.target as HTMLInputElement).value)
              }
              onIonChange={(e: Event) => {
                const currentMnemonic = recover ? recoverMnemonic : mnemonic;
                if (
                  getValues().verifyWord2 !== currentMnemonic[verifyingWords[1]]
                ) {
                  setError('verifyWord2', { message: t('Invalid word') });
                } else {
                  clearErrors('verifyWord2');
                }
              }}
            />
            {showError('verifyWord2')}
          </IonCol>
        </IonRow>
      </IonGrid>
      <div className="my-4">
        <IonInput
          required
          mode="md"
          fill="outline"
          label={t('Wallet Name')}
          labelPlacement="floating"
          placeholder="e.g. Trading, NFT Vault, Investment"
          value={getValues().name}
          onIonInput={(e: Event) =>
            setValue('name', (e.target as HTMLInputElement).value)
          }
          onIonChange={(e: Event) => {
            clearErrors('name');
          }}
        />
        {showError('name')}
      </div>

      <div className="my-2">
        <h2>Minimum Password Requirements</h2>
        <p>
          <div className="my-2">A password is used to encrypt your wallet </div>
          <div>2 uppercase, 2 lowercase, 2 numbers, </div>
          <div>2 symbols , and 10+ characters long</div>
        </p>
      </div>

      {isAvailable ? (
        <div>
          <IonCheckbox
            mode="md"
            labelPlacement="end"
            checked={useBiometric}
            onIonChange={e => setUseBiometric(e.target.checked)}
          >
            {t('Use biometric verification')}
          </IonCheckbox>
        </div>
      ) : (
        <div className="mb-4">
          <IonInput
            mode="md"
            fill="outline"
            label="Password"
            labelPlacement="floating"
            value={getValues().password}
            onIonInput={(e: Event) =>
              setValue('password', (e.target as HTMLInputElement).value)
            }
            type={'password'}
          />
          {showError('password')}
        </div>
      )}

      <IonButton onClick={handleCreateWallet}>{t('Next')}</IonButton>
      {/* <IonModal
        ref={modal}
        trigger="open-modal"
        presentingElement={presentingElement!}
        className="notice-modal"
      >
        <IonContent style={{ height: '200px' }} className="ion-padding">
          <h2 className="ion-padding text-center text-xl">Notice</h2>
          <div className="my-1">
            <IonText className="text-lg">
              Generating the wallet may take several seconds. Please be patient.
            </IonText>
          </div>
          <div className="my-2">
            <IonText className="text-lg">
              Have you stored your recovery phrase in a safe place?
            </IonText>
          </div>
          <div className="my-1">
            <IonText className="text-lg">
              To reset your password, log out, then follow recover steps.
            </IonText>
          </div>
        </IonContent>
        <div className="ion-padding" style={{ display: 'grid' }}>
          <IonButton onClick={handleCreateWallet} disabled={proceedIsDisabled}>
            Proceed
          </IonButton>
        </div>
      </IonModal> */}
    </div>
  );
}

export default VerifyPhrase;
