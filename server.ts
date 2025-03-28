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

const allowedOrigins = [
  process.env.LOCAL_URL,
  process.env.ONLINE_SHOP_URL,
  process.env.CAR_RENTAL_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

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