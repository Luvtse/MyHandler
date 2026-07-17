import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport';
import { errorHandler } from './middlewares/error';
import { apiRouter } from './services/apiService';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  // Initialize Passport
  app.use(passport.initialize());

  app.use('/api', apiRouter);

  // Serve uploaded files
  const uploadsDir = path.resolve(process.cwd(), 'server', 'uploads');
  app.use('/files', express.static(uploadsDir));

  app.use(errorHandler);
  return app;
}