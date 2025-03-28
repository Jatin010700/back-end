import { Request, Response } from 'express';
import bcrypt from "bcrypt";
import { getDocs, addDoc, collection, updateDoc } from "firebase/firestore";
import { firebaseDB } from "../config/firebaseConfig";
import { generateToken } from '../utils/jwtUtils';

const userAccountCol = collection(firebaseDB, "user_account");

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const userAccountDB = await getDocs(userAccountCol);
    const checkData = userAccountDB.docs.map(doc => ({
        ...doc.data(),
        user_name: doc.data().user_name,
        email_address: doc.data().email_address
    }));

    // CHECK IF EMAIL ALREADY EXISTS IN "register_user" COLLECTION
    const checkEmail = checkData.find(user => user.email_address === email);
    const checkUser = checkData.find(user => user.user_name === username);

    if (checkUser) {
        res.status(400).json({ error: "USERNAME ALREADY EXISTS" });
        return;
    } else if (checkEmail) {
        res.status(400).json({ error: "EMAIL ALREADY EXISTS" });
        return;
    }

    // ADD NEW USER TO "user_account" COLLECTION
    await addDoc(userAccountCol, {
      user_name: username,
      email_address: email,
      account_password: bcrypt.hashSync(password, 10),
      created_date: new Date().toDateString(),
      login_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });

    res.status(200).json({ message: "REGISTRATION SUCCESSFULL" });
  } catch (error) {
    res.status(500).json({ error: "SERVER/DB ERROR!!!" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;

  try {
    const userAccountDB = await getDocs(userAccountCol);
    const checkData = userAccountDB.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      user_name: doc.data().user_name,
      account_password: doc.data().account_password
    }));

    const checkUser = checkData.find(user => user.user_name === username);
    if (!checkUser) {
      res.status(400).json({ error: "INVALID USER" });
      return;
    }

    const checkPassword = checkData.find(data => data.id === checkUser.id)
    if (!checkPassword  || !checkPassword.account_password) {
      res.status(400).json({ error: "INVALID PASSWORD" });
      return;
    }

    // Update login_date in "user_account"
    const updateLoginDate = userAccountDB.docs[0].ref;
    await updateDoc(updateLoginDate, { login_date: new Date().toISOString().slice(0, 16).replace('T', ' ') });

     // Generate a JWT token
     let token;
     try {
       token = generateToken({ id: checkUser.id, username: checkUser.user_name });
     } catch (err) {
       res.status(500).json({ error: "TOKEN GENERATION FAILED" });
       return;
     }

     // Set cookie
     try {
       res.cookie("token", token, { httpOnly: true });
     } catch (err) {
       res.status(500).json({ error: "FAILED TO SET COOKIE" });
       return;
     }

    res.status(200).json({ message: "LOGIN SUCCESSFUL", token });
  } catch (error) {
    res.status(500).json({ error: "SERVER/DB ERROR!!!" });
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "LOGOUT SUCCESSFULL"})
  } catch (error) {
    res.status(500).json({ error: "SERVER ERROR!!!" });
  }
}