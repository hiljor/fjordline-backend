import express from 'express';
import { departures, bookings } from './data/seed';
import type { Booking } from './types';

const app = express();
app.use(express.json());

app.get('/departures', (req, res) => {
  res.json(departures);
});

app.get('/departures/:id/manifest', (req, res) => {
  const { id } = req.params;
  const departureBookings = bookings.filter((b: Booking) => b.departureId === id);
  res.json(departureBookings);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Fjord Line API er oppe på http://localhost:${PORT}`);
});