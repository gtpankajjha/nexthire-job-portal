# Firebase Setup & Configuration Report

As requested, here is the exact state of the application's Firebase integration and the manual checklist required to make it functional. No additional code changes have been made.

## 1. Expected Configuration Structure

### `config.ts`
The application expects this exact structure. All 6 fields are **required** for Auth and Firestore to function properly:
```typescript
export const FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};
```

### `firebase.ts`
This file consumes the config and initializes the specific services the app needs:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 2. Current Application Status Answers

*   **How is the Firebase SDK being loaded?**
    It is being loaded through an **importmap / CDN** (specifically `esm.sh` in `index.html`), NOT via npm/node_modules.
*   **Is the current configuration already connected to a specific project?**
    **No.** It currently contains placeholder strings (`"REPLACE_WITH_YOUR_API_KEY"`, etc.).
*   **Do I need to create/register a Firebase Web App?**
    **Yes.** You must register a Web App in the Firebase Console to generate the configuration keys.
*   **Has Firebase Authentication already been enabled?**
    **No.** This must be done manually in the Firebase Console.
*   **Has Cloud Firestore already been created?**
    **No.** This must be done manually in the Firebase Console.
*   **Has the `firestore.rules` file been deployed to Firebase?**
    **No.** It only exists as a text file in this codebase. You must manually copy and paste its contents into the Firebase Console.
*   **Can the current application successfully read/write a test document to Firestore?**
    **No.** Any attempt to login, register, or fetch jobs will currently result in a Firebase SDK error because the API keys are invalid placeholders.

---

## 3. Manual Setup Checklist (Firebase Console)

Please complete these exact steps in your Google Cloud / Firebase Console before attempting to test the application:

### Step 1: Create Project & Register App
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** (or select an existing Google Cloud project).
3. On the Project Overview page, click the **Web icon (`</>`)** to add a Firebase app.
4. Give the app a nickname (e.g., "NextHire Web").
5. Click **Register app**.
6. Firebase will display a `firebaseConfig` object. **Copy the 6 key-value pairs** (apiKey, authDomain, etc.).
7. Paste these values into the `config.ts` file in this codebase, replacing the placeholder strings.

### Step 2: Enable Authentication
1. In the Firebase Console left sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Click **Email/Password**.
5. Enable the first toggle ("Email/Password") and click **Save**.

### Step 3: Create Firestore Database
1. In the left sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. Select your preferred location (e.g., `nam5` for US Central).
4. Select **Start in production mode** (this denies all reads/writes by default).
5. Click **Create**.

### Step 4: Deploy Security Rules
1. In the Firestore Database view, click the **Rules** tab.
2. Delete the default rules.
3. Open the `firestore.rules` file from this codebase, copy all of its contents, and paste them into the Rules editor in the Firebase Console.
4. Click **Publish**.

### Step 5: Verify
Once Steps 1-4 are complete, the application will be fully connected. You can then run the app, register a new user, and verify that the user appears in the Authentication tab and a corresponding document appears in the Firestore `users` collection.
