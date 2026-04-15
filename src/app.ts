import express from 'express';
import departureRoutes from './routes/departures';
import { loggerMiddleware } from './middleware/logger';

const app = express();
app.use(express.json());
app.use(loggerMiddleware)

// Simple health check, added here to avoid middleware checks
app.get('/health', (req, res) => {
  // if database in use, check connection here

  // answer
  res.status(200).json({
    status: 'UP',
    version: process.env.npm_package_version || '1.0.0', 
    uptime: process.uptime(), // Seconds since start
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/departures', departureRoutes);



export default app;