import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function LaunchCampaign() {
  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [message, setMessage] = useState('');
  const [segments, setSegments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [objective, setObjective] = useState('');
  const [suggestedMessages, setSuggestedMessages] = useState([]);
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  const navigate = useNavigate();

  // Fetch available segments on mount
  useEffect(() => {
    console.log('Fetching segments...');
    api.get('/api/segments')
      .then(({ data }) => {
        console.log('Raw API Response:', data);
        setSegments(data || []);
      })
      .catch(err => {
        console.error('Error fetching segments:', err);
        setError('Failed to load segments');
      });
  }, []);

  // Add a debug log for segments state
  useEffect(() => {
    console.log('Current segments state:', segments);
  }, [segments]);

  const handleLaunch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/campaigns/', { name, segmentId, message });
      alert('Campaign launched successfully!');
      setName('');
      setSegmentId('');
      setMessage('');
      // Optionally redirect to campaign history
      navigate('/campaigns/history');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to launch campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMessages = async () => {
    setIsGeneratingMessages(true);
    setSuggestedMessages([]);
    try {
      const { data } = await api.post('/api/generate-messages', { objective });
      setSuggestedMessages(data.messages || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate messages');
    } finally {
      setIsGeneratingMessages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Launch Campaign
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Create and launch targeted marketing campaigns to your customer segments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleLaunch} className="space-y-8">
              {/* Campaign Name Section */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">Campaign Details</h2>
                    <p className="text-sm text-gray-500">Name your campaign for easy reference</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g., Summer Sale 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                  required
                />
              </div>

              {/* Segment Selection Section */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">Target Audience</h2>
                    <p className="text-sm text-gray-500">Select the segment to target with this campaign</p>
                  </div>
                </div>
                <select
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50"
                  required
                >
                  <option value="">Choose a segment</option>
                  {segments && segments.length > 0 ? (
                    segments.map((segment) => (
                      <option key={segment._id} value={segment._id}>
                        {segment.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No segments available</option>
                  )}
                </select>
              </div>

              {/* Campaign Message Section */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">Campaign Message</h2>
                    <p className="text-sm text-gray-500">Craft your message to engage your audience</p>
                  </div>
                </div>

                {/* AI Message Generation */}
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="e.g., bring back inactive users"
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={generateMessages}
                      disabled={!objective.trim() || isGeneratingMessages}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isGeneratingMessages ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Suggest Messages
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Suggested Messages */}
                {suggestedMessages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Messages</h3>
                    <div className="space-y-2">
                      {suggestedMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          onClick={() => setMessage(msg)}
                          className="cursor-pointer bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                        >
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your campaign message..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 resize-none"
                  required
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Launching Campaign...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Launch Campaign
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
