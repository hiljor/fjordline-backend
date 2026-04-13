import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { departures } from '../data/seed';
import { 
  Departure, 
  DepartureResponse, 
  DepartureResponseSchema 
} from '../types';

const router = Router();

// --- Helper Functions ---

/**
 * Tranform an internal Departure object to a DepartureResponse.
 */
const mapToResponse = (departure: Departure): DepartureResponse => {
  return {
    id: departure.id,
    legs: departure.legs.map(leg => ({
      from: leg.from,
      to: leg.to,
      departureTime: leg.departureTime,
      arrivalTime: leg.arrivalTime,
      freeSeats: departure.maxPassengerCapacity - leg.occupiedPassengerCapacity,
      hasVehicleCapacity: leg.occupiedVehicleCapacity < departure.maxVehicleCapacity
    }))
  };
};

// --- Routes ---

/**
 * GET /departures
 */
router.get('/', (req: Request, res: Response) => {
  const response: DepartureResponse[] = departures.map(mapToResponse);
  res.json(response);
});

/**
 * GET /departures/:id
 */
router.get('/:id', (req: Request, res: Response) => {

  const idValidation = z.uuid().safeParse(req.params.id);
  
  if (!idValidation.success) {
    return res.status(400).json({ error: "Ugyldig ID-format" });
  }

  const departure = departures.find(d => d.id === idValidation.data);

  if (!departure) {
    return res.status(404).json({ error: "Avgang ikke funnet" });
  }

  res.json(mapToResponse(departure));
});

export default router;