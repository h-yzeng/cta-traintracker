import express from 'express';
import type { Request, Response, NextFunction } from 'express'; 
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CTA_BASE_URL = 'https://lapi.transitchicago.com/api/1.0'; 
const API_KEY = process.env.CTA_API_KEY;

app.use(cors());
app.use(express.json());

const checkKey = (_req: Request, res: Response, next: NextFunction) => {
  if (!API_KEY) {
    console.error('❌ ERROR: CTA_API_KEY is missing from .env file');
    res.status(500).json({ error: 'Server missing CTA API Key' });
    return;
  }
  next();
};

app.get('/api/arrivals/:mapId', checkKey, async (req: Request, res: Response) => {
  try {
    const { mapId } = req.params;
    console.log(`✅ [200] GET /api/arrivals/${mapId}`);

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
    console.error(`❌ [500] Error fetching arrivals for ${req.params.mapId}: ${errorMessage}`);
    res.status(500).json({ error: 'Failed to fetch arrivals', details: errorMessage });
  }
});

app.get('/api/positions/:route', checkKey, async (req: Request, res: Response) => {
  try {
    const { route } = req.params;
    
    console.log(`✅ [200] GET /api/positions/${route}`);

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
    console.error(`❌ [500] Error fetching positions for ${req.params.route}: ${errorMessage}`);
    res.status(500).json({ error: 'Failed to fetch positions', details: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔑 API Key Status: ${API_KEY ? 'Loaded (Ends in ...' + API_KEY.slice(-4) + ')' : 'MISSING ❌'}`);
});