
import { Receipt, Priest, ReceiptStatus } from '../types';

const RECEIPTS_KEY = 'KOVIL_APP_RECEIPTS';
const PRIESTS_KEY = 'KOVIL_APP_PRIESTS';

// --- Initial Seed Data ---
const getInitialReceipts = (): Receipt[] => [
  {
    id: 'rec_init_1',
    receiptNumber: 'REC-15815',
    devoteeName: 'Nagaraj V',
    offeringDate: '2025-11-07',
    items: [{ id: 'item_init_1', description: 'பொது நன்கொடை', amount: 100 }],
    status: ReceiptStatus.Completed,
    mobileNumber: '9047770721',
    poojaType: 'பொது நன்கொடை',
  },
  {
    id: 'rec_init_2',
    receiptNumber: 'REC-88622',
    devoteeName: 'Sivakumar P',
    offeringDate: '2025-11-08',
    items: [{ id: 'item_init_2', description: 'அர்ச்சனை', amount: 50 }],
    status: ReceiptStatus.Completed,
    mobileNumber: '9876543210',
    poojaType: 'அர்ச்சனை',
  },
  {
    id: 'rec_init_3',
    receiptNumber: 'REC-45920',
    devoteeName: 'Velu S',
    offeringDate: '2025-11-09',
    items: [{ id: 'item_init_3', description: 'அன்னதானம் நன்கொடை', amount: 501 }],
    status: ReceiptStatus.Scheduled,
    mobileNumber: '9988776655',
    poojaType: 'அன்னதானம் நன்கொடை',
  }
];

const getInitialPriests = (): Priest[] => [
    {
        id: 'priest_init_1',
        name: 'Sivasri K. Somasundaram Sivachariyar',
        role: 'Head Priest',
        specialty: 'Agama Sastras',
        contactPerson: 'Sivasri K. Somasundaram Sivachariyar',
        contactEmail: 'somasundaram.k@ap-kovil.org',
        contactPhone: '9840012345',
        addressLine1: '123 Sannathi Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001',
        joinedDate: '2010-05-15',
    },
    {
        id: 'priest_init_2',
        name: 'Arunachalam Gurukkal',
        role: 'Assistant Priest',
        specialty: 'Alangaram',
        contactPerson: 'Arunachalam Gurukkal',
        contactEmail: 'arunachalam.g@ap-kovil.org',
        contactPhone: '9840054321',
        addressLine1: '456 West Masi Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001',
        joinedDate: '2018-02-20',
    },
];


// --- Generic LocalStorage Functions ---
const getFromStorage = <T>(key: string, initialData: T[]): T[] => {
    try {
        const item = window.localStorage.getItem(key);
        if (!item) {
            window.localStorage.setItem(key, JSON.stringify(initialData));
            return initialData;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return initialData;
    }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
    try {
        const serializedData = JSON.stringify(data);
        window.localStorage.setItem(key, serializedData);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


// --- Receipt API Functions ---

export const getReceipts = async (): Promise<Receipt[]> => {
  console.log('Fetching receipts from localStorage...');
  return Promise.resolve(getFromStorage<Receipt>(RECEIPTS_KEY, getInitialReceipts()));
};

export const createReceipt = async (receiptData: Omit<Receipt, 'id'>): Promise<Receipt> => {
  console.log('Creating receipt in localStorage...', receiptData);
  const receipts = getFromStorage<Receipt>(RECEIPTS_KEY, []);
  const newReceipt: Receipt = { ...receiptData, id: `rec_${new Date().getTime()}` };
  const updatedReceipts = [newReceipt, ...receipts];
  saveToStorage(RECEIPTS_KEY, updatedReceipts);
  return Promise.resolve(newReceipt);
};

export const updateReceipt = async (id: string, receiptData: Receipt): Promise<Receipt> => {
  console.log(`Updating receipt ${id} in localStorage...`, receiptData);
  const receipts = getFromStorage<Receipt>(RECEIPTS_KEY, []);
  const updatedReceipts = receipts.map(r => (r.id === id ? receiptData : r));
  saveToStorage(RECEIPTS_KEY, updatedReceipts);
  return Promise.resolve(receiptData);
};

export const deleteReceipt = async (id: string): Promise<void> => {
  console.log(`Deleting receipt ${id} from localStorage...`);
  const receipts = getFromStorage<Receipt>(RECEIPTS_KEY, []);
  const updatedReceipts = receipts.filter(r => r.id !== id);
  saveToStorage(RECEIPTS_KEY, updatedReceipts);
  return Promise.resolve();
};

// --- Priest & Sevadar API Functions ---

export const getPriests = async (): Promise<Priest[]> => {
  console.log('Fetching priests from localStorage...');
  return Promise.resolve(getFromStorage<Priest>(PRIESTS_KEY, getInitialPriests()));
};

export const createPriest = async (priestData: Omit<Priest, 'id'|'joinedDate'>): Promise<Priest> => {
    const priests = getFromStorage<Priest>(PRIESTS_KEY, []);
    const newPriest: Priest = { 
        ...priestData, 
        id: `priest_${new Date().getTime()}`,
        joinedDate: new Date().toISOString().split('T')[0] 
    };
    const updatedPriests = [newPriest, ...priests];
    saveToStorage(PRIESTS_KEY, updatedPriests);
    console.log('Creating priest in localStorage...', newPriest);
    return Promise.resolve(newPriest);
};

export const updatePriest = async (id: string, priestData: Priest): Promise<Priest> => {
  console.log(`Updating priest ${id} in localStorage...`, priestData);
  const priests = getFromStorage<Priest>(PRIESTS_KEY, []);
  const updatedPriests = priests.map(p => (p.id === id ? priestData : p));
  saveToStorage(PRIESTS_KEY, updatedPriests);
  return Promise.resolve(priestData);
};

export const deletePriest = async (id: string): Promise<void> => {
    console.log(`Deleting priest ${id} from localStorage...`);
    const priests = getFromStorage<Priest>(PRIESTS_KEY, []);
    const updatedPriests = priests.filter(p => p.id !== id);
    saveToStorage(PRIESTS_KEY, updatedPriests);
    return Promise.resolve();
};
