import express from 'express';
import departureRoutes from './routes/departures';
import { loggerMiddleware } from './middleware/logger';

const app = express();
app.use(express.json());
app.use(loggerMiddleware)

// Simple health check, added here to avoid middleware checks
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/departures', departureRoutes);



export default app;