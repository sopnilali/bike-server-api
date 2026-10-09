import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://bike-project-kappa.vercel.app',
      process.env.FRONTEND_URL,
    ].filter((o): o is string => Boolean(o)),
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bike Servicing Management API is running',
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
