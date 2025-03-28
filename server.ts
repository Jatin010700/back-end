import express, { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from 'express-openid-connect';
import cookieParser from 'cookie-parser';
import authConfig from "./config/auth0Config";
import { authRoutes } from "./routes/authRoutes";
import { requireUserRoute } from "./middlewares/authMiddleware";

dotenv.config();

const port = process.env.PORT;
const app = express();

app.use(cors({
  origin: process.env.LOCAL_URL || process.env.ONLINE_SHOP_URL || process.env.CAR_RENTAL_URL,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use(auth(authConfig));
app.use('/api', authRoutes);

app.listen(port, () => console.log(`Server running`));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Testing user middleware
app.get('/protected', requireUserRoute, (req, res) => {
  res.status(200).json({ message: "This is a protected route" });
});