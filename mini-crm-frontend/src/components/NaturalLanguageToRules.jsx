// src/components/NaturalLanguageToRules.jsx
import React, { useState } from 'react';
import api from '../utils/api';

function NaturalLanguageToRules({ setRules }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRules = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/api/generate-rules', { prompt });
      setRules(response.data.rules);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate rules');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">Describe your audience in plain English:</label>
      <input
        type="text"
        placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5K"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={generateRules}
        disabled={isLoading}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isLoading ? 'Generating...' : 'Generate Rules'}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

export default NaturalLanguageToRules;
