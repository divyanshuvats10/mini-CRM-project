import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, Link } from 'react-router-dom';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/api/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="space-y-4">
        <p><span className="font-semibold">Customer Email:</span> {order.customerEmail}</p>
        <p><span className="font-semibold">Amount:</span> {order.amount}</p>
        <p><span className="font-semibold">Date:</span> {order.date ? new Date(order.date).toLocaleString() : '-'}</p>
        <p><span className="font-semibold">Items:</span></p>
        <ul className="list-disc pl-5">
          {order.items?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <Link to="/orders" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Back to Orders
      </Link>
    </div>
  );
}

export default OrderDetail;
