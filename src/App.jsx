import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/navbar.jsx";

import SignIn from "../src/pages/SignInPage.jsx";
import SignUp from "../src/pages/SignUpPage.jsx";

import CartPage from "../src/pages/CartPage.jsx";

import Checkout from "./pages/Checkout.jsx";
import { RequireAuth } from "./contexts/AuthContext.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";

import About from "./pages/About.jsx";

import SafetyPage from "./pages/SafetyPage.jsx";

import ProductDetails from "./pages/ProductDetails.jsx";

import Home from "./pages/Home.jsx";

import { getPublicItems } from "./services/api";

// import "./styles/navbar.css";

// import "../src/styles/cart.css"

export default function App() {

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    getPublicItems()
      .then((data) => {
        // normalize API response: some backends return { results: [...] } or { items: [...] }
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data?.results && Array.isArray(data.results)) items = data.results;
        else if (data?.items && Array.isArray(data.items)) items = data.items;
        else if (data?.data && Array.isArray(data.data)) items = data.data;
        else {
          // fallback: if data looks like an object with numeric keys, try to map values
          console.log('[App] getPublicItems returned unexpected shape:', data);
        }

        if (mounted) setProducts(items);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      });
    return () => { mounted = false };
  }, []);

  const handleAddToCart =(product) => {
    const isProductInCart = cartItems.find((item) => item.id === product.id);

    if (isProductInCart) {
      alert("product is already in the cart");
    } else {
      setCartItems((prevItems) => [...prevItems, product] )
    }

  }
    

   
   
   
   
    const updateQty = (id, type) => {
    setCartItems(cartItems.map(item =>
      item.id === id
        ? { ...item, qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1) }
        : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };


  return (
    <BrowserRouter>
      <Navbar cartItems={cartItems} />

      <Routes>
        {/* 🏠 HOME PAGE */}
        <Route
          path="/"
          element={<Home products={products}/>}
        />

        {/* 📄 PRODUCT DETAILS PAGE */}
        <Route path="/product/:id" element={<ProductDetails products={products} handleAddToCart={handleAddToCart} />} />

        {/* 🔐 AUTH PAGES */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

        {/* 🛒 CART PAGE */}
        <Route path="/cart" element={<CartPage cartItems={cartItems} updateQty={updateQty} removeItem={removeItem} />} />

        {/* ℹ️ ABOUT PAGE */}
        <Route path="/about" element={<About />} />

        {/* 💳 CHECKOUT PAGE (protected) */}
        <Route path="/checkout" element={<RequireAuth><Checkout cartItems={cartItems} clearCart={() => setCartItems([])} /></RequireAuth>} />

        {/* Order confirmation */}
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />

        {/* 🛡️ SAFETY PAGE */}
        <Route path="/safety" element={<SafetyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
