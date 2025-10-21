'use client';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from './index';

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};


interface SecurityRuleRequest {
  auth: object | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
    const { auth } = initializeFirebase();
    const currentUser = auth.currentUser;

    return {
        auth: currentUser ? {
            uid: currentUser.uid,
            token: {
                // This is a simplified representation. 
                // In a real scenario, you might decode the token if needed,
                // but for debugging, uid is often sufficient.
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName
            }
        } : null,
        method: context.operation,
        path: `/databases/(default)/documents/${context.path}`,
        resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
    };
}

function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}


export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirebaseError';
    this.request = requestObject;
  }
}
