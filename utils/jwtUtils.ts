import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWTSecretKey = process.env.AUTH0_CLIENT_KEY;

interface TokenPayload {
  id: string;
  username: string;
}

export const generateToken = (payload: TokenPayload, expiresIn = '1h'): string => {
  return jwt.sign(payload, JWTSecretKey as string, { expiresIn: '1h' });
};

export const verifyToken = (token: string): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWTSecretKey as string, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as TokenPayload);
      }
    });
  });
};