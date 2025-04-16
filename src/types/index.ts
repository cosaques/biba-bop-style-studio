
export type Gender = "homme" | "femme" | "autre";

export interface UserProfile {
  id: string;
  gender: Gender;
  age: number;
  height: number; // en cm
  weight: number; // en kg
  bustSize?: number; // pour les femmes
  silhouette?: string; // URL de l'image de silhouette générée
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
}

export interface ConsultantProfile {
  id: string;
  name: string;
  bio: string;
  clients: string[]; // IDs des clients
}
