'use client';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useIonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';

// Define the shape of the context's data
interface ToastContextState {
  showToast: (header: string, message: string, color: string) => void;
}

// Create the context
const ToastContext = createContext<ToastContextState | undefined>(undefined);

// Provider component that encapsulates the toast logic
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [present, dismiss] = useIonToast();
  const [toast, setToast] = useState({
    header: '',
    message: '',
    color: '',
  });

  // Function to trigger the toast update
  const showToast = useCallback(
    (header: string, message: string, color: string) => {
      setToast({ header, message, color });
    },
    [],
  );

  // Effect to display the toast whenever the toast state updates
  useEffect(() => {
    if (toast.header && toast.message) {
      present({
        header: toast.header,
        message: toast.message,
        color: toast.color,
        duration: 3000,
        position: 'bottom',
        mode: 'ios',
        animated: true,
        translucent: true,
        // positionAnchor: 'clore-app-header',
        // buttons: toast.buttons ? toast.buttons : [],
      });
    }
  }, [toast, present]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use the toast context
export const useToast = () => {
  const { t } = useTranslation();
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(`${t('useToast must be used within a ToastProvider')}`);
  }
  return context;
};
