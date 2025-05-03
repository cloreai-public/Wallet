'use client';
import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import { AuthProvider } from './auth-context';
import { ToastProvider } from './toast-context';
import Register from 'components/routes/register/register';
import CreateStep from 'components/routes/register/stepper/create-wallet';
import Dashboard from 'components/routes/home/dashboard';
import Contacts from 'components/routes/home/contacts-manager';
import History from 'components/routes/home/history';
import Send from 'components/routes/home/actions/send';
import PoH from 'components/routes/home/actions/poh';
import WalletManager from 'components/routes/home/wallet-manager';
import LoadingScreen from 'components/routes/loading-screen';
import { EndPoints } from './config';
import 'components/hooks/use-i18n';
import Pos from 'components/routes/home/pos';

setupIonicReact();

const AppShell = () => (
  <IonApp>
    <ToastProvider>
      <IonReactRouter>
        <AuthProvider>
          <Redirect from="/" to={EndPoints.register} />

          <IonRouterOutlet>
            {/* <Route path="/" component={LoadingScreen} /> */}

            <Route path="/dashboard" component={Dashboard} />
            <Route path="/contactsManager" component={Contacts} />
            <Route path="/history" component={History} />
            <Route path="/send" component={Send} />
            <Route path="/poh" component={PoH} />
            <Route path="/pos" component={Pos} />
            <Route path="/walletsManager" component={WalletManager} />
          </IonRouterOutlet>
          <Switch>
            {/* Only need auth to check if existing user */}
            <Route path="/create" component={CreateStep} />
            <Route path="/recover" component={CreateStep} />
            <Route path="/register" component={Register} />
          </Switch>
        </AuthProvider>
      </IonReactRouter>
    </ToastProvider>
  </IonApp>
);

export default AppShell;
