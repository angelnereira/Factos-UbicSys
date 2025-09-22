'use client';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  collectionGroup,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import type { Company, FiscalDocument } from '../types';


// Function to get a list of companies
export async function getCompanies(db: Firestore) {
  const q = collection(db, 'companies');
  const querySnapshot = await getDocs(q);
  const companies: any[] = [];
  querySnapshot.forEach(doc => {
    companies.push({ id: doc.id, ...doc.data() });
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

// Function to get all documents using a collectionGroup query
export async function getAllDocuments(db: Firestore): Promise<FiscalDocument[]> {
  const documentsQuery = query(collectionGroup(db, 'documents'));
  const querySnapshot = await getDocs(documentsQuery);
  const fetchedDocuments: FiscalDocument[] = [];
  querySnapshot.forEach((doc) => {
    fetchedDocuments.push({ id: doc.id, ...doc.data() } as FiscalDocument);
  });
  return fetchedDocuments;
}

// Function to find a company by API key
export async function findCompanyByApiKey(db: Firestore, apiKey: string): Promise<{ companyId: string | null; error: string | null }> {
    if (!apiKey) {
        return { companyId: null, error: 'Authorization header is missing.' };
    }
    const token = apiKey.replace('Bearer ', '');
    const q = query(collection(db, 'companies'), where('apiKey', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { companyId: null, error: 'Invalid API key.' };
    }
    const companyDoc = querySnapshot.docs[0];
    return { companyId: companyDoc.id, error: null };
}

// Function to save a new fiscal document
export async function saveNewFiscalDocument(db: Firestore, documentToSave: Partial<Omit<FiscalDocument, 'id'>>, companyId: string) {
    const docRef = await addDoc(collection(db, "companies", companyId, "documents"), documentToSave);
    return docRef;
}

// Function to get all logs (from document status history)
export async function getAllLogs(db: Firestore) {
  const documentsQuery = query(collectionGroup(db, 'documents'));
  const querySnapshot = await getDocs(documentsQuery);
  return querySnapshot.docs;
}