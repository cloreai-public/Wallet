// electron-api.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      getStakingStatus: () => Promise<any>;
    };
  }
}
