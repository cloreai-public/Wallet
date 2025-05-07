// electron-api.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      listColdUtxos: () => Promise<any>;
    };
  }
}
