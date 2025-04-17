
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
  "public/looks/look-1.png", // manteau beige sur t-shirt rayé
  "public/looks/look-2.png", // manteau beige sur t-shirt blanc
  "public/looks/look-3.png", // manteau beige sur chemisier rouge
  "public/looks/look-4.png", // manteau beige sur chemisier rouge et jean
  "public/looks/look-5.png", // manteau beige sur t-shirt blanc et jean
  "public/looks/look-6.png", // manteau beige sur t-shirt rayé et jean
  "public/looks/look-7.png", // t-shirt rayé et jean
  "public/looks/look-8.png", // chemisier rouge et jean
  "public/looks/look-9.png", // t-shirt blanc et jean
  "public/looks/look-10.png", // t-shirt blanc et short gris
  "public/looks/look-11.png", // chemisier rouge et short gris
  "public/looks/look-12.png", // t-shirt rayé et short gris
  "public/looks/look-13.png", // bikini et short gris
];
