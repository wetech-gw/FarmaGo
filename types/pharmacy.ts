export interface Medication {
  id: number;
  name: string;
  dosage: string;
  image: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  image: string;
  address: string;
  hours: string;
  phone: string;
  schedule: string;
  medications: Medication[];
}

export interface StockMedication {
  id: number;
  name: string;
  dosage: string;
  image: string | null;
  quantity: number;
  expiryDate: string;
  price: number;
}

export interface PharmacySpot {
  id: number;
  name: string;
  image: string | null;
  address: string;
  phone: string;
  schedule: string;
  hours: string;
  latitude: number | null;
  longitude: number | null;
  isOpen: boolean;
  isGuard: boolean;
  medications: StockMedication[];
}
