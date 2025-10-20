
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 * This is a mock function and does not perform any real database operation.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  console.log(`[Mock] Would set document at ${docRef.path}`);
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * This is a mock function and does not perform any real database operation.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  console.log(`[Mock] Would add document to ${colRef.path}`);
  return Promise.resolve({ id: `MOCK_ID_${Date.now()}` } as DocumentReference);
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 * This is a mock function and does not perform any real database operation.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  console.log(`[Mock] Would update document at ${docRef.path}`);
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 * This is a mock function and does not perform any real database operation.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  console.log(`[Mock] Would delete document at ${docRef.path}`);
}
