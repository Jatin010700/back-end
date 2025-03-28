import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { collection, getDocs } from 'firebase/firestore';
import { firebaseDB } from "../config/firebaseConfig";

const carDataCol = collection(firebaseDB, "owners_car_data");

const prisma = new PrismaClient().$extends(withAccelerate());

prisma.$connect()
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("DB Connection Error:", err));

export const onlineShopProduct = async (req: Request, res: Response) => {
  try {
    const [products, store] = await Promise.all([
      prisma.frontPageProducts.findMany({
        cacheStrategy: {
          ttl: 60 * 2, // serve from cache for 5 minutes
          swr: 60 * 1, // serve from cache for 2 more minutes and revalidate in the background
        },
      }),
      prisma.storeContent.findMany({
        cacheStrategy: {
          ttl: 60 * 2, // serve from cache for 5 minutes
          swr: 60 * 1, // serve from cache for 2 more minutes and revalidate in the background
        },
      }),
    ]);
    res.status(200).json({ products, store });
  } catch (err) {
    res.status(500).json({err: "SERVER/DB ERROR!!!"});
  }
}

export const carRentalProduct = async (req: Request, res: Response) => {
  try {
    // GET ALL DATA FROM FIREBASE "owners_car_data" COLLECTION
    const getCarData = await getDocs(carDataCol);
    const carListings = getCarData.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    res.json(carListings || []);
  } catch (error) {
    res.status(500).json({ error: 'SERVER ERROR!!!' });
  }
}