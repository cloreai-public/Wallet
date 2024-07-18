import React, { useState, useRef } from 'react';
import {
  IonModal,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonTitle,
  useIonLoading,
} from '@ionic/react';
import { verifyPassword } from 'components/hooks/use-crypto';
import useCloreState from 'components/hooks/use-clore-state';

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

  const checkPassword = async () => {
    await loading({
      message: 'Checking Password...',
      animated: true,
    });

    const password = input.current?.value ? String(input.current?.value) : '';
    if (!password) setError('Correct Password Is Required');
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
      <IonContent className="ion-padding">
        <IonTitle className="pb-[3px] text-center">
          Decrypt Mnemonic Phrase
        </IonTitle>
        <IonItem>
          <IonInput
            mode="md"
            label="Password"
            labelPlacement="stacked"
            ref={input}
            type="password"
            placeholder="*************"
            onIonInput={e => {
              if (error) setError('');
            }}
          />
        </IonItem>
        {error ? (
          <div className="text-red-700 font-bold text-xs pt-[3px] pr-[5px] float-right">
            {error || 'Correct Password Is Required'}
          </div>
        ) : null}
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
