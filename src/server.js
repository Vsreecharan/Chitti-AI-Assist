// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: message,
        max_tokens: 150,
        stop: ['\n', 'Human:', 'AI:'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer OPENAI_API_KEY`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
