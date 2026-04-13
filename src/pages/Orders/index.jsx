import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api/orderApi';
import { useAuth } from '../../context/useAuth';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await orderApi.getMyOrders();
        const data = res.data?.orders || res.data || [];
        const serverOrders = Array.isArray(data) ? data : [];
        let localOrders = [];
        try {
          const key = user?._id ? `orders:${user._id}` : 'orders:guest';
          const raw = localStorage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : [];
          localOrders = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          void e;
        }
        setOrders([...localOrders, ...serverOrders]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Loading your orders</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900">Failed to load orders</h3>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <Link to="/shop" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Place your first order to see it here.</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order._id} className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">
                        Order <span className="font-semibold text-gray-900">{order._id}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                      </p>
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>
                          <span className="font-medium">Payment:</span> {order.isPaid ? 'Paid' : 'Unpaid'} ({order.paymentMethod})
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {order.status || 'pending'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${(order.totalPrice ?? 0).toFixed(2)}
                      </p>
                      <Link to="/thank-you" className="mt-2 inline-flex text-xs font-medium text-indigo-600 hover:text-indigo-500">
                        View details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
