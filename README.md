# 🛍️ ShopMate

ShopMate is a **secure and scalable e-commerce API** built with Node.js, Express, and MongoDB.  
It manages users, products, categories, carts, orders, and payments, featuring **JWT authentication**, **Redis-powered token management**, and **Cloudinary image uploads**, delivering a robust backend for modern online stores.

---

## ✨ Key Features

- **User Management:** Registration, login, password reset, profile update  
- **Authentication & Authorization:** JWT-based, role-based access (Admin/Superadmin)  
- **Token Management:** Store and validate refresh tokens using Redis  
- **Product & Category Management:** CRUD operations with image support (Cloudinary)  
- **Cart & Order Management:** Add/remove/update cart items, checkout orders   
- **Admin-only Routes:** Manage products, categories, and orders  
- **Validation & Security:** Input validation, hashed passwords, rate-limiting  

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT, bcrypt, crypto  
- **Token Management:** Redis  
- **File Storage:** Cloudinary  
- **Validation:** Express Validator  
- **Email:** Nodemailer / SendGrid  
- **Environment Management:** dotenv  

---

## 🚀 Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) v18.17+  
- [npm](https://www.npmjs.com/)  
- MongoDB Atlas or Compass

### 2. Installation

# Clone the repo
```bash
git clone https://github.com/yourusername/shopmate-backend.git
cd shopmate-backend
```
# Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
   
   Create a `.env` file in the root of the project and add the following:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string

   # JWT setup
   ACCESS_TOKEN_SECRET
   REFRESH_TOKEN_SECRET

   # Email (for nodemailer setup)
   SENDGRID_HOST=sendgrid.net
   SENDGRID_PORT=465
   SENDGRID_SECURE=true
   SENDGRID_USER
   SENDGRID_API_KEY
   EMAIL_USER=your_email

   # Cloudinary setup
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Redis setup (Refresh token management)
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_PASSWORD=your_redis_password
   ```

### 4. Start development server
   ```bash
   npm run dev
   ```

## 📖 API Documentation

The ShopMate API is fully documented with Postman for easy testing and collaboration.  
Explore endpoints inside the ShopMate API Workspace for request/response samples.

### Collections Included
- **Admin APIs** - Create Admins (Superadmins only)
- **Auth APIs** – Register, login, logout, email verification, password reset, etc.  
- **User APIs** – Profile management, update, password change, account deletion.  
- **Product APIs** – Manage products and variants, view product details.  
- **Category APIs** – Create, update, delete, and fetch categories.  
- **Cart APIs** – Add, update, remove products, manage cart items.  
- **Order APIs** – Checkout, view orders, cancel, and update status.  
- **Payment APIs** – Initialize and verify payments.  

### Postman Links
- **Admin API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-82adc0f0-76c5-4e72-ac0d-804fb9138b1a?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **Auth API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-5a5dfe7d-a526-43de-a09b-c90fe417ad6a?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **User API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-d8ecf2a7-4751-4de2-812e-b79cfb9493aa?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **Category API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-d46e0ee8-bf99-41b6-a608-61ea59e8cf9b?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **Product API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-55af350d-cd53-473d-b7ea-776249ae0d89?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **Cart API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-b94b2930-dab5-4203-85e7-e8828f07ee6e?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **Order API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-f83c600d-aafc-4f8d-baf3-830d1bcfcb79?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)
- **Payment API** - [view](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-2dc6045c-066a-4e2a-ad88-c8f127713065?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956)

Each endpoint includes:
- Request method & URL  
- Required headers & parameters  
- Example request/response  
- Authentication details (if required)  

# 🛠️ Superadmin Creation Script  

This script allows testers to create a **Superadmin** account in the database for accessing superadmin endpoints. Each tester can create their own account with their email, password, and full name.  

## 📂 File Location  
The script is located at:  

```
scripts/createSuperAdmin.js
```

## ⚡ How to Run  

### 1. Directly with Node  
From your project root, run on the terminal:  

```bash
node scripts/createSuperAdmin.js "Your Full Name" your.email@example.com YourPassword123
```
Example:
```
node scripts/createSuperAdmin.js "Kalu Rose" rose@gmail.com rose222
```

### 2. Using NPM Script (Optional)
Add this to your package.json under "scripts":

```
"scripts": {
  "create-superadmin": "node scripts/createSuperAdmin.js"
}
```

Now you can run: 
```bash
npm run create-superadmin -- "Your Full Name" your.email@example.com YourPassword123
```

# 👤 Creating Other Admins

Once the **superadmin** account has been created, you can use it to create other admins.

## How It Works
- Only the **superadmin** has permission to create new admins.
- The creation is done via the **normal registration API route** (e.g., `POST /api/auth/register`).
- When creating an admin, the superadmin specifies the role as `admin`.
- After registration:
  - The new admin will receive an **email with their login credentials** (email + temporary password).
  - On first login, they are required to **change their password** for security.

👉 For detailed request/response examples, see the postman documentation [Admin API](https://www.postman.com/necherose/workspace/shopmate-api/collection/45016489-82adc0f0-76c5-4e72-ac0d-804fb9138b1a?action=share&creator=45016489&active-environment=45016489-0509035c-28e6-4381-a3fd-076e8e146956).

## 🤝 Contributing
   1. Fork the repo
   2. Create a feature branch (git checkout -b feature-name)
   3. Commit changes (git commit -m 'Add feature')
   4. Push branch (git push origin feature-name)
   5. Create a Pull Request

## License

No License yet

