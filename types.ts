export enum ReceiptStatus {
  Draft = 'வரைவு',
  Completed = 'முடிந்தது',
  Scheduled = 'திட்டமிடப்பட்டது',
}

export interface OfferingItem {
  id: string;
  description: string; // e.g., 'Archana', 'Abishekam', 'General Donation'
  amount: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  devoteeName: string;
  offeringDate: string;
  items: OfferingItem[];
  status: ReceiptStatus;
  notes?: string;
  mobileNumber?: string;
  poojaType?: string; // For easier filtering
}

export interface Priest {
  id: string;
  name: string;
  role: string; // e.g., 'Head Priest', 'Assistant Priest', 'Sevadar'
  specialty: string; // e.g., 'Alangaram', 'Yagnas'
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  joinedDate: string;
}