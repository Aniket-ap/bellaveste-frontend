import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { orderApi } from '../../services/api/orderApi';
import { wishlistApi } from '../../services/api/wishlistApi';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [tab, setTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const userKey = user?._id ? `addresses:${user._id}` : 'addresses:guest';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    const result = await updateProfile(formData);
    if (result.success) {
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem(userKey);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setTimeout(() => {
          setAddresses(Array.isArray(data) ? data : []);
        }, 0);
      } catch {
        setTimeout(() => {
          setAddresses([]);
        }, 0);
      }
    }
  }, [userKey]);

  useEffect(() => {
    if (tab === 'purchases') {
      setTimeout(() => {
        setLoadingTab(true);
      }, 0);
      orderApi.getMyOrders()
        .then((res) => {
          const data = res.data?.orders || res.data || [];
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch((e) => {
          void e;
        })
        .finally(() => setLoadingTab(false));
    } else if (tab === 'wishlist') {
      setTimeout(() => {
        setLoadingTab(true);
      }, 0);
      wishlistApi.get()
        .then((res) => {
          const data = res.data?.wishlist || res.data?.data?.wishlist || res.data || [];
          setWishlist(Array.isArray(data) ? data : (Array.isArray(res.data?.products) ? res.data.products : []));
        })
        .catch((e) => {
          void e;
        })
        .finally(() => setLoadingTab(false));
    }
  }, [tab]);

  const saveAddresses = (next) => {
    setAddresses(next);
    try {
      localStorage.setItem(userKey, JSON.stringify(next));
    } catch {
      console.error('Failed to save addresses');
    }
  };

  const addAddress = (addr) => {
    const next = [...addresses];
    if (addr.isDefault) {
      for (const a of next) a.isDefault = false;
    }
    next.push({ id: `addr_${Date.now()}`, ...addr });
    saveAddresses(next);
  };

  const updateAddress = (id, patch) => {
    const next = addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
    if (patch.isDefault) {
      for (const a of next) if (a.id !== id) a.isDefault = false;
    }
    saveAddresses(next);
  };

  const removeAddress = (id) => {
    const next = addresses.filter((a) => a.id !== id);
    saveAddresses(next);
  };

  const purchasedItems = useMemo(() => {
    const list = [];
    for (const o of orders) {
      const items = o.items || o.orderItems || [];
      for (const it of items) {
        const pid = it.product?._id || it.product || it.productId || it.id;
        const key = pid || `${it.name}-${it.price}`;
        list.push({
          key,
          productId: pid,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image || it.product?.image || '',
          variant: it.variant || {},
          orderId: o._id,
          createdAt: o.createdAt,
        });
      }
    }
    return list;
  }, [orders]);

  const avatarUrl =
    user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const roleLabel = `${(user?.role || 'User').toString()} Account`;

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link
            to="/"
            className="h-11 w-11 rounded-full bg-black/5 text-[color:var(--bv-text)] flex items-center justify-center"
          >
            <span className="sr-only">Back</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Account</div>
            <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-[color:var(--bv-text)]">PROFILE</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="h-11 px-5 rounded-full bg-red-600 text-white text-xs tracking-[0.18em] uppercase hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[color:var(--bv-border)] flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-5 min-w-0">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)]">
                <img className="h-full w-full object-cover" src={avatarUrl} alt={user?.name || 'User avatar'} />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-[color:var(--bv-text)] truncate">{user?.name}</div>
                <div className="mt-1 inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                  {roleLabel}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/50 p-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTab('profile')}
                className={`h-10 px-5 rounded-full text-xs tracking-[0.18em] uppercase transition-colors ${
                  tab === 'profile'
                    ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                    : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setTab('addresses')}
                className={`h-10 px-5 rounded-full text-xs tracking-[0.18em] uppercase transition-colors ${
                  tab === 'addresses'
                    ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                    : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                }`}
              >
                Addresses
              </button>
              <button
                type="button"
                onClick={() => setTab('purchases')}
                className={`h-10 px-5 rounded-full text-xs tracking-[0.18em] uppercase transition-colors ${
                  tab === 'purchases'
                    ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                    : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                }`}
              >
                Purchased
              </button>
              <button
                type="button"
                onClick={() => setTab('wishlist')}
                className={`h-10 px-5 rounded-full text-xs tracking-[0.18em] uppercase transition-colors ${
                  tab === 'wishlist'
                    ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                    : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                }`}
              >
                Wishlist
              </button>
            </div>
          </div>

          {message ? (
            <div className="px-6 sm:px-8 pt-6">
              <div className="rounded-[1.5rem] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {message}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="px-6 sm:px-8 pt-6">
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          ) : null}

          {tab === 'profile' ? (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Profile details</div>
                      <div className="mt-2 text-xl font-semibold text-[color:var(--bv-text)]">PERSONAL</div>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="h-11 px-5 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({ name: user?.name || '', email: user?.email || '' });
                            setMessage('');
                            setError('');
                          }}
                          className="h-11 px-5 rounded-full border border-[color:var(--bv-border)] text-[color:var(--bv-text)] text-xs tracking-[0.18em] uppercase hover:border-[color:var(--bv-border-strong)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="h-11 px-5 rounded-full border border-[color:var(--bv-border)] text-[color:var(--bv-text)] text-xs tracking-[0.18em] uppercase hover:border-[color:var(--bv-border-strong)] transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Full name</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                        />
                      ) : (
                        <div className="mt-2 text-sm text-[color:var(--bv-text)]">{user?.name}</div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Email</div>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                        />
                      ) : (
                        <div className="mt-2 text-sm text-[color:var(--bv-text)]">{user?.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Account</div>
                  <div className="mt-2 text-xl font-semibold text-[color:var(--bv-text)]">STATUS</div>

                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[color:var(--bv-muted)]">Status</span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${
                          user?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user?.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {user?.isBlocked ? (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[color:var(--bv-muted)]">Access</span>
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase bg-red-100 text-red-800">
                          Blocked
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[color:var(--bv-muted)]">Wishlist items</span>
                      <span className="text-[color:var(--bv-text)] font-semibold">{user?.wishlist?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[color:var(--bv-muted)]">Member since</span>
                      <span className="text-[color:var(--bv-text)] font-semibold">{memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'addresses' ? (
            <div className="p-6 sm:p-8">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Saved</div>
                  <div className="mt-2 text-xl font-semibold text-[color:var(--bv-text)]">ADDRESSES</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addAddress({
                      fullName: user?.name || '',
                      phone: '',
                      address: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: '',
                      isDefault: addresses.length === 0,
                    })
                  }
                  className="h-11 px-5 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
                >
                  Add address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-6 rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-10 text-center">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">No addresses</div>
                  <div className="mt-2 text-sm text-[color:var(--bv-text)]">Save an address for faster checkout.</div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[color:var(--bv-text)] truncate">{addr.fullName || user?.name}</div>
                          <div className="mt-2 text-sm text-[color:var(--bv-text)]">{addr.address || '—'}</div>
                          <div className="mt-1 text-sm text-[color:var(--bv-muted)]">
                            {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ') || '—'}
                          </div>
                          <div className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">{addr.country || '—'}</div>
                          {addr.phone ? (
                            <div className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">{addr.phone}</div>
                          ) : null}
                          {addr.isDefault ? (
                            <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase bg-green-100 text-green-800">
                              Default
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateAddress(addr.id, { isDefault: true })}
                            className="h-10 px-4 rounded-full border border-[color:var(--bv-border)] text-[color:var(--bv-text)] text-xs tracking-[0.18em] uppercase hover:border-[color:var(--bv-border-strong)] transition-colors"
                          >
                            Default
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAddress(addr.id)}
                            className="h-10 px-4 rounded-full bg-red-50 text-red-700 text-xs tracking-[0.18em] uppercase hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'purchases' ? (
            <div className="p-6 sm:p-8">
              {loadingTab ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="relative h-6 w-6">
                      <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                      <div className="absolute inset-0 rounded-full border-2 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Loading</span>
                  </div>
                </div>
              ) : purchasedItems.length === 0 ? (
                <div className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-10 text-center">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">No purchases</div>
                  <div className="mt-2 text-sm text-[color:var(--bv-text)]">You haven’t purchased anything yet.</div>
                  <Link
                    to="/shop"
                    className="mt-6 inline-flex rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-6 py-3 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
                  >
                    Shop now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchasedItems.map((it) => (
                    <div
                      key={it.key}
                      className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[color:var(--bv-surface)] border border-[color:var(--bv-border)]">
                          {it.image ? <img src={it.image} alt={it.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[color:var(--bv-text)] truncate">{it.name}</div>
                          <div className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">Qty: {it.quantity}</div>
                          <div className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                            ${Number(it.price || 0).toFixed(2)}
                          </div>
                          {(it.variant?.size || it.variant?.color) ? (
                            <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase border border-black/10 bg-black/5 text-[color:var(--bv-muted)]">
                              {[it.variant.color ? `Color: ${it.variant.color}` : null, it.variant.size ? `Size: ${it.variant.size}` : null]
                                .filter(Boolean)
                                .join(' • ')}
                            </div>
                          ) : null}
                          <div className="mt-2 text-xs text-[color:var(--bv-muted)]">Order {it.orderId}</div>
                          <div className="mt-1 text-[11px] text-[color:var(--bv-muted)]">
                            {it.createdAt ? new Date(it.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'wishlist' ? (
            <div className="p-6 sm:p-8">
              {loadingTab ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="relative h-6 w-6">
                      <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                      <div className="absolute inset-0 rounded-full border-2 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Loading</span>
                  </div>
                </div>
              ) : wishlist.length === 0 ? (
                <div className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-10 text-center">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Wishlist</div>
                  <div className="mt-2 text-sm text-[color:var(--bv-text)]">No items saved yet.</div>
                  <Link
                    to="/shop"
                    className="mt-6 inline-flex rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-6 py-3 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
                  >
                    Browse
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((p) => {
                    const id = p._id || p.productId || p.product?._id || p.id;
                    const name = p.name || p.product?.name || '';
                    const price = p.price ?? p.product?.price;
                    const image = p.image || p.product?.image;
                    return (
                      <div
                        key={id}
                        className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[color:var(--bv-surface)] border border-[color:var(--bv-border)]">
                            {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[color:var(--bv-text)] truncate">{name}</div>
                            {price != null ? (
                              <div className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                                ${Number(price).toFixed(2)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to={`/product/${id}`}
                            className="h-10 px-4 rounded-full border border-[color:var(--bv-border)] text-[color:var(--bv-text)] text-xs tracking-[0.18em] uppercase hover:border-[color:var(--bv-border-strong)] transition-colors"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await wishlistApi.remove(id);
                                setWishlist((prev) => prev.filter((w) => (w._id || w.id || w.productId) !== id));
                              } catch (err) {
                                console.error('Failed to remove from wishlist', err);
                              }
                            }}
                            className="h-10 px-4 rounded-full bg-red-50 text-red-700 text-xs tracking-[0.18em] uppercase hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Profile;
