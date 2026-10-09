import express from 'express';
import cors from 'cors';
import routes from './routes';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000'
    ].filter(Boolean),
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
