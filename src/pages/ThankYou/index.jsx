import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectLastOrder, clearLastOrder } from '../../features/orders/ordersSlice';

const ThankYou = () => {
  const order = useSelector(selectLastOrder);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No recent order</h1>
            <p className="text-gray-600 mb-6">Place an order to see your receipt here.</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700">
              Go to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleBackHome = () => {
    dispatch(clearLastOrder());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thank you for your order</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Order <span className="font-semibold text-gray-900">{order.id ?? order._id}</span> •{' '}
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/shop" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={handleBackHome}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Home
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 lg:grid lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.key} className="py-4 flex gap-4">
                    <img
                      src={item.image || 'https://via.placeholder.com/100?text=No+Image'}
                      alt={item.name}
                      className="h-20 w-20 rounded-md object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          {(item.size || item.color) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.size ? `Size: ${item.size}` : ''}
                              {item.size && item.color ? ' • ' : ''}
                              {item.color ? `Color: ${item.color}` : ''}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                      {item.slug && (
                        <Link to={`/product/${item.slug}`} className="mt-2 inline-flex text-xs font-medium text-indigo-600 hover:text-indigo-500">
                          View product
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${(order.itemsPrice ?? order.totals?.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {(order.shippingPrice ?? order.totals?.shipping ?? 0) === 0
                        ? 'Free'
                        : `$${(order.shippingPrice ?? order.totals?.shipping ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <span className="text-gray-900 font-semibold">Total</span>
                    <span className="text-gray-900 font-semibold">${(order.totalPrice ?? order.totals?.total ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900">Delivery address</h3>
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{order.shippingAddress?.fullName ?? order.address?.fullName}</p>
                    <p>{order.shippingAddress?.address ?? order.address?.line1}</p>
                    {order.address?.line2 ? <p>{order.address.line2}</p> : null}
                    <p>
                      {order.shippingAddress?.city ?? order.address?.city}
                      {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : order.address?.state ? `, ${order.address.state}` : ''}
                      {' '}
                      {order.shippingAddress?.postalCode ?? order.address?.postalCode}
                    </p>
                    <p>
                      {(order.shippingAddress?.country ?? order.address?.country) || ''}
                    </p>
                    <p>{order.shippingAddress?.phone ?? order.address?.phone}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900">Payment</h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="capitalize">{order.paymentMethod ?? order.payment?.method}</p>
                    {(order.paymentMethod ?? order.payment?.method) === 'upi' ? (
                      <p className="text-gray-600">{order.payment?.upiId}</p>
                    ) : (
                      <p className="text-gray-600">{order.payment?.card?.cardNumber}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-gray-500">
                    This is a demo receipt. No payment was processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
