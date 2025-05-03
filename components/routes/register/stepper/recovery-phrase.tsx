'use client';
import {
  IonChip,
  IonIcon,
  IonButton,
  IonRippleEffect,
  IonTextarea,
} from '@ionic/react';
import { useToast } from 'components/router/toast-context';
import React, { useEffect, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { warning, documentsOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

interface IProps {
  recover: boolean;
  mnemonic: string[];
  setRecoverMnemonic: (recoverMnemonic: string[]) => void;
  handleNext: () => void;
}

function RecoveryPhrase(props: IProps) {
  const { t } = useTranslation();
  const { recover, mnemonic, setRecoverMnemonic, handleNext } = props;
  const { showToast } = useToast();
  const [providedMnemonic, setProvidedMnemonic] = useState('');

  // watching mnemonic to reset providedMnemonic
  useEffect(() => {
    setProvidedMnemonic('');
  }, [mnemonic]);

  const writeToClipboard = async () => {
    await Clipboard.write({
      string: mnemonic.join(' '),
    });
    showToast(
      t('Copied to clipboard'),
      t('Your recovery phrase has been copied to the clipboard.'),
      'success',
    );
  };

  const handleNextClick = async () => {
    if (!recover) handleNext();
    else if (recover) {
      const valid = await validateRecoverMnemonic();
      if (valid) {
        const m = providedMnemonic.split(' ');
        setRecoverMnemonic(m);
        handleNext();
      }
    } else {
      showToast(
        t('Invalid Mnemonic'),
        t('Please enter a valid mnemonic phrase'),
        'danger',
      );
    }
  };

  // FIXME: Clean this up
  const validateRecoverMnemonic = async () => {
    if (
      recover &&
      (!providedMnemonic ||
        (providedMnemonic.split(' ').length !== 12 &&
          providedMnemonic.split(' ')[0].length > 2))
    ) {
      showToast(
        t('Invalid Mnemonic'),
        t('Must be 12 words separated by spaces.'),
        'danger',
      );

      return false;
    } else {
      return true;
    }
  };

  return (
    <div className="w-full flex flex-col items-stretch justify-between">
      {recover ? (
        <div className="my-3">
          <IonTextarea
            mode="md"
            style={{ fontSize: '22px' }}
            className="px-[5px] mb-2"
            label={t('12-Word Mnemonic')}
            labelPlacement="floating"
            rows={4}
            fill="outline"
            placeholder="Enter 12-Word Mnemonic Phrase"
            onIonChange={(e: Event) => {
              setProvidedMnemonic((e.target as HTMLInputElement).value);
            }}
            value={providedMnemonic}
          />
        </div>
      ) : (
        <div
          className="mt-4"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        >
          {Array.from({ length: 12 }).map((_, j) => (
            <IonChip
              key={j}
              style={{
                flexBasis: 'calc(33% - 13px)',
                justifyContent: 'center',
                cursor: 'none',
              }}
            >
              {mnemonic[j]}
            </IonChip>
          ))}
        </div>
      )}

      {!recover && (
        <div className="flex justify-center items-center">
          <div
            className=" flex justify-center items-center my-4 text-[#ff3d3d] cursor-pointer hover:cursor-pointer hover:scale-110 transition active:scale-90"
            style={{ height: '5em' }}
            onClick={writeToClipboard}
          >
            <span className="text-lg  font-bold">{t('Copy to clipboard')}</span>
            <div className="flex justify-center items-center border-[#ff3d3d] text-base ml-2 ion-button hover:cursor-pointer hover:scale-110 transition active:scale-90">
              <IonIcon
                icon={documentsOutline}
                className="mr-1 text-lg min-w-7"
              />
              <IonRippleEffect className="opacity-50" />
            </div>
          </div>
        </div>
      )}

      <div className="text-gray-100 flex flex-col gap-1">
        <span className="text-[#ff3d3d] text-sm md:text-base font-bold flex items-start">
          <IonIcon icon={warning} className="mr-1 text-lg pt-[2px] min-w-7" />
          <span className="flex-shrink">
            {t('DO NOT share your recovery phrase with ANYONE.')}
          </span>
        </span>
        {/* <span className="my-1">
          {t('Please stay vigilant against phishing attacks at all times.')}
        </span> */}
      </div>
      <IonButton className="my-4" onClick={handleNextClick}>
        {t('Next')}
      </IonButton>
    </div>
  );
}

export default RecoveryPhrase;
