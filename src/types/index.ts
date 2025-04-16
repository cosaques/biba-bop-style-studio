
export type Gender = "homme" | "femme" | "autre";

export interface UserProfile {
  id: string;
  gender: Gender;
  age: number;
  height: number; // en cm
  weight: number; // en kg
  bustSize?: number; // pour les femmes
  silhouette: string;
  name?: string;
  avatar?: string;
}

export interface ClothingItem {
  id: string;
  userId: string;
  image: string;
  type: string;
  color: string;
  season?: string;
  enhanced?: boolean; // si l'image a été améliorée
}

export interface Outfit {
  id: string;
  name: string;
  clientId: string;
  consultantId: string;
  date: string;
  clothingItems: string[]; // IDs des vêtements
  comments?: string;
  feedback?: string;
  image: string; // Ajout du chemin de l'image de la tenue
}

export interface ConsultantProfile {
  id: string;
  name: string;
  bio: string;
  clients: string[]; // IDs des clients
}

// Ajout des chemins des images de tenues 
export const outfitImages = [
  "public/lovable-uploads/9edb479c-3555-4473-a3cd-353dc2ca71f2.png", // manteau beige sur t-shirt rayé
  "public/lovable-uploads/f65fd8fa-00c3-4662-bc16-1a35d17e72b2.png", // manteau beige sur t-shirt blanc
  "public/lovable-uploads/adec55a0-6dee-44c3-9e9d-9a4c90603b37.png", // manteau beige sur chemisier rouge
  "public/lovable-uploads/bbe3c11c-c856-411e-abc9-0c4d721aab08.png", // manteau beige sur chemisier rouge et jean
  "public/lovable-uploads/f83dceb1-9955-4e3e-b259-f8f08836a39a.png", // manteau beige sur t-shirt blanc et jean
  "public/lovable-uploads/530deeac-2f73-4395-ab59-20fb5aefa3cd.png", // manteau beige sur t-shirt rayé et jean
  "public/lovable-uploads/44b5c714-fb61-4c71-91e5-f5dd265f984e.png", // t-shirt rayé et jean
  "public/lovable-uploads/0fdcd4b7-b858-4fed-ba10-73a9d09bbc5d.png", // chemisier rouge et jean
  "public/lovable-uploads/9267bcdb-56ae-4a8a-b47a-785963f73221.png", // t-shirt blanc et jean
  "public/lovable-uploads/c1f815ae-e69e-4e17-ad09-0f6482e2a699.png", // t-shirt blanc et short gris
  "public/lovable-uploads/4ad8e72b-5d65-4fe9-8002-db679571e938.png", // chemisier rouge et short gris
  "public/lovable-uploads/af6978f1-6f42-44fc-bf56-c76bd33cbc16.png", // t-shirt rayé et short gris
  "public/lovable-uploads/82d10ec4-c4f6-4931-8fe4-8a29f63225d9.png", // bikini et short gris
];
