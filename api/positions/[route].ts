import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const CTA_BASE_URL = 'https://lapi.transitchicago.com/api/1.0';
const API_KEY = process.env.CTA_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    res.status(500).json({ error: 'Server missing CTA API Key' });
    return;
  }

  const { route } = req.query;

  if (!route || typeof route !== 'string') {
    res.status(400).json({ error: 'Missing route parameter' });
    return;
  }

  try {
    const response = await axios.get(`${CTA_BASE_URL}/ttpositions.aspx`, {
      params: {
        key: API_KEY,
        rt: route,
        outputType: 'JSON'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch positions', details: message });
  }
}
