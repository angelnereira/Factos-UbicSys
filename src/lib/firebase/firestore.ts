import { db } from './firebase';
import { collection, getDocs, addDoc, doc, DocumentData } from 'firebase/firestore';
import type { Client } from '../types';

// Define the type for the data to be added, omitting the 'id'
type ClientData = Omit<Client, 'id'>;

/**
 * Adds a new client to the 'clients' collection in Firestore.
 * @param clientData - The client data to add, without the 'id'.
 * @returns An object with the new client data (including id) or an error.
 */
export const addClient = async (clientData: ClientData): Promise<{ newClient?: Client, error?: any }> => {
  try {
    const docRef = await addDoc(collection(db, "clients"), clientData);
    const newClient: Client = {
        id: docRef.id,
        ...clientData
    };
    return { newClient };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { error };
  }
};

/**
 * Fetches all clients from the 'clients' collection in Firestore.
 * @returns A promise that resolves to an array of clients.
 */
export const getClients = async (): Promise<Client[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() } as Client);
    });
    return clients;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return []; // Return an empty array in case of an error
  }
};
