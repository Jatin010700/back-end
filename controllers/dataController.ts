import { Request, Response } from 'express';
import cloudinary from '../config/cloudinaryConfig';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { firebaseDB } from "../config/firebaseConfig";
import { verifyToken } from '../utils/jwtUtils';

const carDataCol = collection(firebaseDB, "owners_car_data");

export const uploadCarRentalData = async (req: Request, res: Response): Promise<void>  => {
  const { carName, price, rent } = req.body;
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: "User not logged in" });
    return;
  }

  try {
    const validateUser = verifyToken(token);

    if (!validateUser) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: "No images uploaded" });
      return;
    }

    // UPLOAD IMAGES TO CLOUDINARY
    const imageURLS = await Promise.all(
      req.files?.map(async (file: Express.Multer.File) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'car_rental_cloudinary'
          });
          return result.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          throw new Error("Image upload failed");
        }
      })
    );

    // CONVERT THE ARRAY OF IMAGE TO A STRING
    const imageUrlsJson = JSON.stringify(imageURLS);

    //UPLOAD CAR DATA TO "owners_car_data" COLLECTION
    await addDoc(carDataCol, {
      car_name: carName,
      car_price: price,
      car_rent: rent,
      image_url: imageUrlsJson,
      owner_user_name: (await validateUser).username,
      uploaded_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    })

    res.status(200).json({ message: "INFO SAVED" });
  } catch (error) {
    res.status(500).json({ error: "SERVOR ERROR!!!" });
  }
}

export const deleteCarRentalData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const carDocRef = doc(carDataCol, id);
    await deleteDoc(carDocRef);

    res.status(200).json({ message: "Document deleted" });
  } catch  (error) {
    res.status(500).json({ error: 'SERVER ERROR!!!' });
  }
}