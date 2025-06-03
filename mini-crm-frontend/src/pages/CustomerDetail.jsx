import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    api.get(`/api/customers/${id}`)
      .then(res => setCustomer(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
      <div className="space-y-4">
        <p><span className="font-semibold">Name:</span> {customer.name}</p>
        <p><span className="font-semibold">Email:</span> {customer.email}</p>
        <p><span className="font-semibold">Total Spend:</span> {customer.totalSpend}</p>
        <p><span className="font-semibold">Last Active:</span> {new Date(customer.lastActive).toLocaleString()}</p>
        <p><span className="font-semibold">Visits:</span> {customer.visits}</p>
      </div>
      <Link to="/customers" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Back to Customers
      </Link>
    </div>
  );
}

export default CustomerDetail;
