import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

export const loggerMiddleware = pinoHttp({
  // Request-ID
  genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
  
  // Method, Path (url), and Status Code
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Log level configuration
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',

  // Configures the transport based on environment
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname', // Keeps dev console clean
        },
      }
    : undefined, // Standard JSON in production
});