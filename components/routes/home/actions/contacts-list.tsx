'use client';
import { IonIcon, IonActionSheet, IonButton } from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import useCloreState from 'components/hooks/use-clore-state';
import { Contact } from 'components/constants/types';
import { useTranslation } from 'react-i18next';
interface IProps {
  returnContact: (contact: Contact) => void;
}

const ContactsList = (props: IProps) => {
  const { t } = useTranslation();
  let { returnContact } = props;
  const [contacts, setContacts] = useState(useCloreState.getState().contacts);

  useEffect(() => {
    const unsubscribeContacts = useCloreState.subscribe(
      (state: { contacts: Contact[] }) => state.contacts,
    );
    return () => {
      unsubscribeContacts();
    };
  }, [contacts]);

  return (
    <>
      <div className="w-full justify-end">
        <IonButton
          className="clore-action-button-selector"
          id="open-contacts-list"
        >
          <IonIcon icon={peopleOutline} className="mr-1 text-lg min-w-7" />{' '}
        </IonButton>
      </div>
      <IonActionSheet
        trigger="open-contacts-list"
        className="clore-action-sheet"
        header={t('Contacts List')}
        subHeader={t('Select a contact to send CLORE to')}
        translucent
        animated
        mode="ios"
        buttons={[
          ...contacts.map((c: Contact, index: number) => ({
            text: `${c.name} ${c.address}`,
            handler: () => {
              returnContact(c);
            },
            data: {
              action: 'select',
              address: c.address,
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

export default ContactsList;
