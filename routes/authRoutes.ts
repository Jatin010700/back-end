import { Router } from 'express';
import multer from 'multer';
import { protectedRoute, requireUserRoute } from '../middlewares/authMiddleware';
import { loginUser, logout, registerUser } from '../controllers/userController';
import { carRentalProduct, onlineShopProduct } from '../controllers/productController';
import { uploadCarRentalData } from '../controllers/uploadDataController';
import { googleAuth } from '../controllers/socialAuthController';

const router: Router = Router();
const uploadFolder = multer({ dest: "uploads/" });

// user route
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);

//Social login
router.post('/google', googleAuth);

// Product route
router.get('/products', protectedRoute, onlineShopProduct);
router.get('/carData', protectedRoute, carRentalProduct);

// Upload product route
router.post('/ownerData', requireUserRoute, uploadFolder.array("images", 5), uploadCarRentalData);

export const authRoutes = router;