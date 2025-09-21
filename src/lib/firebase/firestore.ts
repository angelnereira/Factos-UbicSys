
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, DocumentData } from 'firebase/firestore';
import type { Client, Document } from '../types';

// Define the type for the data to be added, omitting the 'id'
type ClientData = Omit<Client, 'id'>;
type DocumentDataToAdd = Omit<Document, 'id'>;


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
    console.error("Error getting clients: ", error);
    return []; // Return an empty array in case of an error
  }
};

/**
 * Adds a new document to the 'documents' collection in Firestore.
 * @param documentData - The document data to add.
 * @returns An object with the new document data (including id) or an error.
 */
export const addDocument = async (documentData: DocumentDataToAdd): Promise<{ newDocument?: Document, error?: any }> => {
  try {
    const docRef = await addDoc(collection(db, "documents"), documentData);
    const newDocument: Document = {
      id: docRef.id,
      ...documentData
    };
    return { newDocument };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { error };
  }
}


/**
 * Fetches all documents from the 'documents' collection in Firestore.
 * @returns A promise that resolves to an array of documents.
 */
export const getDocuments = async (): Promise<Document[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "documents"));
        const documents: Document[] = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() } as Document);
        });
        return documents;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
};

/**
 * Fetches a single document from the 'documents' collection in Firestore.
 * @param id - The ID of the document to fetch.
 * @returns A promise that resolves to the document data or null if not found.
 */
export const getDocumentById = async (id: string): Promise<Document | null> => {
    try {
        const docRef = doc(db, "documents", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Document;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document by ID: ", error);
        return null;
    }
}
