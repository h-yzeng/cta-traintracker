import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const CTA_BASE_URL = 'https://lapi.transitchicago.com/api/1.0';
const API_KEY = process.env.CTA_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    res.status(500).json({ error: 'Server missing CTA API Key' });
    return;
  }

  const { mapId } = req.query;

  if (!mapId || typeof mapId !== 'string') {
    res.status(400).json({ error: 'Missing mapId parameter' });
    return;
  }

  try {
    const response = await axios.get(`${CTA_BASE_URL}/ttarrivals.aspx`, {
      params: {
        key: API_KEY,
        mapid: mapId,
        outputType: 'JSON'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch arrivals', details: message });
  }
}
