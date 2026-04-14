import express from 'express';
import departureRoutes from './routes/departures';
import { loggerMiddleware } from './middleware/logger';

const app = express();
app.use(express.json());
app.use(loggerMiddleware)

app.use('/departures', departureRoutes);

export default app;