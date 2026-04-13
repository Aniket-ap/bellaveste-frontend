import React, { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { Header, Footer } from "./components/layout";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import { ForgotPassword, Login, Register, ResetPassword } from "./pages/Auth";
import Profile from "./pages/Profile";

const Home = React.lazy(() => import("./pages/Home"));
const Shop = React.lazy(() => import("./pages/Shop"));
const Error = React.lazy(() => import("./components/ui/Error"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const ThankYou = React.lazy(() => import("./pages/ThankYou/index.jsx"));
const Orders = React.lazy(() => import("./pages/Orders"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <Suspense
            fallback={
              <>
                <div role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route 
                path="/checkout" 
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                } 
              />
              <Route path="/thank-you" element={<ThankYou />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />

              <Route path="*" element={<Error />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
