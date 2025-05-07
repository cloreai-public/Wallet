'use client';
import {
  IonPage,
  IonContent,
  IonCard,
  IonItem,
  IonLabel,
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
  IonText,
  IonNote,
  IonButton,
  useIonRouter,
  IonInput,
} from '@ionic/react';
import useCloreState from 'components/hooks/use-clore-state';
import { Wallet } from 'components/constants/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useStakingStatus } from 'components/hooks/use-staking-status';
import { useToast } from 'components/router/toast-context';

const Pos = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const activeWallet = useCloreState(
    (state: { activeWallet: Wallet }) => state.activeWallet,
  );
  const router = useIonRouter();
  const { status, loading } = useStakingStatus();
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [coldStakingBalance, setColdStakingBalance] = useState<number>(0);

  const setContact = (contact: any) => {
    setAddress(contact.address);
    setAddressLabel(` (${contact.name})`);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const accountAddress = await (window as any).electronAPI.getAccountAddress(["myaccount"]);
        const myBalance = status?.utxos
          ?.filter((utxo: any) => utxo['cold-staker'] === accountAddress)
          ?.reduce((total: number, utxo: any) => total + parseFloat(utxo.amount), 0) || 0;
        console.log(`Cold staking balance for ${accountAddress}: ${myBalance}`);
        setColdStakingBalance(myBalance);
      } catch (err) {
        console.error('Error fetching cold staking balance:', err);
        setColdStakingBalance(0);
      }
    };
  
    if (status) fetchBalance();
  }, [status]);
  
  const handleDelegateStake = async (flag: number) => {
    setError('');

    if (amount <= 0) {
      showToast('Error', t('amount is required'), 'danger');
      return;
    }

    try {
      const accountAddress = await (window as any).electronAPI.getAccountAddress(["myaccount"]);
      const ownerAddress = await (window as any).electronAPI.getAccountAddress([""]);
      console.log('accountAddress', accountAddress);
      console.log('ownerAddress', ownerAddress);

      if (flag == 1) {
        const params = [accountAddress, amount];
        const result = await (window as any).electronAPI.delegateStake(params);

        if (result?.error) {
          showToast('Error', t('Delegation failed'), 'danger');
          return;
        }
        console.log('result', result);

        // Show success toast
        showToast(
          'Signature',
          `${t('Delegation successful')}\nTXID: ${result.txid}`,
          'success',
        );
      } else {
        const result = await (window as any).electronAPI.sendToAddress([
          ownerAddress,
          amount,
        ]);

        if (result?.error) {
          showToast(
            'Error',
            t('Unstaking failed') + `: ${result.error.message || result.error}`,
            'danger',
          );
          return;
        }

        console.log('Unstaking result:', result);
        showToast(
          'Success',
          `${t('Unstaking successful')}\nTXID: ${result}`,
          'success',
        );
      }

      // Optionally clear input
      setAmount(0);
    } catch (err) {
      showToast('Error', t('An unexpected error occurred'), 'danger');
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen scrollY={false}>
        <div className="flex items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card max-h-[30rem]">
            <div className="flex justify-center items-center w-full">
              <IonLabel className="text-2xl text-center py-[15px]">
                {t('POS / Staking')}
              </IonLabel>
            </div>
            <IonText className="text-lg ">
              Staked: {coldStakingBalance} CLORE
            </IonText>
            <div className="my-1 pt-[0px] w-full">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={t('Amount')}
                      labelPlacement="floating"
                      type="number"
                      value={amount}
                      onIonChange={(e: Event) =>
                        setAmount(Number((e.target as HTMLInputElement).value))
                      }
                    />
                    {error ? (
                      <div className="text-[#ff3d3d] font-bold text-xs">
                        {error || t('Amount Is Required')}
                      </div>
                    ) : null}
                  </IonCol>
                  <IonCol size="auto">
                    <div className="w-full justify-end">
                      <IonButton>{t('MAX')}</IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="flex w-full justify-between ">
              {/* Send Actions Grid */}
              <IonGrid className="m-[0px] pt-[0px]">
                <IonRow>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        className="w-full footer-button"
                        onClick={() => handleDelegateStake(1)}
                      >
                        <span>{t('Staking')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        className="w-full footer-button"
                        onClick={() => handleDelegateStake(0)}
                      >
                        <span>{t('UnStaking')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol className="ion-padding-vertical">
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={`${t('Address')} ${addressLabel}`}
                      labelPlacement="floating"
                      type="text"
                      value={address}
                      onIonChange={(e: Event) => {
                        setAddressLabel('');
                        setAddress((e.target as HTMLInputElement).value);
                      }}
                    />
                    {error ? (
                      <div className="text-[#ff3d3d] font-bold text-xs">
                        {error || t('Address Is Required')}
                      </div>
                    ) : null}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="flex w-full justify-between ">
              {/* History Actions Grid */}
              <IonGrid className="m-[0px] pt-[0px]">
                <IonRow className="justify-center">
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full ion-margin-vertical">
                      <IonButton
                        className="w-full footer-button"
                        onClick={() => {
                          router.goBack();
                        }}
                      >
                        <span>{t('Go Back')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full ion-margin-vertical">
                      <IonButton
                        className="w-full footer-button"
                        onClick={() => {
                          router.goBack();
                        }}
                      >
                        <span>{t('Delegate Staking')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Pos;
