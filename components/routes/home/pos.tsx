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
  useIonLoading,
} from '@ionic/react';
import useCloreState, { buildUnstakeTransaction, getUnspentStakes } from 'components/hooks/use-clore-state';
import { Wallet } from 'components/constants/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Blockbook } from 'components/hooks/use-blockbook-explorer';
import { useToast } from 'components/router/toast-context';
import { buildStakeTransaction } from 'components/hooks/use-clore-state';
import { Validation } from 'components/hooks/use-validation';
import { EndPoints } from 'components/router/config';
import UnlockModal from 'components/routes/home/unlock-modal';
const v = new Validation();

const Pos = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const activeWallet = useCloreState(
    (state: { activeWallet: Wallet }) => state.activeWallet,
  );

  const currentNetwork = useCloreState.getState().network as 'mainnet' | 'testnet';
  const wallets = useCloreState.getState().wallets;
  const router = useIonRouter();
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [address, setAddress] = useState('');
  const [loading, dismissLoading] = useIonLoading();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [coldStakingBalance, setColdStakingBalance] = useState<number>(0);
  const [modalAction, setModalAction] = useState<'stake' | 'unstake'>('stake');


  const setContact = (contact: any) => {
    setAddress(contact.address);
    setAddressLabel(` (${contact.name})`);
  };

  const isColdStakingScript = (hex: string) => {
    // Match Clore cold staking script pattern:
    // OP_DUP (76), OP_HASH160 (a9), OP_ROT (7b), OP_IF (63), OP_CHECKCOLDSTAKEVERIFY (d2)
    return hex.startsWith('76a97b63d2');
  };

  

  const fetchColdStakingBalance = async (ownerAddress: string) => {
    try {
      const utxos = await window.electronAPI.listColdUtxos();
      console.log('utxos', utxos);
      let total = 0;
  
      for (const utxo of utxos) {
        // Only add if the coin-owner matches the ownerAddress
        console.log('utxo coin-owner', utxo['coin-owner']);
        if (utxo['coin-owner'] === ownerAddress) {
          total += parseFloat(utxo.amount); // amount is already in CLORE
        }
      }
  
      setColdStakingBalance(total);
    } catch (err) {
      console.error('Failed to fetch cold staking balance:', err);
      showToast(t('Failed to fetch staking balance'), '', 'danger');
    }
  };

  useEffect(() => {
    const ownerAddr = wallets[0].addresses[currentNetwork];
    setAddress(ownerAddr);
    fetchColdStakingBalance(ownerAddr);
    console.log('wallets', ownerAddr);
  },[]);

  const handleOpenModal = (action: 'stake' | 'unstake') => {
    const { error: addressError, message: addressMessage } = v.isAddress(address, currentNetwork);
    if (addressError) {
      setError(addressMessage);
      console.log('message', address, addressMessage);
      return;
    }
  
    if (action === 'stake' && (!amount || isNaN(Number(amount)) || Number(amount) <= 0)) {
      setAmountError(t('Invalid Amount'));
      return;
    }
  
    setModalAction(action);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleSendStakeTransaction = async (password: string) => {
    try {
      const { error: ownerError, message: ownerMessage } = v.isAddress(address, currentNetwork);
      if (ownerError) {
        setError(ownerMessage);
        return;
      }
  
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError(t('Invalid staking amount'));
        return;
      }
  
      await loading({
        message: t('Waiting for CLORE Blockchain'),
        animated: true,
      });
  
      // Build cold staking transaction
      const hex = await buildStakeTransaction(password, amount, address, "JDZgBVuFmtgc7VJQ4JpQrQBHq9ox9crJXa");
      // const hex = await buildStakeTransaction(password, amount, address, address);
      console.log('hex ', hex);
      if (!hex) {
        await dismissLoading();
        showToast(t('Transaction creation failed'), '', 'danger');
        return;
      }
  
      // Send transaction
      const response = await new Blockbook().sendTransaction(hex);
      await dismissLoading();
  
      if (response.error) {
        setError(t('Transaction Failed'));
        return;
      }
  
      showToast(t('Stake Transaction Complete'), `${response.result}`, 'success');
      await fetchColdStakingBalance(address);
      router.push(EndPoints.auth.pos);
    } catch (error: any) {
      await dismissLoading();
      const errMsg = error?.message || t('Unknown transaction error');
      showToast(t('Stake Failed'), errMsg, 'danger'); 
      setError(t('Unexpected error occurred'));
    }
  };

  const handleSendUnStakeTransaction = async (password: string) => {
    try {
      const { error: ownerError, message: ownerMessage } = v.isAddress(address, currentNetwork);
      if (ownerError) {
        setError(ownerMessage);
        return;
      }
  
      await loading({
        message: t('Waiting for CLORE Blockchain'),
        animated: true,
      });
  
      // Build cold staking transaction
      const hex = await buildUnstakeTransaction(password, address, "JDZgBVuFmtgc7VJQ4JpQrQBHq9ox9crJXa");
      // const hex = await buildUnstakeTransaction(password, address, address);
      console.log('hex ', hex);
      if (!hex) {
        await dismissLoading();
        showToast(t('Transaction creation failed'), '', 'danger');
        return;
      }
  
      // Send transaction
      const response = await new Blockbook().sendTransaction(hex);
      await dismissLoading();
  
      if (response.error) {
        setError(t('Transaction Failed'));
        return;
      }
  
      showToast(t('UnStake Transaction Complete'), `${response.result}`, 'success');
      await fetchColdStakingBalance(address);
      router.push(EndPoints.auth.pos);
    } catch (error: any) {
      await dismissLoading();
      const errMsg = error?.message || t('Unknown transaction error');
      showToast(t('UnStake Failed'), errMsg, 'danger'); 
      setError(t('Unexpected error occurred'));
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
                    {amountError ? (
                      <div className="text-[#ff3d3d] font-bold text-xs">
                        {amountError}
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
                    <UnlockModal
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                      onSubmit={modalAction === 'stake' ? handleSendStakeTransaction : handleSendUnStakeTransaction}
                    />
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        onClick={() => handleOpenModal('stake')}
                        className="w-full footer-button"
                      >
                        <span>{t('Stake')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        className="w-full footer-button"
                        onClick={() => handleOpenModal('unstake')}
                      >
                        <span>{t('UnStake All')}</span>
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  {/* <IonCol className="ion-padding-vertical">
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
                  </IonCol> */}
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
                  {/* <IonCol size="6">
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
                  </IonCol> */}
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
