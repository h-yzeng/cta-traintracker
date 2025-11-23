import express from "express";
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CTA_BASE_URL = 'http://lapi.transitchicago.com/api/1.0';
const API_KEY = process.env.CTA_API_KEY;

app.use(cors());
app.use(express.json());

const checkKey = (_req: Request, res: Response, next: NextFunction) => {
  if (!API_KEY) {
    res.status(500).json({ error: 'Server missing CTA API Key' });
    return;
  }
  next();
};

app.get('/api/arrivals/:mapId', checkKey, async (req: Request, res: Response) => {
  try {
    const { mapId } = req.params;
    const response = await axios.get(`${CTA_BASE_URL}/ttarrivals.aspx`, {
      params: {
        key: API_KEY,
        mapid: mapId,
        outputType: 'JSON'
      }
    });
    res.json(response.data);
  } catch (error) {
    const errorMessage = (error as Error).message; 
    res.status(500).json({ error: 'Failed to fetch arrivals', details: errorMessage });
  }
});

app.get('/api/positions/:route', checkKey, async (req: Request, res: Response) => {
  try {
    const { route } = req.params;
    const response = await axios.get(`${CTA_BASE_URL}/ttpositions.aspx`, {
      params: {
        key: API_KEY,
        rt: route,
        outputType: 'JSON'
      }
    });
    res.json(response.data);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: 'Failed to fetch positions', details: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});