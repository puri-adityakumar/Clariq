import { Client, Account } from 'appwrite';

// NOTE: Replace the placeholders below with real values (endpoint + project ID)
export const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://<REGION>.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '<PROJECT_ID>');

export const account = new Account(appwriteClient);
