/**
 * Ecomus — React version
 * ------------------------------------------------------------
 * Drop this into a Vite + React project that already has Bootstrap 5
 * installed (same setup you used for SHOOZ):
 *
 *   npm create vite@latest ecomus-react -- --template react
 *   cd ecomus-react
 *   npm install bootstrap @fortawesome/fontawesome-free
 *
 * In main.jsx add:
 *   import 'bootstrap/dist/css/bootstrap.min.css';
 *   import 'bootstrap/dist/js/bootstrap.bundle.min.js';
 *   import '@fortawesome/fontawesome-free/css/all.min.css';
 *
 * Replace the contents of src/App.jsx with this file and run `npm run dev`.
 * Everything (Cart + Wishlist state, all sections, modals, image zoom)
 * lives in this single file, built with Context API — no extra files needed.
 * ------------------------------------------------------------
 */
import React, {
  createContext, useContext, useReducer, useEffect, useState, useRef
} from "react";

/* ============================================================
   1. DATA
============================================================ */
const CATEGORIES = ["Clothing", "Sunglasses", "Bags", "Shoes", "Fashion"];
const COLORS = ["#e8b84b", "#141414", "#c1440e", "#7a9e9f", "#d8d4c9"];
const SIZES = ["XS", "S", "M", "L", "XL"];
// Fallback image generator — only used for images that aren't in a named
// list below (e.g. if you add new products). Every image you actually see
// on the page comes from a named constant you can edit directly.
const seedImg = (seed, w = 500, h = 650) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

// ---------------------------------------------------------
// EVERY PRODUCT IMAGE, LISTED ONE BY ONE.
// Find the product by its name in the comment, then replace
// its img1 (front photo) / img2 (hover photo) link below.
// ---------------------------------------------------------
const PRODUCT_IMAGES = {
 // ---- Clothing ----
  "Clothing-0": { img1: "https://i.pinimg.com/1200x/bf/0b/e0/bf0be0397ce8eb4715db296b6a6d3f83.jpg", img2: "https://i.pinimg.com/1200x/52/54/55/5254559b384bef807f9fd07aab8c3f99.jpg" }, // Ribbed Tank Top
  "Clothing-1": { img1: "https://i.pinimg.com/736x/25/da/a8/25daa8f59d3e9c405fc35ed6fcb3b9d5.jpg", img2: "https://i.pinimg.com/736x/4b/87/3a/4b873a07578301c059d34bd2683ed090.jpg" }, // Ribbed Modal T-shirt
  "Clothing-2": { img1: "https://i.pinimg.com/1200x/68/20/24/6820246ce1dba98a537adca6b2d932e4.jpg", img2: "https://i.pinimg.com/1200x/2b/71/f7/2b71f719ef0da2c514441a72fec04d84.jpg" }, // Oversized Printed Tee
  "Clothing-3": { img1: "https://i.pinimg.com/1200x/02/7c/37/027c37ae0976099d1016dbdd0549d055.jpg", img2: "https://i.pinimg.com/1200x/1b/e7/57/1be757450f265870391e52a594d1c302.jpg" }, // V-neck Linen T-shirt
  "Clothing-4": { img1: "https://i.pinimg.com/1200x/64/2e/b4/642eb4892c59c7d64543c5094a4a9fbc.jpg", img2: "https://i.pinimg.com/736x/36/95/97/369597858e4367cd2c2be3eec4b70813.jpg" }, // Loose Fit Sweatshirt
  "Clothing-5": { img1: "https://i.pinimg.com/736x/e2/0e/38/e20e3878b4a1e9014afc1bdec9151411.jpg", img2: "https://i.pinimg.com/736x/e5/58/e7/e558e7a957b0bf0aaa78a7c564b6cba4.jpg" }, // Regular Fit Oxford Shirt
  "Clothing-6": { img1: "https://i.pinimg.com/736x/87/1d/d4/871dd4a596d396dc2fb01ed2c7e7b018.jpg", img2: "https://i.pinimg.com/736x/34/e5/3b/34e53bbc34c0b792321ad14907a08595.jpg" }, // Loose Fit Hoodie
  "Clothing-7": { img1: "https://i.pinimg.com/736x/1a/dd/f5/1addf5ef0e69b16d93bc1071f31ec67b.jpg", img2: "https://i.pinimg.com/736x/d8/f4/13/d8f413ca93bbc1c7f4f98740012b488c.jpg" }, // Wide Leg Trousers
  // ---- Sunglasses ----
  "Sunglasses-0": { img1: "https://i.pinimg.com/1200x/a6/28/92/a628925e22abd2ff86056dfda304d844.jpg", img2: "https://i.pinimg.com/736x/b0/fd/2b/b0fd2bd8b5c8f06f39d008a81b2dafd5.jpg" }, // Classic Tortoise Sunglasses
  "Sunglasses-1": { img1: "https://i.pinimg.com/736x/39/7c/dc/397cdc45f905882094e6d3187e3b750d.jpg", img2: "https://i.pinimg.com/736x/9e/b8/a1/9eb8a119ff36a56d2028991ea3aeff98.jpg" }, // Square Frame Sunglasses
  "Sunglasses-2": { img1: "https://i.pinimg.com/736x/d0/ce/13/d0ce13a82070277f9c30bfc9c0936688.jpg", img2: "https://i.pinimg.com/736x/b2/ce/e4/b2cee491f2b8cc4d5fb4860af57b778f.jpg" }, // Oversized Cat-eye
  "Sunglasses-3": { img1: "https://i.pinimg.com/736x/43/db/55/43db55fade9d175fa7ea946a8ea54068.jpg", img2: "https://i.pinimg.com/736x/d0/35/ea/d035ead58105dd4c9605e83058aff0ef.jpg" }, // Retro Round Sunglasses
  "Sunglasses-4": { img1: "https://i.pinimg.com/736x/5a/3b/c0/5a3bc0738105a7b719c8210835e9021c.jpg", img2: "https://i.pinimg.com/736x/19/32/ee/1932ee355f28ad82afae5ebacd8d81a6.jpg" }, // Aviator Sunglasses
  "Sunglasses-5": { img1: "https://i.pinimg.com/1200x/6d/16/6c/6d166cd125a1903ba62714b250e460da.jpg", img2: "https://i.pinimg.com/736x/c4/2b/12/c42b1214bbab3f1ea1c060a6fff68d22.jpg" }, // Sport Wrap Sunglasses
  "Sunglasses-6": { img1: "https://i.pinimg.com/736x/f4/b5/a1/f4b5a1649352ed69a02330f35a49e626.jpg", img2: "https://i.pinimg.com/736x/b7/97/c0/b797c0d7587b5e4697dd9e2cf5ea9fcb.jpg" }, // Gradient Lens Sunglasses
  "Sunglasses-7": { img1: "https://i.pinimg.com/736x/3b/a1/28/3ba128f1542ba786de489c2ac85a0457.jpg", img2: "https://i.pinimg.com/1200x/d8/68/cb/d868cbfe7eb6df83c001d3c45c1e0011.jpg" }, // Slim Metal Frame
  // ---- Bags ----
  "Bags-0": { img1: "https://i.pinimg.com/1200x/15/6e/35/156e35c5cf61f951397a9e9c13f4f202.jpg", img2: "https://i.pinimg.com/736x/c9/a5/c7/c9a5c79b5fb57936e0bf17c281793f50.jpg" }, // Structured Tote Bag
  "Bags-1": { img1: "https://i.pinimg.com/736x/5d/cd/18/5dcd18648c9ce207e9f9987674937a8d.jpg", img2: "https://i.pinimg.com/736x/e8/64/a7/e864a75ee7f75d57a30dfed510ec3933.jpg" }, // Mini Crossbody Bag
  "Bags-2": { img1: "https://i.pinimg.com/736x/90/f9/d6/90f9d6f8f55541997beb050115fd7bc0.jpg", img2: "https://i.pinimg.com/736x/e1/ba/c3/e1bac356eac3ed76e37d36c006f3689d.jpg" }, // Leather Shoulder Bag
  "Bags-3": { img1: "https://i.pinimg.com/1200x/5f/46/76/5f46766bb02b4821f7f14277bc2ea093.jpg", img2: "https://i.pinimg.com/736x/fe/4e/a7/fe4ea7828c9fee6d15d9e0f095f525fe.jpg" }, // Woven Beach Bag
  "Bags-4": { img1: "https://i.pinimg.com/1200x/3d/84/41/3d84412269b2bd1c027b0541173ecaa7.jpg", img2: "https://i.pinimg.com/736x/0e/43/ad/0e43ad226b73c77b33fa4f0014781f9e.jpg" }, // Quilted Chain Bag
  "Bags-5": { img1: "https://i.pinimg.com/1200x/50/dc/07/50dc073a6763d573a77f228f90b1b241.jpg", img2: "https://i.pinimg.com/736x/6c/b6/78/6cb678c7cb1d205182d93842098ff953.jpg" }, // Canvas Backpack
  "Bags-6": { img1: "https://i.pinimg.com/1200x/05/fa/74/05fa7420df87186a8471ce665c1831b1.jpg", img2: "https://i.pinimg.com/1200x/f9/ed/ea/f9edea2790fb6dd5c6220bdb33ae3ff4.jpg" }, // Top Handle Satchel
  "Bags-7": { img1: "https://i.pinimg.com/736x/58/1a/f2/581af23b5e70eae17341de6019e24a58.jpg", img2: "https://i.pinimg.com/1200x/8d/bb/ce/8dbbce7a1f960d75611c1f185211eed7.jpg" }, // Drawstring Bucket Bag
  // ---- Shoes ----
  "Shoes-0": { img1: "https://i.pinimg.com/736x/e0/ed/99/e0ed998db0690f98129ddef200d75115.jpg", img2: "https://i.pinimg.com/736x/96/95/b2/9695b2843a286f0c32d8eaca8a4f9fe8.jpg" }, // Chunky Sneakers
  "Shoes-1": { img1: "https://i.pinimg.com/1200x/dc/98/f7/dc98f70a54ff5994745a92a75edaae14.jpg", img2: "https://i.pinimg.com/736x/b3/4e/e6/b34ee64cff9b9d242c35e536c233efb8.jpg" }, // Suede Ankle Boots
  "Shoes-2": { img1: "https://i.pinimg.com/1200x/31/8b/0e/318b0e3ffc74dbe5ca21ea6ce9e3749e.jpg", img2: "https://i.pinimg.com/736x/49/9e/83/499e83502232350f75a1a3c014a80cec.jpg" }, // Platform Loafers
  "Shoes-3": { img1: "https://i.pinimg.com/736x/ba/a3/38/baa3380036d7ff9e71dc5a54c3118baa.jpg", img2: "https://i.pinimg.com/1200x/00/34/29/00342901eaed69f5920d88371965d933.jpg" }, // Classic White Sneakers
  "Shoes-4": { img1: "https://i.pinimg.com/1200x/64/0c/73/640c73ec9772785545c01f67ce7da975.jpg", img2: "https://i.pinimg.com/736x/7f/8e/cc/7f8eccb028238a4099b3cf73b34b579b.jpg" }, // Strappy Sandals
  "Shoes-5": { img1: "https://i.pinimg.com/736x/c4/e8/8c/c4e88c9a9ce15a00546cbb759b0cca73.jpg", img2: "https://i.pinimg.com/1200x/bc/89/9b/bc899b59652cfc91bcc87fef37ece2b0.jpg" }, // Combat Boots
  "Shoes-6": { img1: "https://i.pinimg.com/736x/5e/9f/e5/5e9fe5e77cab7519919e6ed554fe3136.jpg", img2: "https://i.pinimg.com/736x/49/eb/26/49eb2660c20a98a03174980b4a0901e5.jpg" }, // Slip-on Mules
  "Shoes-7": { img1: "https://i.pinimg.com/736x/01/7d/20/017d2017a80c4fab9d8ccf884506f46b.jpg", img2: "https://i.pinimg.com/736x/d7/d5/35/d7d5351eb3b3355244a846d9d3e1d033.jpg" }, // Running Trainers
  // ---- Fashion ----
  "Fashion-0": { img1: "https://i.pinimg.com/736x/ac/53/a0/ac53a083b30dc6ccfe7796218264e570.jpg", img2: "https://i.pinimg.com/736x/80/4b/ee/804bee96f0dba291258df3b27ac5e3af.jpg" }, // Silk Printed Scarf
  "Fashion-1": { img1: "https://i.pinimg.com/736x/ff/0c/48/ff0c489ab3cc0f1363487ceaff7e0ac2.jpg", img2: "https://i.pinimg.com/1200x/cd/8a/a5/cd8aa5e2f51c9b0461dba52551367132.jpg" }, // Leather Belt
  "Fashion-2": { img1: "https://i.pinimg.com/736x/2a/53/9f/2a539ffb7ccd20910f956284bb6c671d.jpg", img2: "https://i.pinimg.com/736x/21/8f/d6/218fd6f735a5662049db9bb2b20d7838.jpg" }, // Statement Earrings
  "Fashion-3": { img1: "https://i.pinimg.com/736x/5f/ab/64/5fab642063e543048c64ed659006d50d.jpg", img2: "https://i.pinimg.com/736x/e4/a4/1d/e4a41d2e2e1f17dbc1d6f0d2a9e10aef.jpg" }, // Wool Beanie
  "Fashion-4": { img1: "https://i.pinimg.com/1200x/c8/a8/69/c8a869834ce170ca11f99d93ee437ac4.jpg", img2: "https://i.pinimg.com/736x/80/d3/10/80d31027ce3490a4e928273ab68fc26f.jpg" }, // Layered Necklace
  "Fashion-5": { img1: "https://i.pinimg.com/736x/80/4e/63/804e63dbb13955e2bc875af86648510e.jpg", img2: "https://i.pinimg.com/736x/52/05/19/52051980bc030d507ab0615419ac4d2f.jpg" }, // Cotton Bandana
  "Fashion-6": { img1: "https://i.pinimg.com/1200x/6d/39/cd/6d39cd8399429650631e51f3da94ac3f.jpg", img2: "https://i.pinimg.com/1200x/13/99/00/139900e88e2262cdca2703d31577d635.jpg" }, // Knit Gloves
  "Fashion-7": { img1: "https://i.pinimg.com/1200x/47/ff/74/47ff74f5d2d930bb7231c00f30f73d1f.jpg", img2: "https://i.pinimg.com/736x/6b/16/ab/6b16ab5cbb8f0b29e27c7c76ce2136d1.jpg" }, // Wide Brim Hat
};

const NAMES = {
  Clothing: ["Ribbed Tank Top", "Ribbed Modal T-shirt", "Oversized Printed Tee", "V-neck Linen T-shirt", "Loose Fit Sweatshirt", "Regular Fit Oxford Shirt", "Loose Fit Hoodie", "Wide Leg Trousers"],
  Sunglasses: ["Classic Tortoise Sunglasses", "Square Frame Sunglasses", "Oversized Cat-eye", "Retro Round Sunglasses", "Aviator Sunglasses", "Sport Wrap Sunglasses", "Gradient Lens Sunglasses", "Slim Metal Frame"],
  Bags: ["Structured Tote Bag", "Mini Crossbody Bag", "Leather Shoulder Bag", "Woven Beach Bag", "Quilted Chain Bag", "Canvas Backpack", "Top Handle Satchel", "Drawstring Bucket Bag"],
  Shoes: ["Chunky Sneakers", "Suede Ankle Boots", "Platform Loafers", "Classic White Sneakers", "Strappy Sandals", "Combat Boots", "Slip-on Mules", "Running Trainers"],
  Fashion: ["Silk Printed Scarf", "Leather Belt", "Statement Earrings", "Wool Beanie", "Layered Necklace", "Cotton Bandana", "Knit Gloves", "Wide Brim Hat"],
};

function buildProducts() {
  let id = 1;
  const list = [];
  CATEGORIES.forEach((cat) => {
    NAMES[cat].forEach((n, i) => {
      const price = Number((Math.random() * 90 + 9.95).toFixed(2));
      const onSale = i % 3 === 0;
      list.push({
        id: id++,
        name: n,
        category: cat,
        price,
        oldPrice: onSale ? Number((price * 1.4).toFixed(2)) : null,
        isNew: i % 4 === 0 && !onSale,
        img1: (PRODUCT_IMAGES[cat + "-" + i] || {}).img1 || seedImg(cat + i + "a"),
        img2: (PRODUCT_IMAGES[cat + "-" + i] || {}).img2 || seedImg(cat + i + "b"),
        colors: COLORS.slice(0, 3 + (i % 3)),
        sizes: cat === "Clothing" ? SIZES : ["One Size"],
      });
    });
  });
  return list;
}
const PRODUCTS = buildProducts();

/* extra standalone items used only for "shop the look" hotspots */
let nextLookId = PRODUCTS.length + 1000;
function addLookProduct(name, category, price, img) {
  const p = { id: nextLookId++, name, category, price, oldPrice: null, isNew: false, img1: img, img2: img, colors: COLORS.slice(0, 3), sizes: ["One Size"] };
  PRODUCTS.push(p);
  return p;
}
// ---------------------------------------------------------
// "Shop the look" section images — edit these two links directly.
const LOOK_IMAGE_A = "https://i.pinimg.com/736x/56/d3/17/56d31752632422234d06e507696aebe9.jpg"; // Look photo 1 (girl with hat + necklace)
const LOOK_IMAGE_B = "https://i.pinimg.com/1200x/ca/63/a9/ca63a906b526eeaa2764c24dfb133d92.jpg"; // Look photo 2 (hat close-up)

const LOOK_NECKLACE = addLookProduct("Shell Beaded Necklace", "Bags", 24.0, "https://i.pinimg.com/736x/56/d3/17/56d31752632422234d06e507696aebe9.jpg"); // hotspot thumbnail
const LOOK_TOP = PRODUCTS.find((p) => p.name === "Ribbed Modal T-shirt") || addLookProduct("Ribbed Modal T-shirt", "Clothing", 20.0, "https://i.pinimg.com/1200x/ca/63/a9/ca63a906b526eeaa2764c24dfb133d92.jpg");
const LOOK_HAT = addLookProduct("Frayed Straw Bucket Hat", "Shoes", 32.0, "https://i.pinimg.com/1200x/ca/63/a9/ca63a906b526eeaa2764c24dfb133d92.jpg"); // hotspot thumbnail

const LOOKS = [
  { img: LOOK_IMAGE_A, hotspots: [{ x: 47, y: 52, id: LOOK_NECKLACE.id }, { x: 63, y: 80, id: LOOK_TOP.id }] },
  { img: LOOK_IMAGE_B, hotspots: [{ x: 60, y: 29, id: LOOK_HAT.id }] },
];

const REVIEWS = [
  { name: "Robert Smith", from: "USA", title: "Best Online Fashion Site", text: "I always find something stylish and affordable on this web fashion site." },
  { name: "Allen Lyn", from: "France", title: "Great Selection and Quality", text: "I love the variety of styles and the high-quality clothing on this web fashion site." },
  { name: "Peter Rope", from: "UK", title: "Best Customer Service", text: "I finally found a web fashion site with stylish and flattering options in my size." },
  { name: "Maria Chen", from: "Canada", title: "Fast Shipping", text: "Orders arrive quickly and everything is packaged so nicely, love shopping here." },
];

/* ============================================================
   2. CONTEXT API — Cart + Wishlist + Toast
============================================================ */
const CartContext = createContext(null);
const WishlistContext = createContext(null);
const ToastContext = createContext(null);

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { product, qty, color, size } = action.payload;
      const key = `${product.id}-${color}-${size}`;
      const existing = state.find((c) => c.key === key);
      if (existing) {
        return state.map((c) => (c.key === key ? { ...c, qty: c.qty + qty } : c));
      }
      return [...state, { key, id: product.id, name: product.name, price: product.price, img: product.img1, qty, color, size }];
    }
    case "REMOVE":
      return state.filter((c) => c.key !== action.payload);
    case "CHANGE_QTY":
      return state
        .map((c) => (c.key === action.payload.key ? { ...c, qty: c.qty + action.payload.delta } : c))
        .filter((c) => c.qty > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case "TOGGLE": {
      const exists = state.some((p) => p.id === action.payload.id);
      return exists ? state.filter((p) => p.id !== action.payload.id) : [...state, action.payload];
    }
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => loadLS("ecomus_cart_react", []));
  useEffect(() => localStorage.setItem("ecomus_cart_react", JSON.stringify(cart)), [cart]);

  const addToCart = (product, qty = 1, color, size) => dispatch({ type: "ADD", payload: { product, qty, color, size } });
  const removeFromCart = (key) => dispatch({ type: "REMOVE", payload: key });
  const changeQty = (key, delta) => dispatch({ type: "CHANGE_QTY", payload: { key, delta } });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const count = cart.reduce((a, c) => a + c.qty, 0);
  const subtotal = cart.reduce((a, c) => a + c.qty * c.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, changeQty, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}
function WishlistProvider({ children }) {
  const [wishlist, dispatch] = useReducer(wishlistReducer, [], () => loadLS("ecomus_wishlist_react", []));
  useEffect(() => localStorage.setItem("ecomus_wishlist_react", JSON.stringify(wishlist)), [wishlist]);
  const toggleWishlist = (product) => dispatch({ type: "TOGGLE", payload: product });
  const isWishlisted = (id) => wishlist.some((p) => p.id === id);
  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}
function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  const showToast = (text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2200);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`ecomus-toast ${msg ? "show" : ""}`}>{msg}</div>
    </ToastContext.Provider>
  );
}

const useCart = () => useContext(CartContext);
const useWishlist = () => useContext(WishlistContext);
const useToastCtx = () => useContext(ToastContext);

/* ============================================================
   3. GLOBAL STYLES (kept in this same file, injected once)
============================================================ */
const GlobalStyles = () => (
  <style>{`
    :root{ --ink:#141414; --cream:#f7f4ee; --line:#e7e3da; --accent:#c1440e; --muted:#7a7568; }
    body{ font-family:'Jost',sans-serif; color:var(--ink); }
    /* Every image below points to a placeholder for now — swap the src on
       each one (search seedImg/PRODUCTS/LOOKS in this file) to use your own pictures. */
    img{ background:#efece3; }
    a{ text-decoration:none; color:inherit; }
    .btn-ink{ background:var(--ink); color:#fff; border-radius:0; padding:.8rem 1.7rem; border:none; font-weight:500; transition:.25s; }
    .btn-ink:hover{ background:var(--accent); color:#fff; }
    .btn-outline-ink{ background:transparent; border:1px solid var(--ink); color:var(--ink); border-radius:0; padding:.7rem 1.5rem; transition:.25s; }
    .btn-outline-ink:hover{ background:var(--ink); color:#fff; }
    .brand-logo{ font-size:1.6rem; font-weight:700; letter-spacing:-.03em; }
    .nav-link-ecomus{ font-weight:500; color:var(--ink); padding:1.2rem .9rem; cursor:pointer; }
    .icon-btn{ background:none; border:none; font-size:1.05rem; position:relative; padding:.4rem .55rem; }
    .badge-count{ position:absolute; top:-2px; right:-2px; background:var(--accent); color:#fff; font-size:.62rem; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .mega-menu{ position:absolute; left:0; top:100%; width:100%; background:#fff; border-top:1px solid var(--line); box-shadow:0 20px 40px rgba(0,0,0,.08); z-index:1050; padding:2rem 0; }
    .mega-link{ display:block; padding:.3rem 0; color:var(--muted); font-size:.92rem; }
    .mega-link:hover{ color:var(--accent); }
    .hero{ background:var(--cream); }
    .hero h1{ font-size:clamp(2.6rem,6vw,4.6rem); line-height:1.02; font-weight:600; }
    .marquee-wrap{ background:#fdf9b8; overflow:hidden; white-space:nowrap; padding:.8rem 0; border-top:1px solid #000; border-bottom:1px solid #000; }
    .marquee-track{ display:inline-block; animation:scroll-left 18s linear infinite; font-weight:600; }
    @keyframes scroll-left{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .cat-card{ position:relative; overflow:hidden; border-radius:10px; cursor:pointer; display:block; }
    .cat-card img{ width:100%; height:340px; object-fit:cover; transition:.5s ease; }
    .cat-card:hover img{ transform:scale(1.08); }
    .cat-label{ position:absolute; bottom:16px; left:16px; background:#fff; padding:.5rem 1.1rem; font-weight:600; }
    .product-card{ position:relative; }
    .product-thumb{ position:relative; overflow:hidden; border-radius:8px; background:#f4f2ee; }
    .product-thumb img{ width:100%; aspect-ratio:3/4; object-fit:cover; transition:opacity .4s ease; }
    .product-thumb .img-back{ position:absolute; inset:0; opacity:0; }
    .product-thumb:hover .img-front{ opacity:0; }
    .product-thumb:hover .img-back{ opacity:1; }
    .product-actions{ position:absolute; right:10px; top:10px; display:flex; flex-direction:column; gap:8px; opacity:0; transform:translateX(8px); transition:.25s; }
    .product-card:hover .product-actions{ opacity:1; transform:translateX(0); }
    .action-circle{ width:38px; height:38px; border-radius:50%; background:#fff; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; }
    .action-circle:hover{ background:var(--ink); color:#fff; }
    .action-circle.active{ background:var(--accent); color:#fff; border-color:var(--accent); }
    .cart-bar{ position:absolute; left:0; right:0; bottom:0; background:rgba(20,20,20,.88); color:#fff; text-align:center; padding:.6rem; font-size:.85rem; font-weight:500; opacity:0; transform:translateY(100%); transition:.25s; cursor:pointer; }
    .product-card:hover .cart-bar{ opacity:1; transform:translateY(0); }
    .swatch{ width:16px; height:16px; border-radius:50%; border:1px solid #d8d4c9; display:inline-block; cursor:pointer; }
    .swatch.active{ outline:2px solid var(--ink); outline-offset:2px; }
    .price-strike{ text-decoration:line-through; color:#a39f92; margin-right:6px; }
    .badge-sale, .badge-new{ position:absolute; top:10px; left:10px; color:#fff; font-size:.72rem; padding:.25rem .55rem; border-radius:3px; z-index:2; }
    .badge-sale{ background:var(--accent); } .badge-new{ background:var(--ink); }
    .filter-pill{ border:1px solid var(--line); background:#fff; padding:.45rem 1.1rem; border-radius:30px; font-size:.88rem; font-weight:500; cursor:pointer; transition:.2s; }
    .filter-pill.active,.filter-pill:hover{ background:var(--ink); color:#fff; border-color:var(--ink); }
    .review-card{ border:1px solid var(--line); border-radius:10px; padding:1.8rem; height:100%; }
    .stars i{ color:var(--accent); font-size:.85rem; }
    .footer-feature{ border:1px solid var(--line); border-radius:10px; padding:1.6rem; text-align:center; }
    footer a{ color:var(--muted); display:block; padding:.25rem 0; font-size:.92rem; }
    footer a:hover{ color:var(--accent); }
    /* Sidebars (Cart / Wishlist) built without bootstrap JS */
    .sidebar-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:2000; opacity:0; pointer-events:none; transition:.25s; }
    .sidebar-overlay.show{ opacity:1; pointer-events:auto; }
    .sidebar-panel{ position:fixed; top:0; right:0; height:100%; width:380px; max-width:92vw; background:#fff; z-index:2001; transform:translateX(100%); transition:.3s; display:flex; flex-direction:column; }
    .sidebar-panel.show{ transform:translateX(0); }
    .cart-line img{ width:65px; height:78px; object-fit:cover; border-radius:6px; }
    .qty-box button{ width:32px; }
    /* Modals */
    .ecomus-modal-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:3000; display:flex; align-items:center; justify-content:center; padding:1rem; opacity:0; pointer-events:none; transition:.2s; }
    .ecomus-modal-overlay.show{ opacity:1; pointer-events:auto; }
    .ecomus-modal{ background:#fff; width:100%; max-height:90vh; overflow:auto; position:relative; }
    .ecomus-modal.modal-xl{ max-width:1100px; }
    .ecomus-modal.modal-lg{ max-width:850px; }
    .zoom-pane{ position:relative; overflow:hidden; cursor:zoom-in; }
    .zoom-pane img{ display:block; width:100%; height:100%; object-fit:cover; transition:transform .06s ease-out; }
    .ecomus-toast{ position:fixed; top:90px; right:20px; background:#141414; color:#fff; padding:.8rem 1.2rem; border-radius:6px; z-index:4000; opacity:0; transform:translateY(-10px); transition:.25s; pointer-events:none; }
    .ecomus-toast.show{ opacity:1; transform:translateY(0); }
    .back-top{ position:fixed; bottom:24px; right:24px; width:44px; height:44px; border-radius:50%; background:var(--ink); color:#fff; display:flex; align-items:center; justify-content:center; z-index:1500; border:none; opacity:0; pointer-events:none; transition:.3s; }
    .back-top.show{ opacity:1; pointer-events:auto; }
    /* shop the look hotspots */
    .look-wrap{ position:relative; overflow:hidden; height:420px; }
    .look-wrap img{ display:block; width:100%; height:100%; object-fit:cover; }
    @media(max-width:767px){ .look-wrap{ height:280px; } }
    .hotspot{ position:absolute; width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,.9); border:none; display:flex; align-items:center; justify-content:center; transform:translate(-50%,-50%); cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,.25); z-index:5; padding:0; }
    .hotspot::after{ content:''; width:8px; height:8px; border-radius:50%; background:#141414; }
    .hotspot:hover, .hotspot.active{ background:#141414; }
    .hotspot:hover::after, .hotspot.active::after{ background:#fff; }
    .hotspot-pulse{ position:absolute; inset:0; border-radius:50%; background:rgba(255,255,255,.6); animation:hotspot-ping 1.8s ease-out infinite; }
    @keyframes hotspot-ping{ 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(2.4);opacity:0;} }
    .hotspot-card{ position:absolute; transform:translate(-50%,-50%); width:270px; background:#fff; box-shadow:0 10px 30px rgba(0,0,0,.18); display:flex; align-items:center; gap:12px; padding:12px; z-index:10; opacity:0; visibility:hidden; transition:.2s; }
    .hotspot-card.show{ opacity:1; visibility:visible; }
    .hotspot-card img{ width:56px; height:70px; object-fit:cover; border-radius:4px; }
    .hotspot-card .hc-name{ font-size:.92rem; font-weight:500; }
    .hotspot-card .hc-price{ font-weight:600; font-size:.92rem; }
    .hotspot-card .hc-eye{ margin-left:auto; width:34px; height:34px; border-radius:50%; background:#f2f0ea; border:none; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    @media(max-width:767px){ .hotspot-card{ width:220px; } }
  `}</style>
);

/* ============================================================
   4. SHARED: Product Card
============================================================ */
function ProductCard({ p, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToastCtx();
  const wished = isWishlisted(p.id);

  const quickAdd = () => {
    addToCart(p, 1, p.colors[0], p.sizes[0]);
    showToast(`${p.name} added to cart`);
  };
  const handleWish = () => {
    toggleWishlist(p);
    showToast(wished ? `${p.name} removed from wishlist` : `${p.name} added to wishlist`);
  };

  return (
    <div className="col-6 col-lg-3 product-card">
      <div className="product-thumb">
        {p.oldPrice ? <span className="badge-sale">Sale</span> : p.isNew ? <span className="badge-new">New</span> : null}
        <img className="img-front" src={p.img1} alt={p.name} onClick={() => onQuickView(p)} style={{ cursor: "pointer" }} />
        <img className="img-back" src={p.img2} alt={p.name + " alt view"} />
        <div className="product-actions">
          <button className="action-circle" title="Quick view" onClick={() => onQuickView(p)}><i className="fa-regular fa-eye" /></button>
          <button className={`action-circle ${wished ? "active" : ""}`} title="Wishlist" onClick={handleWish}>
            <i className={`fa-${wished ? "solid" : "regular"} fa-heart`} />
          </button>
          <button className="action-circle" title="Compare"><i className="fa-solid fa-arrows-left-right" /></button>
        </div>
        <div className="cart-bar" onClick={quickAdd}><i className="fa-solid fa-bag-shopping me-1" /> Add to cart</div>
      </div>
      <div className="pt-2">
        <div className="small text-muted">{p.category}</div>
        <div className="fw-medium">{p.name}</div>
        <div>
          {p.oldPrice && <span className="price-strike">${p.oldPrice}</span>}
          <span className="fw-semibold">${p.price}</span>
        </div>
        <div className="d-flex gap-1 mt-1">
          {p.colors.map((c, i) => <span key={i} className="swatch" style={{ background: c }} />)}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   5. QUICK VIEW MODAL (with hover zoom)
============================================================ */
function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { showToast } = useToastCtx();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product?.colors[0]);
  const [size, setSize] = useState(product?.sizes[0]);
  const imgRef = useRef(null);

  useEffect(() => {
    if (product) { setQty(1); setColor(product.colors[0]); setSize(product.sizes[0]); }
  }, [product]);

  if (!product) return null;

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (imgRef.current) {
      imgRef.current.style.transformOrigin = `${x}% ${y}%`;
      imgRef.current.style.transform = "scale(2)";
    }
  };
  const handleLeave = () => { if (imgRef.current) imgRef.current.style.transform = "scale(1)"; };

  return (
    <div className={`ecomus-modal-overlay show`} onClick={onClose}>
      <div className="ecomus-modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close position-absolute end-0 top-0 m-3" style={{ zIndex: 5 }} onClick={onClose} />
        <div className="row g-0">
          <div className="col-md-6">
            <div className="zoom-pane" style={{ height: "100%", minHeight: 340 }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
              <img ref={imgRef} src={product.img1} alt={product.name} />
            </div>
          </div>
          <div className="col-md-6 p-4">
            <h4>{product.name}</h4>
            <div className="mb-2">
              {product.oldPrice && <span className="price-strike">${product.oldPrice}</span>}
              <span className="fw-semibold fs-5">${product.price}</span>
            </div>
            <p className="text-muted small">Premium quality, crafted with care. A versatile addition to your wardrobe.</p>
            <div className="mb-3">
              <div className="small fw-semibold mb-1">Color</div>
              <div className="d-flex gap-2">
                {product.colors.map((c, i) => (
                  <span key={i} className={`swatch ${c === color ? "active" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
            <div className="mb-3">
              <div className="small fw-semibold mb-1">Size</div>
              <div className="d-flex gap-2 flex-wrap">
                {product.sizes.map((s, i) => (
                  <button key={i} className={`btn btn-sm ${s === size ? "btn-ink" : "btn-outline-ink"}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="input-group qty-box" style={{ width: 100 }}>
                <button className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <input readOnly className="form-control text-center" value={qty} />
                <button className="btn btn-outline-secondary" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <button
                className="btn btn-ink flex-grow-1"
                onClick={() => { addToCart(product, qty, color, size); showToast(`${product.name} added to cart`); onClose(); }}
              >
                <i className="fa-solid fa-bag-shopping me-2" />Add to cart
              </button>
              <button className="action-circle" title="Wishlist" onClick={() => { toggleWishlist(product); showToast(`${product.name} added to wishlist`); }}>
                <i className="fa-regular fa-heart" />
              </button>
              <button className="action-circle" title="Compare"><i className="fa-solid fa-arrows-left-right" /></button>
            </div>
            <button
              className="btn w-100 mb-2"
              style={{ background: "#ffc439", fontWeight: 700, color: "#003087" }}
              onClick={() => showToast("PayPal checkout is a demo in this build")}
            >
              <i className="fa-brands fa-paypal me-1" />Buy with PayPal
            </button>
            <div className="text-center">
              <a href="#" className="small text-muted text-decoration-underline" onClick={(e) => e.preventDefault()}>More payment options</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   6. CATEGORY MODAL — "many options" per category
============================================================ */
function CategoryModal({ category, onClose, onQuickView }) {
  if (!category) return null;
  const items = PRODUCTS.filter((p) => p.category === category);
  return (
    <div className="ecomus-modal-overlay show" onClick={onClose}>
      <div className="ecomus-modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">{category} — {items.length} options</h5>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="p-3">
          <div className="row g-4">
            {items.map((p) => <ProductCard key={p.id} p={p} onQuickView={onQuickView} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   7. CART & WISHLIST SIDEBARS
============================================================ */
function CartSidebar({ open, onClose }) {
  const { cart, removeFromCart, changeQty, subtotal } = useCart();
  const { showToast } = useToastCtx();
  return (
    <>
      <div className={`sidebar-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <div className={`sidebar-panel ${open ? "show" : ""}`}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Your Cart ({cart.reduce((a, c) => a + c.qty, 0)})</h5>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="flex-grow-1 overflow-auto p-3">
          {cart.length === 0 ? (
            <p className="text-muted text-center mt-4">Your cart is empty.</p>
          ) : (
            cart.map((c) => (
              <div key={c.key} className="d-flex gap-3 py-3 border-bottom cart-line">
                <img src={c.img} alt={c.name} />
                <div className="flex-grow-1">
                  <div className="fw-medium">{c.name}</div>
                  <div className="small text-muted">
                    {c.color && <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c.color }} />} {c.size && `Size: ${c.size}`}
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(c.key, -1)}>−</button>
                    <span>{c.qty}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(c.key, 1)}>+</button>
                    <span className="ms-auto fw-semibold">${(c.price * c.qty).toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn btn-sm text-danger" onClick={() => removeFromCart(c.key)}><i className="fa-solid fa-xmark" /></button>
              </div>
            ))
          )}
        </div>
        <div className="border-top p-3">
          <div className="d-flex justify-content-between fw-semibold mb-3">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="btn btn-ink w-100" onClick={() => showToast(cart.length ? "Proceeding to checkout…" : "Your cart is empty")}>Checkout</button>
        </div>
      </div>
    </>
  );
}

function WishlistSidebar({ open, onClose }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToastCtx();
  return (
    <>
      <div className={`sidebar-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <div className={`sidebar-panel ${open ? "show" : ""}`}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Wishlist ({wishlist.length})</h5>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="flex-grow-1 overflow-auto p-3">
          {wishlist.length === 0 ? (
            <p className="text-muted text-center mt-4">No items yet.</p>
          ) : (
            wishlist.map((p) => (
              <div key={p.id} className="d-flex gap-3 py-3 border-bottom cart-line">
                <img src={p.img1} alt={p.name} />
                <div className="flex-grow-1">
                  <div className="fw-medium">{p.name}</div>
                  <div className="fw-semibold small">${p.price}</div>
                  <button className="btn btn-sm btn-ink mt-1" onClick={() => { addToCart(p, 1, p.colors[0], p.sizes[0]); showToast(`${p.name} added to cart`); }}>Add to cart</button>
                </div>
                <button className="btn btn-sm text-danger" onClick={() => toggleWishlist(p)}><i className="fa-solid fa-xmark" /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   8. NAVBAR (with mega menu + search)
============================================================ */
// ---------------------------------------------------------
// Site-wide static images — hero banner, 2 mega-menu banners, 4 category cards.
const HERO_IMAGE = "https://i.pinimg.com/736x/41/4f/ca/414fcaeb2a53887db6864a1748ce1a60.jpg";
const MEGA_BANNER_1 = "https://i.pinimg.com/736x/d7/6e/c4/d76ec460f380d529a66917eed4f6a557.jpg"; // "New Season" banner in the Shop mega menu
const MEGA_BANNER_2 = "https://i.pinimg.com/1200x/f7/69/87/f76987bc90b981c8816921cb1d1ad895.jpg"; // "Up to 50% off" banner in the Shop mega menu
const CATEGORY_IMAGES = {
  Clothing: "https://i.pinimg.com/1200x/d5/2d/43/d52d438e4c6efff9a096f556ef24d835.jpg",
  Sunglasses: "https://i.pinimg.com/736x/bd/fe/95/bdfe95d388c006c1b9bbede827674c41.jpg",
  Bags: "https://i.pinimg.com/736x/6d/ce/5a/6dce5acebd3c01f93a152269a420c343.jpg",
  Shoes: "https://i.pinimg.com/1200x/11/df/0f/11df0f2bc0565b813b11b7e1cdfa5b90.jpg",
  Fashion: "https://picsum.photos/seed/catFashion/500/650",
};

function Navbar({ onOpenCart, onOpenWishlist, onOpenCategory, onQuickView }) {
  const { count } = useCart();
  const { wishlist } = useWishlist();
  const [megaOpen, setMegaOpen] = useState(null); // 'shop' | 'products' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <nav className="bg-white border-bottom py-2 sticky-top" onMouseLeave={() => setMegaOpen(null)}>
      <div className="container d-flex align-items-center justify-content-between">
        <a className="brand-logo" href="#home">ecomus</a>

        <button className="btn d-lg-none" onClick={() => setMobileOpen((o) => !o)}><i className="fa-solid fa-bars" /></button>

        <ul className={`d-none d-lg-flex list-unstyled mb-0 gap-1 position-relative`}>
          <li><a className="nav-link-ecomus" href="#home">Home</a></li>
          <li className="position-static" onMouseEnter={() => setMegaOpen("shop")}>
            <span className="nav-link-ecomus">Shop <i className="fa-solid fa-chevron-down fa-2xs ms-1" /></span>
            {megaOpen === "shop" && (
              <div className="mega-menu">
                <div className="container">
                  <div className="row g-4">
                    <div className="col-lg-3">
                      <h6 className="fw-semibold small text-uppercase">Categories</h6>
                      {CATEGORIES.map((c) => (
                        <a key={c} className="mega-link" href="#" onClick={(e) => { e.preventDefault(); onOpenCategory(c); setMegaOpen(null); }}>{c}</a>
                      ))}
                    </div>
                    <div className="col-lg-4">
                      <img src={MEGA_BANNER_1} className="w-100 rounded mb-2" alt="Mega menu banner — New Season" />
                    </div>
                    <div className="col-lg-5">
                      <img src={MEGA_BANNER_2} className="w-100 rounded mb-2" alt="Mega menu banner — Up to 50% off" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li className="position-static" onMouseEnter={() => setMegaOpen("products")}>
            <span className="nav-link-ecomus">Products <i className="fa-solid fa-chevron-down fa-2xs ms-1" /></span>
            {megaOpen === "products" && (
              <div className="mega-menu">
                <div className="container">
                  <div className="row g-3">
                    {CATEGORIES.map((c) => (
                      <div className="col-lg" key={c}>
                        <h6 className="fw-semibold small text-uppercase">{c}</h6>
                        {PRODUCTS.filter((p) => p.category === c).slice(0, 4).map((p) => (
                          <a key={p.id} className="mega-link" href="#" onClick={(e) => { e.preventDefault(); onQuickView(p); setMegaOpen(null); }}>{p.name}</a>
                        ))}
                        <a className="mega-link fw-semibold" href="#" style={{ color: "var(--accent)" }} onClick={(e) => { e.preventDefault(); onOpenCategory(c); setMegaOpen(null); }}>View all →</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </li>
          <li><a className="nav-link-ecomus" href="#testimonials">Pages</a></li>
          <li><a className="nav-link-ecomus" href="#blog">Blog</a></li>
          <li><a className="nav-link-ecomus" href="#products">Buy now</a></li>
        </ul>

        <div className="d-flex align-items-center gap-1">
          <button className="icon-btn" onClick={() => setSearchOpen((s) => !s)}><i className="fa-solid fa-magnifying-glass" /></button>
          <button className="icon-btn"><i className="fa-regular fa-user" /></button>
          <button className="icon-btn" onClick={onOpenWishlist}>
            <i className="fa-regular fa-heart" /><span className="badge-count">{wishlist.length}</span>
          </button>
          <button className="icon-btn" onClick={onOpenCart}>
            <i className="fa-solid fa-bag-shopping" /><span className="badge-count">{count}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="d-lg-none container py-2 border-top mt-2">
          {CATEGORIES.map((c) => (
            <a key={c} className="d-block py-2 border-bottom" href="#" onClick={(e) => { e.preventDefault(); onOpenCategory(c); setMobileOpen(false); }}>{c}</a>
          ))}
        </div>
      )}

      {searchOpen && (
        <div className="container py-3 border-top mt-2">
          <input className="form-control" autoFocus placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {results.length > 0 && (
            <div className="mt-2">
              {results.map((p) => (
                <a key={p.id} href="#" className="d-flex align-items-center gap-3 py-2 border-bottom" onClick={(e) => { e.preventDefault(); onQuickView(p); setSearchOpen(false); setQuery(""); }}>
                  <img src={p.img1} style={{ width: 46, height: 56, objectFit: "cover", borderRadius: 4 }} alt={p.name} />
                  <div><div className="fw-medium">{p.name}</div><div className="small text-muted">{p.category} · ${p.price}</div></div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/* ============================================================
   9. PAGE SECTIONS
============================================================ */
function Hero() {
  return (
    <header className="hero" id="home">
      <div className="row g-0 align-items-stretch">
        <div className="col-lg-6 d-flex flex-column justify-content-center py-5 px-4 px-lg-5">
          <h1 className="mb-4">Glamorous<br />Glam</h1>
          <p className="fs-5 mb-4 text-muted">From casual to formal, we've got you covered</p>
          <div><a href="#products" className="btn btn-ink">Shop collection <i className="fa-solid fa-arrow-right ms-1" /></a></div>
        </div>
        <div className="col-lg-6">
          <img src={HERO_IMAGE} alt="hero" className="w-100 h-100" style={{ objectFit: "cover" }} />
        </div>
      </div>
    </header>
  );
}

function Marquee() {
  const text = "⚡ Spring Clearance Event: Save Up to 70%";
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className="mx-4">{text}</span>)}
      </div>
    </div>
  );
}

function Categories({ onOpenCategory }) {
  const rowRef = useRef(null);
  return (
    <section className="container py-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn rounded-circle border" style={{ width: 52, height: 52 }} onClick={() => rowRef.current.scrollBy({ left: -300, behavior: "smooth" })}><i className="fa-solid fa-chevron-left" /></button>
        <button className="btn rounded-circle border" style={{ width: 52, height: 52 }} onClick={() => rowRef.current.scrollBy({ left: 300, behavior: "smooth" })}><i className="fa-solid fa-chevron-right" /></button>
        <h6 className="mb-0 fw-bold ms-2" style={{ letterSpacing: ".05em" }}>SHOP BY CATEGORIES</h6>
      </div>
      <div className="row g-3" ref={rowRef}>
        {CATEGORIES.map((c) => (
          <div className="col-6 col-lg-3" key={c}>
            <a className="cat-card" href="#" onClick={(e) => { e.preventDefault(); onOpenCategory(c); }}>
              <img src={CATEGORY_IMAGES[c]} alt={c} />
              <span className="cat-label">{c}</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsSection({ onQuickView }) {
  const [filter, setFilter] = useState("All");
  const [visible, setVisible] = useState(8);
  const list = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  const shown = list.slice(0, visible);

  return (
    <section className="container py-4" id="products">
      <div className="text-center mb-4">
        <h2>Best Seller</h2>
        <p className="text-muted">Shop the Latest Styles: Stay ahead of the curve with our newest arrivals</p>
      </div>
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} className={`filter-pill ${filter === c ? "active" : ""}`} onClick={() => { setFilter(c); setVisible(8); }}>{c}</button>
        ))}
      </div>
      <div className="row g-4">
        {shown.map((p) => <ProductCard key={p.id} p={p} onQuickView={onQuickView} />)}
      </div>
      {shown.length < list.length && (
        <div className="text-center mt-5">
          <button className="btn btn-outline-ink" onClick={() => setVisible((v) => v + 8)}>Load more</button>
        </div>
      )}
    </section>
  );
}

function ShopTheLook({ onQuickView }) {
  const [openKey, setOpenKey] = useState(null); // "li-hi" of currently open hotspot card

  useEffect(() => {
    const closeAll = () => setOpenKey(null);
    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  return (
    <section className="py-0 bg-light" id="blog">
      <div className="text-center py-5">
        <h2>Shop the look</h2>
        <p className="text-muted">Inspire and let yourself be inspired, from one unique fashion to another.</p>
      </div>
      <div className="row g-0">
        {LOOKS.map((look, li) => (
          <div className="col-md-6 look-wrap" key={li}>
            <img src={look.img} className="w-100" style={{ objectFit: "cover", height: "100%" }} alt={`Shop the look ${li + 1}`} />
            {look.hotspots.map((h, hi) => {
              const p = PRODUCTS.find((x) => x.id === h.id);
              const key = `${li}-${hi}`;
              const isOpen = openKey === key;
              return (
                <React.Fragment key={key}>
                  <button
                    className={`hotspot ${isOpen ? "active" : ""}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    onClick={(e) => { e.stopPropagation(); setOpenKey(isOpen ? null : key); }}
                  >
                    <span className="hotspot-pulse" />
                  </button>
                  <div
                    className={`hotspot-card ${isOpen ? "show" : ""}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%`, marginTop: h.y > 60 ? -140 : 40 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={p.img1} alt={p.name} />
                    <div>
                      <div className="hc-name">{p.name}</div>
                      <div className="hc-price">${p.price.toFixed(2)}</div>
                    </div>
                    <button className="hc-eye" onClick={() => { setOpenKey(null); onQuickView(p); }}>
                      <i className="fa-regular fa-eye" />
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [page, setPage] = useState(0);
  const chunks = [];
  for (let i = 0; i < REVIEWS.length; i += 3) chunks.push(REVIEWS.slice(i, i + 3));
  return (
    <section className="container py-5" id="testimonials">
      <div className="text-center mb-5">
        <h2>Happy Clients</h2>
        <p className="text-muted">Hear what they say about us</p>
      </div>
      <div className="position-relative">
        <div className="row g-4">
          {chunks[page].map((r, i) => (
            <div className="col-md-4" key={i}>
              <div className="review-card">
                <div className="stars mb-2">{Array.from({ length: 5 }).map((_, s) => <i key={s} className="fa-solid fa-star" />)}</div>
                <h6 className="fw-semibold">{r.title}</h6>
                <p className="text-muted small">"{r.text}"</p>
                <div className="fw-medium">{r.name}</div>
                <div className="small text-muted">Customer from {r.from}</div>
              </div>
            </div>
          ))}
        </div>
        {chunks.length > 1 && (
          <div className="text-center mt-4 d-flex justify-content-center gap-2">
            <button className="btn btn-outline-ink" onClick={() => setPage((p) => (p - 1 + chunks.length) % chunks.length)}><i className="fa-solid fa-chevron-left" /></button>
            <button className="btn btn-outline-ink" onClick={() => setPage((p) => (p + 1) % chunks.length)}><i className="fa-solid fa-chevron-right" /></button>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandStrip() {
  const brands = ["SSENSE", "BURBERRY", "NIKE", "ASOS", "PULL&BEAR", "GILDAN"];
  return (
    <section className="container pb-5">
      <div className="row g-0 text-center" style={{ fontWeight: 700, fontSize: "1.3rem" }}>
        {brands.map((b) => <div className="col-6 col-lg-2 py-4 border" key={b}>{b}</div>)}
      </div>
    </section>
  );
}

// ---------------------------------------------------------
// "Shop Gram" strip — 5 images, edit each link directly.
const GRAM_IMAGES = [
  "https://i.pinimg.com/736x/39/7c/dc/397cdc45f905882094e6d3187e3b750d.jpg", // Gram photo 1 — links to a Sunglasses product
  "https://i.pinimg.com/1200x/41/9f/96/419f965916552d452076f0e0ab564e71.jpg", // Gram photo 2 — links to a Bags product
  "https://i.pinimg.com/1200x/03/79/3d/03793d601aa51e345281e0723239df5b.jpg", // Gram photo 3 — links to the Bucket Hat
  "https://i.pinimg.com/736x/65/ee/6b/65ee6b765a0ec34ba32f904d5b17140e.jpg", // Gram photo 4 — links to a Shoes product
  "https://i.pinimg.com/736x/73/a9/d9/73a9d991b4839e311852c0d4c8596d27.jpg", // Gram photo 5 — links to a Fashion product
];

function ShopGram({ onQuickView }) {
  const picks = [
    PRODUCTS.find((p) => p.category === "Sunglasses"),
    PRODUCTS.find((p) => p.category === "Bags"),
    LOOK_HAT,
    PRODUCTS.filter((p) => p.category === "Shoes")[0],
    PRODUCTS.find((p) => p.category === "Fashion"),
  ];
  return (
    <section className="container pb-5">
      <div className="text-center mb-4">
        <h2>Shop Gram</h2>
        <p className="text-muted">Inspire and let yourself be inspired, from one unique fashion to another.</p>
      </div>
      <div className="row g-2">
        {picks.map((p, i) => (
          <div className="col-6 col-lg" key={i}>
            <img
              src={GRAM_IMAGES[i]}
              className="w-100 rounded"
              style={{ aspectRatio: "1/1", objectFit: "cover", cursor: p ? "pointer" : "default" }}
              alt={p ? p.name : `Shop gram image ${i + 1}`}
              onClick={() => p && onQuickView(p)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: "fa-box", title: "Free Shipping", text: "Free shipping over order $120" },
    { icon: "fa-credit-card", title: "Flexible Payment", text: "Pay with Multiple Credit Cards", regular: true },
    { icon: "fa-rotate-left", title: "14 Day Returns", text: "Within 30 days for an exchange" },
    { icon: "fa-headset", title: "Premium Support", text: "Outstanding premium support" },
  ];
  return (
    <section className="container py-4">
      <div className="row g-3">
        {items.map((it) => (
          <div className="col-6 col-lg-3" key={it.title}>
            <div className="footer-feature">
              <i className={`fa-${it.regular ? "regular" : "solid"} ${it.icon} fs-3 mb-2`} />
              <h6 className="mb-1">{it.title}</h6>
              <small className="text-muted">{it.text}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-top">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="brand-logo mb-3">ecomus</div>
            <p className="text-muted small mb-1">Address: 1234 Fashion Street, Suite 567, New York, NY 10001</p>
            <p className="text-muted small mb-1">Email: info@fashionshop.com</p>
            <p className="text-muted small mb-3">Phone: (212) 555-1234</p>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="fw-semibold">Help</h6>
            <a href="#">Privacy Policy</a><a href="#">Returns + Exchanges</a><a href="#">Shipping</a><a href="#">Terms &amp; Conditions</a><a href="#">FAQ's</a>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="fw-semibold">About us</h6>
            <a href="#">Our Story</a><a href="#">Visit Our Store</a><a href="#">Contact Us</a><a href="#">Account</a>
          </div>
          <div className="col-lg-3">
            <h6 className="fw-semibold">Sign Up for Email</h6>
            <p className="text-muted small">Sign up to get first dibs on new arrivals, sales, exclusive content, events and more!</p>
            <div className="input-group">
              <input className="form-control rounded-0" placeholder="Enter your email..." />
              <button className="btn btn-ink">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-top py-3 text-center small text-muted">© 2026 Ecomus Store. All Rights Reserved</div>
    </footer>
  );
}

/* ============================================================
   10. APP ROOT
============================================================ */
function AppShell() {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <GlobalStyles />
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishOpen(true)}
        onOpenCategory={setCategory}
        onQuickView={setQuickViewProduct}
      />
      <Hero />
      <Marquee />
      <Categories onOpenCategory={setCategory} />
      <ProductsSection onQuickView={setQuickViewProduct} />
      <ShopTheLook onQuickView={setQuickViewProduct} />
      <Testimonials />
      <BrandStrip />
      <ShopGram onQuickView={setQuickViewProduct} />
      <Features />
      <Footer />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistSidebar open={wishOpen} onClose={() => setWishOpen(false)} />
      <CategoryModal category={category} onClose={() => setCategory(null)} onQuickView={(p) => { setCategory(null); setQuickViewProduct(p); }} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      <button className={`back-top ${showTop ? "show" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <i className="fa-solid fa-chevron-up" />
      </button>
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </WishlistProvider>
    </CartProvider>
  );
}