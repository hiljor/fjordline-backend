import express from 'express';
import departureRoutes from './routes/departures';

const app = express();
app.use(express.json());

app.use('/departures', departureRoutes);

export default app;