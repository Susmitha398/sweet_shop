# 👑 Royal Mithai Mahal - Full-Stack Sweet Shop Web Application

A client-grade e-commerce sweet shop web application built with **Express.js backend** and **React frontend with React Router DOM**.

---

## 🌟 Key Features

### 1. Multi-Category Showcase & Dedicated Pages
- **7 Sweet Categories**:
  1. **Royal Halwa (Alwa) Specials** (Tirunelveli Iruttu Kadai Halwa, Bombay Karachi Halwa, Badam Halwa, Carrot Halwa, Asoka Halwa, Wheat Milk Halwa)
  2. **Celebration Laddus & Pedas** (Motichoor Royal Laddu, Tirupati Ghee Laddu, Shahi Besan Laddu, Gond Dry Fruit Laddu)
  3. **Authentic Bengali & Milk Sweets** (Kolkata Rasgulla, Royal Kesar Rasmalai, Gulab Jamun, Cham Cham)
  4. **Royal Kaju & Dry Fruit Collection** (Diamond Silver Foil Kaju Katli, Kaju Pista Roll, Sugar-Free Fig Barfi)
  5. **Rich Barfi & Peda** (Mathura Brown Peda, Milk Cake, Royal Kesar Peda)
  6. **Pure Ghee Specials** (Soft Ghee Mysore Pak, Crispy Honeycomb Mysore Pak, Soan Papdi)
  7. **Festive Gift Hampers & Combo Boxes** (Grand Royal Assorted Box, Festive Delights Hamper)
- **Dedicated Category Page (`/category/:slug`)**:
  - Touching/clicking any sweet category on the homepage opens a dedicated page displaying **ONLY** sweets from that category.
  - Filter by Dietary: All, Pure Desi Ghee, Sugar-Free / Healthy.
  - Sort by: Price (Low to High / High to Low), Star Rating, and Nearest Distance in KM.

### 2. Location & Product Card Layout ("ithu ellam antha image keela varanum")
Directly underneath each sweet product image:
1. 🏬 **Shop Location / Branch**: e.g., `📍 Tirunelveli Town Sweet Depot` / `📍 T. Nagar Flagship Store, Chennai`
2. 📍 **Distance in KM between Current Location and Shop**: Live distance calculation in km (e.g., `2.1 km away • ⏱ 20 mins delivery`) with GPS / city location picker!
3. ⭐ **Rating & Total Reviews**: e.g., `★ 4.9 (2,840 reviews)`
4. 🏷️ **Offer Tag**: e.g., `15% OFF • Today Special` / `Flat ₹200 OFF`
5. ⚖️ **Weight Selection Pills (`250g`, `500g`, `1kg`)**: Dynamic price calculation instantly updates as you click different weights.
6. 💰 **Rate / Price**: Dynamic price display with original strikethrough rate and savings tag.
7. 🛒 **Add to Cart & Buy Now**: Instant slide-out cart drawer & direct purchase buttons.

### 3. Interactive Navbar Live Search Box
- Search input with real-time dropdown suggestions showing sweet thumbnails, category, price, and shop branch.
- Pressing Enter or clicking search navigates to `/search?q=...`.

### 4. User Registration & Login Authentication
- **Register (`/register`)**: Full name, email, phone, street address, city, pincode, password.
- **Login (`/login`)**: Email and password with one-click **"⚡ Auto-Fill Demo Account"** button for quick testing.
- **Navbar Profile Dropdown**: Shows greeting, user details, cart shortcut, and logout button.

### 5. Cart & Purchase / Checkout Flow
- **Slide-out Cart Drawer** & **Full Cart Page (`/cart`)**: Manage item weights and quantities, delete items, live subtotal.
- **Promo Coupon System**: Apply coupon `SWEET10` for an instant 10% discount!
- **Free Delivery Threshold**: Automatic free express delivery for orders above ₹500.
- **Checkout Page (`/checkout`)**: Pre-filled customer address, delivery notes, and multiple payment methods:
  - Cash on Delivery (COD)
  - UPI / QR Code preview (Google Pay, PhonePe, Paytm)
  - Credit / Debit Card
- **Order Success Page (`/order-success/:orderId`)**: Printable invoice receipt, tracking status, and delivery timeline.

---

## 🛠️ Project Structure

```
sweet_shop_project_express_using/
├── backend/
│   ├── .env                      # PORT, MONGO_URI, CORS_ORIGIN, JWT_SECRET
│   ├── server.js                 # Express server entry point
│   ├── config/
│   │   └── db.js                 # MongoDB connection with graceful in-memory fallback
│   ├── models/
│   │   ├── Sweet.js              # Mongoose schema for Sweets
│   │   ├── Category.js           # Mongoose schema for Categories
│   │   ├── Order.js              # Mongoose schema for Orders
│   │   └── User.js               # Mongoose schema for Users
│   ├── data/
│   │   └── seedData.js           # 28+ sweets across 7 categories
│   ├── controllers/
│   │   ├── sweetController.js    # Filter by category, distance km calculation, search, sort
│   │   ├── orderController.js    # Order creation and receipt tracking
│   │   └── authController.js     # User registration and login
│   └── routes/
│       ├── sweetRoutes.js        # /api/sweets & /api/categories
│       ├── orderRoutes.js        # /api/orders
│       └── authRoutes.js         # /api/auth
│
└── frontend/my/
    ├── src/
    │   ├── context/
    │   │   ├── LocationContext.js# Current location, GPS, and km distance calculation
    │   │   ├── AuthContext.js    # Login, register, token, and session storage
    │   │   └── CartContext.js    # Multi-weight cart state, promo codes, and toasts
    │   ├── components/
    │   │   ├── Navbar.js         # Search box with live autocomplete, location picker, cart badge
    │   │   ├── SweetCard.js      # Product card with details underneath image
    │   │   ├── CategoryNav.js    # Visual category explorer
    │   │   ├── HeroBanner.js     # Royal festive hero banner
    │   │   ├── CartDrawer.js     # Slide-out cart drawer
    │   │   ├── Toast.js          # Animated action alerts
    │   │   └── Footer.js         # Confectionery info & shop depots
    │   ├── pages/
    │   │   ├── HomePage.js       # Multi-section home page
    │   │   ├── CategoryPage.js   # Dedicated category page (/category/:slug)
    │   │   ├── SweetDetailPage.js# Product view with weight pills & reviews
    │   │   ├── SearchPage.js     # Search results page
    │   │   ├── CartPage.js       # Cart table & billing
    │   │   ├── CheckoutPage.js   # Delivery details & payment selection
    │   │   ├── OrderSuccessPage.js# Confirmation & printable invoice receipt
    │   │   ├── LoginPage.js      # User login
    │   │   └── RegisterPage.js   # Customer registration
    │   └── styles/               # Clean, responsive CSS files
```

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (Express)
```bash
cd backend
npm install
npm start
```
- Server will run on: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`
- All Sweets API: `http://localhost:5000/api/sweets`
- Halwa Specials API: `http://localhost:5000/api/sweets?category=alwa`

### 2. Start the Frontend (React)
Open a new terminal:
```bash
cd frontend/my
npm start
```
- React application will launch in your browser at: `http://localhost:3000`

---

## 🔑 Demo Account Credentials
- **Email**: `anand@royalmithai.com`
- **Password**: `password123`
*(Or click the "⚡ Auto-Fill Demo Account" button on the login page)*
