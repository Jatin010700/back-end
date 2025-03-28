import dotenv from "dotenv";

dotenv.config();

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.LOCAL_URL || process.env.CAR_RENTAL_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_BASE_URL,
  secret: process.env.AUTH0_CLIENT_KEY,
};

export default authConfig;
