import React, { useState, useRef, useEffect } from 'react';
import {
  IonModal,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  useIonLoading,
  IonCheckbox,
} from '@ionic/react';
import { verifyPassword } from 'components/hooks/use-crypto';
import useCloreState from 'components/hooks/use-clore-state';
import isBiometric, { getBiometric, verifyBiometric } from '../utils/biometric';
import { t } from 'i18next';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

const UnlockModal = (props: UnlockModalProps) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const { isOpen, onClose, onSubmit } = props;
  const [error, setError] = useState('');
  const [loading, dismissLoading] = useIonLoading();
  const [isAvailable, setAvailable] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);

  // check: Biometrics
  useEffect(() => {
    const checkIfAvailableBiometric = async () => {
      const res = await isBiometric();
      setAvailable(res);
    }
    checkIfAvailableBiometric();
  }, []);

  // check: Biometrics
  useEffect(() => {
    const checkBiometric = async () => {
      const verify = await verifyBiometric();
      if (!verify) {
        setUseBiometric(false);
        setError(t("You are failed in biometric verification!"))
      }
    }
    if (useBiometric) {
      checkBiometric();
    }
  }, [useBiometric])

  const checkPassword = async () => {
    await loading({
      message: 'Checking Password...',
      animated: true,
    });

    const password = useBiometric
      ? (await getBiometric()).password
      : input.current?.value
        ? String(input.current?.value)
        : '';
    if (!password) {
      setError('Correct Password Is Required');
      return;
    }
    const passSalt = useCloreState.getState().passSalt;
    const encryptedPassword = useCloreState.getState().encryptedPassword;
    const valid = await verifyPassword(password, passSalt, encryptedPassword);
    await dismissLoading();
    if (valid) {
      handleNext(password);
    } else setError('Incorrect Password');
  };
  const handleNext = (password: string) => {
    onSubmit(password);
    onClose();
  };

  return (
    <IonModal
      ref={modal}
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="unlock-modal"
    >
      <IonContent className="ion-padding" scrollY={false}>
        <div className="text-center w-full">
          <IonLabel className="pb-[3px] mb-2">Decrypt Mnemonic Phrase</IonLabel>
        </div>
        <div className="mt-3">
          {isAvailable && (
            <IonCheckbox
              mode="md"
              labelPlacement="end"
              checked={useBiometric}
              onIonChange={e => setUseBiometric(e.target.checked)}
            >
              {t('Use biometric verification')}
            </IonCheckbox>
          )}
          {useBiometric == false && (
            <IonInput
              mode="md"
              fill="outline"
              label="Password"
              labelPlacement="floating"
              ref={input}
              type="password"
              onIonInput={e => {
                if (error) setError('');
              }}
            />
          )}
          {error ? (
            <div className="text-red-700 font-bold text-xs pt-[3px] pr-[5px] float-right">
              {error || 'Correct Password Is Required'}
            </div>
          ) : null}
        </div>
      </IonContent>

      <div className="flex w-full justify-between p-5">
        <IonButton
          className="w-full footer-button"
          onClick={() => modal.current?.dismiss()}
        >
          Go Back
        </IonButton>

        <IonButton
          slot="end"
          className="w-full footer-button"
          strong={true}
          onClick={() => checkPassword()}
        >
          Unlock
        </IonButton>
      </div>
    </IonModal>
  );
};

export default UnlockModal;
