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
  useIonRouter, IonInput,
} from '@ionic/react';
import useCloreState from 'components/hooks/use-clore-state';
import { Wallet } from 'components/constants/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useStakingStatus } from 'components/hooks/use-staking-status';


const Pos = () => {
  const { t } = useTranslation();
  const activeWallet = useCloreState(
    (state: { activeWallet: Wallet }) => state.activeWallet,
  );
  const router = useIonRouter();
  const { status, loading } = useStakingStatus();
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('');

  const setContact = (contact: any) => {
    setAddress(contact.address);
    setAddressLabel(` (${contact.name})`);
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
              Staked: {status?.stakingbalance.toFixed(2)} CLORE
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
                        onClick={() => {
                          router.goBack();
                        }}
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
                        onClick={() => {
                          router.goBack();
                        }}
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
