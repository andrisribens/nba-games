// proxyServer.ts
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/teams', async (req, res) => {
  try {
    const response = await axios.get('https://www.balldontlie.io/api/v1/teams');
    res.setHeader('Content-Type', 'application/json');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
