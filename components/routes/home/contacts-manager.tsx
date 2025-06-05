'use client';
import {
  IonPage,
  IonContent,
  IonCard,
  IonItem,
  IonList,
  IonGrid,
  IonCol,
  IonRow,
  IonText,
  IonButton,
  useIonRouter,
  IonInput,
  IonRippleEffect,
  IonLabel,
} from '@ionic/react';
import useCloreState, { addContact } from 'components/hooks/use-clore-state';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Contact } from 'components/constants/types';
import { Validation } from 'components/hooks/use-validation';
const v = new Validation();

const ContactsManager = () => {
  const { t } = useTranslation();
  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contacts, setContacts] = useState(useCloreState.getState().contacts);
  const currentNetwork = useCloreState.getState().network as 'mainnet' | 'testnet';


  const router = useIonRouter();

  const addNewContact = async () => {
    
    const { error, message } = v.isAddress(address, currentNetwork);
    if (error) {
      setAddressError(message);
      return;
    }  
    
    if (name.length > 0) {
      addContact(name, address, currentNetwork);
      setName('');
      setAddress('');
    } else setNameError(t('Contact Name and Address Are Required'));
  };

  console.log('contacts', contacts);

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen scrollY={false}>
        <div className="flex items-center justify-center h-full backdrop-blur-sm dashboard-page">
          <IonCard className="clore-card max-h-[40rem]">
            <div className="flex justify-center items-center w-full">
              <IonLabel className="text-2xl text-center py-[15px]">
                {t('Contacts Manager')}
              </IonLabel>
            </div>
            <IonList className="w-full h-[25rem]" lines="inset">
              <IonContent className="ion-padding" fullscreen scrollY={true}>
                <IonItem className="px-[5px] pt-[5px]">
                  <IonGrid>
                    <IonRow>
                      <IonCol size="4">
                        <IonText className="text-center">{t('Name')}</IonText>
                      </IonCol>
                      <IonCol size="8">
                        <IonText>{t('Address')}</IonText>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
                {...contacts.filter((c: Contact) => c.network === currentNetwork).map((c: Contact, index: number) => (
                  <IonItem key={index} className="px-[5px] pt-[5px]">
                    <IonGrid>
                      <IonRow>
                        <IonCol size="3" className="ion-padding-vertical">
                          <IonText
                            style={{ fontSize: '0.85rem' }}
                            className="text-center"
                          >
                            {c.name}
                          </IonText>
                        </IonCol>
                        <IonCol size="9" className="ion-padding-vertical">
                          <IonText style={{ fontSize: '0.85rem' }}>
                            {c.address}
                          </IonText>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonItem>
                ))}
              </IonContent>
            </IonList>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={t('Contact Name')}
                      labelPlacement="floating"
                      type="text"
                      value={name}
                      onIonChange={(e: Event) => {
                        setName((e.target as HTMLInputElement).value);
                      }}
                      onIonInput={(e: Event) => {
                        setNameError('');
                      }}
                    />
                    {nameError ? (
                      <div className="text-[#ff3d3d] font-bold text-xs">
                        {nameError || 'Contact Name Is Required'}
                      </div>
                    ) : null}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="my-1 w-full">
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      mode="md"
                      fill="outline"
                      label={t('Contact Address')}
                      labelPlacement="floating"
                      type="text"
                      value={address}
                      onIonChange={(e: Event) => {
                        setAddress((e.target as HTMLInputElement).value);
                      }}
                      onIonInput={(e: Event) => {
                        setAddressError('');
                      }}
                    />
                    {addressError ? (
                      <div className="text-[#ff3d3d] font-bold text-xs">
                        {addressError || 'Address Is Required'}
                      </div>
                    ) : null}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div className="flex w-full justify-between ">
              {/* Contacts Actions Grid */}
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
                        <span>{t('Go Back')}</span>
                      </IonButton>
                      <IonRippleEffect className="opacity-50" />
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className="ion-activatable btn w-full">
                      <IonButton
                        id="popover-button"
                        onClick={addNewContact}
                        className="w-full footer-button"
                      >
                        <span>{t('Add Contact')}</span>
                      </IonButton>
                      <IonRippleEffect className="opacity-50" />
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

export default ContactsManager;
