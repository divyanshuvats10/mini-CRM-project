// routes/api.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// router.post('/generate-rules', async (req, res) => {
//   try {
//     const { prompt } = req.body;
    
//     if (!process.env.OPENAI_API_KEY) {
//       console.error('OPENAI_API_KEY is not set in environment variables');
//       return res.status(500).json({ error: 'OpenAI API key is not configured' });
//     }

//     if (!prompt) {
//       return res.status(400).json({ error: 'Prompt is required' });
//     }

//     console.log('Making request to OpenAI with prompt:', prompt);
    
//     const response = await axios.post('https://api.openai.com/v1/chat/completions', {
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: "Convert the user's prompt into logical rules for a CRM segment. Return only a JSON array of rules, each with 'field', 'operator', and 'value'. Example: [{\"field\": \"lastActive\", \"operator\": \">\", \"value\": \"180\"}, {\"field\": \"totalSpend\", \"operator\": \">\", \"value\": \"5000\"}]"
//         },
//         { role: "user", content: prompt }
//       ]
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//       }
//     });

//     console.log('OpenAI response:', response.data);
    
//     if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
//       throw new Error('Invalid response format from OpenAI');
//     }

//     const rules = JSON.parse(response.data.choices[0].message.content);
//     res.json({ rules });
//   } catch (err) {
//     console.error('Error in generate-rules:', err);
//     if (err.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       console.error('OpenAI API Error Response:', err.response.data);
//       return res.status(500).json({ 
//         error: 'OpenAI API error',
//         details: err.response.data
//       });
//     } else if (err.request) {
//       // The request was made but no response was received
//       console.error('No response received from OpenAI API');
//       return res.status(500).json({ 
//         error: 'No response from OpenAI API',
//         details: err.message
//       });
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       return res.status(500).json({ 
//         error: 'Error processing request',
//         details: err.message
//       });
//     }
//   }
// });

// routes/api.js (Gemini example)
router.post('/generate-rules', async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Add to .env
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Convert this prompt into CRM segment rules: "${prompt}". Return JSON array with "field"(totalSpend,visits,lastActive), "operator", "value". Example: [{"field":"totalSpend","operator":">","value":"1000"}], do not add formatting tags`
          }]
        }]
      }
    );


    console.log(response.data);
    console.log(response.data.candidates[0].content.parts[0].text);
    const rules = JSON.parse(response.data.candidates[0].content.parts[0].text);
    res.json({ rules });
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: 'Failed to generate rules' });
  }
});


// routes/api.js or wherever you handle AI features
router.post('/generate-messages', async (req, res) => {
  try {
    const { objective } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Add to .env
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Generate a message for this campaign objective: "${objective}" for {name} users. Return only a JSON strings without formatting tags. Example: ["Hi! We miss you. Here's a special offer just for you.", "Welcome back! Enjoy 10% off your next purchase."] ,strictly do not add formatting tags for the json array`
          }]
        }]
      }
    );
    let text = data.candidates[0].content.parts[0].text;
    console.log('Raw response:', text);
    
    // Remove Markdown code block if present and clean up the text
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '').trim();
    }
    
    // Clean up any extra whitespace and newlines
    text = text.replace(/\n\s*/g, ' ').trim();
    console.log('Cleaned text:', text);
    
    const messages = JSON.parse(text);
    res.json({ messages });
  } catch (err) {
    console.error('Error generating messages:', err);
    res.status(500).json({ error: 'Failed to generate messages' });
  }
});



module.exports = router;
