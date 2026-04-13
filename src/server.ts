import express from 'express';
import departureRoutes from './routes/departures';

const app = express();
app.use(express.json());

// To autoroute departures.ts routes to /departures
app.use('/departures', departureRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serve running on http://localhost:${PORT}`);
});