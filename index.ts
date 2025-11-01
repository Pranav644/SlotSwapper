import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient, EventStatus, SwapStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authRequired, getUserFromToken } from './auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import swapRoutes from './routes/swap';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', swapRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});