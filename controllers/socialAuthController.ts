import { Request, Response } from 'express';
import { addDoc, collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firebaseDB } from '../config/firebaseConfig';
import admin from "firebase-admin";

const userAccountCol = collection(firebaseDB, "user_account");

export const firebaseConfig = async (req: Request, res: Response) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  res.json(firebaseConfig);
}

export const googleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email } = decodedToken;

    const loginQuery = query(userAccountCol, where("user_name", "==", name), where("email_address", "==", email));
    const userAccountDB = await getDocs(loginQuery);

    if (!userAccountCol) {
      // Update login_date in "user_account"
      const updateLoginDate = userAccountDB.docs[0].ref;
      await updateDoc(updateLoginDate, { login_date: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    } else {
      // First-time login, add user to "user_account" collection
      await addDoc(userAccountCol, {
        user_name: name || "Unknown User",
        email_address: email || "Unknown Email",
        created_date: new Date().toDateString(),
        login_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }

    res.json({ message: "Authenticated", user: { uid, name } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}