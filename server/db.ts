import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
