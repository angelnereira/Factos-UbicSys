
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, collectionGroup, query, updateDoc } from 'firebase/firestore';
import type { Company, FiscalDocument } from '../types';
import type { DocumentData, Timestamp } from 'firebase/firestore';


/**
 * Adds a new company to the 'companies' collection in Firestore.
 * @param companyData - The company data to add, without the 'id'.
 * @returns An object with the new company data (including id) or an error.
 */
export const addCompany = async (companyData: Partial<Omit<Company, 'id'>>): Promise<{ newCompany?: Company, error?: any }> => {
  try {
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
    return [];
  }
};

/**
 * Adds a new document to the 'documents' sub-collection of a company in Firestore.
 * @param documentData - The document data to add. Must contain companyId.
 * @returns An object with the new document data (including id) or an error.
 */
export const addDocument = async (documentData: Partial<Omit<FiscalDocument, 'id'>>): Promise<{ newDocument?: FiscalDocument, error?: any }> => {
  if (!documentData.companyId) {
    const error = new Error("companyId is required to add a document.");
    console.error(error);
    return { error };
  }
  try {
    const dataWithTimestamps = {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "companies", documentData.companyId, "documents"), dataWithTimestamps);
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
 * Fetches all documents from all companies by querying the 'documents' collection group.
 * @returns A promise that resolves to an array of all fiscal documents.
 */
export const getDocuments = async (): Promise<FiscalDocument[]> => {
    try {
        const documentsQuery = query(collectionGroup(db, 'documents'));
        const querySnapshot = await getDocs(documentsQuery);
        const documents: FiscalDocument[] = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() } as FiscalDocument);
        });
        return documents;
    } catch (error) {
        console.error("Error getting documents from collection group: ", error);
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
        if (!companyId || !documentId) {
            console.error("companyId and documentId must be provided.");
            return null;
        }
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


/**
 * Updates a document in a company's 'documents' sub-collection.
 * @param companyId The ID of the company.
 * @param documentId The ID of the document to update.
 * @param data The data to update.
 * @returns An object indicating success or an error.
 */
export const updateDocument = async (
  companyId: string,
  documentId: string,
  data: Partial<FiscalDocument>
): Promise<{ success: boolean; error?: any }> => {
  if (!companyId || !documentId) {
    const error = new Error("companyId and documentId must be provided.");
    console.error(error);
    return { success: false, error };
  }
  try {
    const docRef = doc(db, 'companies', companyId, 'documents', documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating document ${documentId}:`, error);
    return { success: false, error };
  }
};
