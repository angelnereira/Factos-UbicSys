
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, DocumentData, Timestamp } from 'firebase/firestore';
import type { Company, FiscalDocument } from '../types';

// Define the type for the data to be added, omitting the 'id'
type CompanyData = Omit<Company, 'id'>;
type DocumentDataToAdd = Omit<FiscalDocument, 'id'>;


/**
 * Adds a new company to the 'companies' collection in Firestore.
 * @param companyData - The company data to add, without the 'id'.
 * @returns An object with the new company data (including id) or an error.
 */
export const addCompany = async (companyData: Partial<CompanyData>): Promise<{ newCompany?: Company, error?: any }> => {
  try {
    // Add server-side timestamps
    const dataWithTimestamps = {
      ...companyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "companies"), dataWithTimestamps);
    const newCompany: Company = {
        id: docRef.id,
        ...dataWithTimestamps
    } as Company;
    return { newCompany };
  } catch (error) {
    console.error("Error adding company: ", error);
    return { error };
  }
};

/**
 * Fetches all companies from the 'companies' collection in Firestore.
 * @returns A promise that resolves to an array of companies.
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "companies"));
    const companies: Company[] = [];
    querySnapshot.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() } as Company);
    });
    return companies;
  } catch (error) {
    console.error("Error getting companies: ", error);
    return []; // Return an empty array in case of an error
  }
};

/**
 * Adds a new document to the 'documents' sub-collection of a company in Firestore.
 * @param companyId - The ID of the company this document belongs to.
 * @param documentData - The document data to add.
 * @returns An object with the new document data (including id) or an error.
 */
export const addDocument = async (companyId: string, documentData: Partial<DocumentDataToAdd>): Promise<{ newDocument?: FiscalDocument, error?: any }> => {
  try {
    const dataWithTimestamps = {
      ...documentData,
      companyId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "companies", companyId, "documents"), dataWithTimestamps);
    const newDocument: FiscalDocument = {
      id: docRef.id,
      ...dataWithTimestamps
    } as FiscalDocument;
    return { newDocument };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { error };
  }
}


/**
 * Fetches all documents from all companies from the 'documents' collection group in Firestore.
 * @returns A promise that resolves to an array of documents.
 */
export const getDocuments = async (): Promise<FiscalDocument[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "documents"));
        const documents: FiscalDocument[] = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() } as FiscalDocument);
        });
        return documents;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
};

/**
 * Fetches a single document from a company's 'documents' sub-collection in Firestore.
 * @param companyId - The ID of the company.
 * @param documentId - The ID of the document to fetch.
 * @returns A promise that resolves to the document data or null if not found.
 */
export const getDocumentById = async (companyId: string, documentId: string): Promise<FiscalDocument | null> => {
    try {
        const docRef = doc(db, "companies", companyId, "documents", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as FiscalDocument;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document by ID: ", error);
        return null;
    }
}

// Re-exporting old function names for temporary compatibility
export { addCompany as addClient, getCompanies as getClients };
