"use client";

import React, { useEffect } from 'react';
import Head from 'next/head';
import isElectron from 'is-electron';

const web_title = 'Clore Web Wallet',
      app_title = 'Clore Wallet'

const DynamicTitle = () => {
    useEffect(() => {
        const title = isElectron() ? app_title : web_title;
        document.title = title;
    }, []);

    return (
        <Head>
            <title>{isElectron() ? app_title : web_title}</title>
        </Head>
    );
};

export default DynamicTitle;