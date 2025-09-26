

'use client';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  collectionGroup,
  Timestamp,
  where,
  type Firestore,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Company, FiscalDocument } from '../types';


// Function to get a list of companies
export async function getCompanies(db: Firestore): Promise<Company[]> {
  const q = collection(db, 'companies');
  const querySnapshot = await getDocs(q);
  const companies: Company[] = [];
  querySnapshot.forEach(doc => {
    companies.push({ id: doc.id, ...doc.data() } as Company);
  });
  return companies;
}

// Function to add a company
export async function addCompany(db: Firestore, companyData: Omit<Company, 'id'>): Promise<{ id: string | null; error: any }> {
    try {
        const docRef = await addDoc(collection(db, "companies"), companyData);
        return { id: docRef.id, error: null };
    } catch (error) {
        console.error("Error adding company to Firestore: ", error);
        return { id: null, error };
    }
}

// Function to update a company
export async function updateCompany(db: Firestore, companyId: string, data: Partial<Company>): Promise<{ success: boolean; error?: any }> {
  if (!companyId) {
    const error = new Error("companyId must be provided.");
    console.error(error);
    return { success: false, error };
  }
  try {
    const docRef = doc(db, 'companies', companyId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating company ${companyId}:`, error);
    return { success: false, error };
  }
}

// Function to get a single company by auth UID
export async function getCompanyByAuthUid(db: Firestore, authUid: string): Promise<Company | null> {
    try {
        const q = query(collection(db, 'companies'), where('authUid', '==', authUid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Company;
        }
        return null;
    } catch (error) {
        console.error("Error getting company by auth UID: ", error);
        return null;
    }
}

// Function to get a document by ID (requires knowing companyId)
export async function getDocumentById(db: Firestore, companyId: string, documentId: string): Promise<FiscalDocument | null> {
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

// Function to update a document (used in flows)
export async function updateDocumentInFlow(
  db: Firestore,
  companyId: string,
  documentId: string,
  data: Partial<FiscalDocument>
): Promise<{ success: boolean; error?: any }> {
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

/**
 * Gets all documents for the currently authenticated user's company.
 * It first finds the company associated with the authUid, then fetches its documents.
 * @param db - The Firestore instance.
 * @param authUid - The authenticated user's UID.
 * @returns A promise that resolves to an array of FiscalDocument.
 */
export async function getAllDocumentsForUser(db: Firestore, authUid: string): Promise<FiscalDocument[]> {
  const company = await getCompanyByAuthUid(db, authUid);
  if (!company) {
    console.log("No company found for the current user. Cannot fetch documents.");
    return [];
  }

  const documentsQuery = query(collection(db, 'companies', company.id, 'documents'));
  const querySnapshot = await getDocs(documentsQuery);
  const fetchedDocuments: FiscalDocument[] = [];
  querySnapshot.forEach((doc) => {
    fetchedDocuments.push({ id: doc.id, ...doc.data() } as FiscalDocument);
  });
  return fetchedDocuments;
}

// Function to get all documents using a collectionGroup query
// Note: This is less secure and less efficient for multi-tenant apps.
// Prefer `getAllDocumentsForUser` where possible.
export async function getAllDocuments(db: Firestore): Promise<FiscalDocument[]> {
  const documentsQuery = query(collectionGroup(db, 'documents'));
  const querySnapshot = await getDocs(documentsQuery);
  const fetchedDocuments: FiscalDocument[] = [];
  querySnapshot.forEach((doc) => {
    fetchedDocuments.push({ id: doc.id, ...doc.data() } as FiscalDocument);
  });
  return fetchedDocuments;
}

// Function to get all logs (from document status history)
export async function getAllLogs(db: Firestore) {
  const documentsQuery = query(collectionGroup(db, 'documents'));
  const querySnapshot = await getDocs(documentsQuery);
  return querySnapshot;
}
