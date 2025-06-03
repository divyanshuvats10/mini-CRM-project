import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import RuleBuilder from '../components/RuleBuilder';
import NaturalLanguageToRules from '../components/NaturalLanguageToRules';
// import Navbar from '../components/Navbar'; // Uncomment if you want to use Navbar

export default function CreateSegment() {
  const [name, setName] = useState('');
  const [rules, setRules] = useState([]);
  const [previewCount, setPreviewCount] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch total customer count on component mount
  useEffect(() => {
    const fetchTotalCustomers = async () => {
      try {
        const response = await api.get('/api/customers/count');
        setTotalCustomers(response.data.count);
      } catch (error) {
        console.error('Error fetching total customers:', error);
      }
    };
    fetchTotalCustomers();
  }, []);

  const generateRules = async () => {
    if (aiPrompt.trim() === '') return;
    
    setIsGenerating(true);
    try {
      const { data } = await api.post('/api/generate-rules', { prompt: aiPrompt });
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error generating rules:', error);
      alert('Error generating rules. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewAudience = async () => {
    try {
      const { data } = await api.post('/api/segments/preview', { rules });
      setPreviewCount(data.count);
    } catch (err) {
      alert('Error previewing audience');
    }
  };

  const saveSegment = async () => {
    try {
      await api.post('/api/segments', { name, rules });
      alert('Segment saved!');
      // Optionally, clear form or redirect here
    } catch (err) {
      alert('Error saving segment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* <Navbar /> */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Create Audience Segment
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Define your target audience using AI-powered rules or manual controls
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-blue-800 font-medium">Total Customers: {totalCustomers}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Segment Name Section - Moved to first position */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Segment Details</h2>
                  <p className="text-sm text-gray-500">Name your segment for easy reference</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Enter segment name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50"
              />
            </div>

            {/* AI Prompt Section - Moved to second position */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">AI-Powered Rule Generation</h2>
                  <p className="text-sm text-gray-500">Describe your audience in plain English</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5K"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                />
                <button
                  onClick={generateRules}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-fit"
                >
                  {isGenerating ? (
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
                      Generate Rules
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Rule Builder Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Rule Builder</h2>
                  <p className="text-sm text-gray-500">Fine-tune your audience selection rules</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <RuleBuilder rules={rules} setRules={setRules} />
              </div>
            </div>

            {/* Preview and Save Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={previewAudience}
                  className="w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 min-w-[180px]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Audience Size
                </button>
                {previewCount !== null && (
                  <div className="w-auto bg-white border border-gray-200 rounded-xl px-6 py-3 flex items-center justify-center min-w-[180px]">
                    <span className="text-gray-700">
                      Audience Size: <span className="font-bold text-indigo-600">{previewCount}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={saveSegment}
                  className="w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Segment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
