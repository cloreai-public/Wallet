// secure storage
import { Storage } from '@ionic/storage';
import { Drivers } from '@ionic/storage';

const storage = new Storage({
  name: '__cloreai_storage',
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});

storage.create();

const setItem = async (key: string, value: any) => {
  await storage.set(key, value);
};

const getItem = async (key: string) => {
  return await storage.get(key);
};

const removeItem = async (key: string) => {
  await storage.remove(key);
};

export default {
  setItem,
  getItem,
  removeItem,
};
