# SalonBook Client — Luxury Salon Appointment Booking Platform

SalonBook is a modern, responsive web application designed for luxury salon appointment scheduling and management. Customers can discover salon services, filter by category, submit appointment requests, track booking statuses, and pay for confirmed sessions with Stripe. Administrators have complete control over services, appointments, users, and financial records.

---

## 🌟 Important Features

### 🌸 Customer Experience
- **Interactive Home & Showcase**:
  - Salon-themed Hero Banner with dynamic CTA buttons
  - Featured Services dynamic section showcasing top treatments directly from the database
  - Categorized exploration across 7 luxury salon specialties
  - Curated testimonials and salon quality guarantees
- **Browse & Discovery**:
  - Instant search by service name and keywords
  - Real-time category filtering (Haircut & Styling, Coloring, Treatments, Facial, Makeup, Nails, Spa)
  - Sorting by price (Low to High, High to Low, Default)
- **Service Details & Protected Booking**:
  - Full service specifications, duration, and transparent pricing
  - Interactive appointment booking with custom date picker and predefined time slot selection
  - Conflict prevention alerting customers if a time slot is already reserved
  - Role protection preventing administrators from submitting customer appointments
- **Customer Dashboard**:
  - Comprehensive overview metrics (Total Requests, Pending, Confirmed, Cancelled)
  - My Appointments tracking with status badges and details modal
  - Pending request cancellation
  - One-click Stripe Checkout redirection for confirmed unpaid appointments
  - Profile management (name, phone, avatar image upload or URL)

### 👑 Administrator Control Center
- **Overview Analytics**:
  - High-level KPIs: Registered Clients, Active Services, Total Requests, Pending Bookings, Revenue
  - Quick action queues for pending appointment confirmations
- **Service Management**:
  - Create new services with custom image uploads (ImgBB / local storage)
  - Edit service titles, descriptions, pricing, and duration
  - Toggle service status between `active` and `inactive`
  - Remove obsolete services
- **Appointment Management**:
  - Filter requests by status (`all`, `pending`, `confirmed`, `cancelled`)
  - Confirm pending bookings (unlocking Stripe payment for the customer)
  - Cancel appointments when necessary
- **User Management**:
  - Complete list of registered customers
  - Block and unblock users to restrict platform access
- **Financial Transactions**:
  - Immutable list of verified Stripe transactions with session reference IDs and timestamps

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Notifications**: Sonner (Rich Toast Notifications)
- **State & Auth**: React Context API (`AuthContext`), persistent LocalStorage session
- **Payments**: Stripe Checkout Client Integration

---

## 📋 Required Environment Variables

Create a `.env.local` file in the root of the client project based on `.env.example`:

| Variable Name | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the SalonBook Express backend | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL for redirects and authentication | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `BETTER_AUTH_SECRET` | Secret key for auth configuration | `[Your_Secure_Auth_Secret]` |
| `IMGBB_API_KEY` | ImgBB API key for image hosting | Optional |

> ⚠️ **Security Notice**: Never commit `.env.local` or secret keys to GitHub.

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js (v18.x or v20.x+)
- SalonBook Server running on port 5000

### 1. Clone the repository
```bash
git clone https://github.com/asadProfile/B14-Assignment-9-Client.git
cd B14-Assignment-9-Client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Default Credentials for Evaluation

- **Administrator**:
  - Email: `admin@salonbook.com`
  - Password: `Admin123!`
- **Demo Customer**:
  - Email: `customer@salonbook.com`
  - Password: `Customer123!`

---

## 🔗 Repository & Live Links

- **Client Repository**: [https://github.com/asadProfile/B14-Assignment-9-Client](https://github.com/asadProfile/B14-Assignment-9-Client)
- **Server Repository**: [https://github.com/asadProfile/B14-Assignment-9-Server](https://github.com/asadProfile/B14-Assignment-9-Server)
- **Live Website**: [https://salonbook-platform.vercel.app](https://salonbook-platform.vercel.app)
