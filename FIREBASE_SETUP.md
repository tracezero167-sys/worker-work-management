# Firebase Setup Guide

## Important: You MUST set up Firebase to sync data across devices

Currently, the app uses localStorage which is device-specific. To sync data between PC and phone, you need to set up Firebase.

## Step-by-Step Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "worker-work-management")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database
1. In Firebase Console, go to your project
2. Click "Build" → "Firestore Database"
3. Click "Create database"
4. Select a location (choose one closest to your users)
5. Choose "Start in test mode" (for development)
6. Click "Enable"

### 3. Get Firebase Configuration
1. In Firebase Console, click the gear icon (Project Settings)
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Give your app a name (e.g., "worker-management-app")
5. Click "Register app"
6. Copy the firebaseConfig object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Update firebase-config.js
1. Open `firebase-config.js` file in your project
2. Replace the placeholder values with your actual Firebase config
3. Save the file

### 5. Update Firestore Rules (Optional but Recommended)
In Firebase Console → Firestore → Rules, set these rules for better security:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** For production, you should implement proper authentication and restrict rules.

### 6. Test the Integration
1. Refresh your browser
2. Check the browser console (F12) for errors
3. If you see "All data loaded from Firebase", it's working!
4. Add a worker and check if it syncs

## Features After Firebase Setup

✅ **Real-time Sync**: Data syncs instantly across all devices
✅ **Cloud Storage**: All data stored in Firebase cloud
✅ **Offline Support**: Works offline, syncs when online
✅ **Cross-Device**: PC and phone will show same data
✅ **Automatic Backup**: Data automatically backed up

## Troubleshooting

### Error: "Firebase is not defined"
- Make sure `firebase-config.js` is loaded before `script.js`
- Check if Firebase SDK scripts are properly loaded in index.html

### Error: "Permission denied"
- Check Firestore rules in Firebase Console
- Make sure test mode is enabled

### Data not syncing
- Check browser console for errors
- Verify firebase-config.js has correct values
- Make sure Firestore is enabled in Firebase Console

## What Gets Synced

- ✅ Workers data (name, mobile, whatsapp, department, etc.)
- ✅ Worker photos (stored as base64)
- ✅ Worker card colors
- ✅ Activities/Logs
- ✅ Sticky notes
- ✅ Input styling settings

## Current Fallback

If Firebase is not set up or fails, the app automatically falls back to localStorage. This means:
- Data will be stored locally on each device
- No sync between devices
- Each device will have its own data

## Deployment Note

When deploying to Vercel, make sure:
1. Firebase config is updated
2. Firestore rules are properly set
3. Test thoroughly before going live
