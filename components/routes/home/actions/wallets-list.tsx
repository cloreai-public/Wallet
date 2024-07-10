'use client';
import { IonIcon, IonButton, IonActionSheet } from '@ionic/react';
import { use, useEffect, useState } from 'react';
import useCloreState from 'components/hooks/use-clore-state';
import { walletOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'components/constants/types';

interface IUid {
  uid: string;
}

const WalletList = (props: IUid) => {
  const { uid } = props;
  const { t } = useTranslation();
  const wallets = useCloreState.getState().wallets;
  const activeWallet = useCloreState.getState().activeWallet;

  const handleActiveWallet = (activeWallet: Wallet) => {
    useCloreState.getState().updateActiveWallet(activeWallet);
  };

  const displayWalletName = (name: string) => {
    if (name.length > 9) {
      return name.slice(0, 9).trim() + '...';
    } else return name;
  };

  return (
    <>
      <div className="w-full text-center">
        <IonButton className="clore-action-button-selector" id={uid}>
          <IonIcon icon={walletOutline} className="mr-1 text-lg min-w-7" />{' '}
          <b>{displayWalletName(activeWallet.name)}</b>
        </IonButton>
      </div>
      <IonActionSheet
        trigger={uid}
        className="clore-action-sheet"
        header={t('Wallets List')}
        subHeader={t('Select a wallet')}
        translucent
        animated
        mode="ios"
        buttons={[
          ...wallets.map((w: Wallet, index: number) => ({
            text: `${w.name} - ${w.balance} CLORE`,
            handler: () => {
              handleActiveWallet(w);
            },
            data: {
              action: 'select',
              address: w.address,
            },
          })),
          {
            text: t('Cancel'),
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ]}
      />
    </>
  );
};

export default WalletList;
