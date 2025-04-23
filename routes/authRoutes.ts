import { Router } from 'express';
import multer from 'multer';
import { protectedRoute, requireUserRoute } from '../middlewares/authMiddleware';
import { loginUser, logout, registerUser } from '../controllers/userController';
import { carListByOwner, carRentalProduct, onlineShopProduct } from '../controllers/productController';
import { deleteCarRentalData, uploadCarRentalData } from '../controllers/dataController';
import { firebaseConfig, googleAuth } from '../controllers/socialAuthController';

const router: Router = Router();
const uploadFolder = multer({ dest: "uploads/" });

// user route
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);

//Social login
router.get('/firebaseConfig', protectedRoute, firebaseConfig);
router.post('/google', googleAuth);

// Product route
router.get('/products', protectedRoute, onlineShopProduct);
router.get('/carData', carRentalProduct);
router.delete('/carData/:id', requireUserRoute, deleteCarRentalData);
router.get('/carData/:user', requireUserRoute, carListByOwner);


// Upload product route
router.post('/ownerData', requireUserRoute, uploadFolder.array("images", 5), uploadCarRentalData);

export const authRoutes = router;