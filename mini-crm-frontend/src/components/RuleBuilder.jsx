// src/components/RuleBuilder.js
import React, { useState } from 'react';

const fields = [
  { label: 'Total Spend', value: 'totalSpend' },
  { label: 'Visits', value: 'visits' },
  { label: 'Last Active (days ago)', value: 'lastActive' }
];

const operators = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '=', value: '=' },
  { label: '!=', value: '!=' }
];

export default function RuleBuilder({ rules = [], setRules }) {
  const addRule = () => setRules([...rules, { field: '', operator: '', value: '' }]);
  const updateRule = (idx, key, val) => {
    const updated = [...rules];
    updated[idx][key] = val;
    setRules(updated);
  };
  const removeRule = idx => setRules(rules.filter((_, i) => i !== idx));

  const getInputType = (field) => {
    switch (field) {
      case 'totalSpend':
      case 'visits':
      case 'lastActive':
        return 'number';
      default:
        return 'text';
    }
  };

  const getPlaceholder = (field) => {
    switch (field) {
      case 'totalSpend':
        return 'Enter amount';
      case 'visits':
        return 'Enter number of visits';
      case 'lastActive':
        return 'Enter days ago';
      default:
        return 'Enter value';
    }
  };

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-700 mb-4">Audience Rules</h4>
      {rules.map((rule, idx) => (
        <div key={idx} className="flex flex-wrap gap-2 mb-4 items-center">
          <select 
            value={rule.field} 
            onChange={e => updateRule(idx, 'field', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Field</option>
            {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select 
            value={rule.operator} 
            onChange={e => updateRule(idx, 'operator', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Operator</option>
            {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type={getInputType(rule.field)}
            placeholder={getPlaceholder(rule.field)}
            value={rule.value}
            onChange={e => updateRule(idx, 'value', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={rule.field === 'lastActive' ? '0' : undefined}
          />
          <button 
            onClick={() => removeRule(idx)}
            className="px-3 py-2 text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      ))}
      <button 
        onClick={addRule}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
      >
        Add Rule
      </button>
    </div>
  );
}
