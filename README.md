# 🧁 Cake Shop Website - Click & Collect Platform

A modern, responsive web application for a French pastry shop in Paris, enabling customers to browse products and place orders online for click & collect service.

## 🌟 Live Demo

**Visit the live application:** [https://cakeshop-rust-delta.vercel.app/](https://cakeshop-rust-delta.vercel.app/)

## 📋 Project Overview

This project is a **prototype** developed for a real pastry shop in Paris. It serves as a digital showcase for their products while providing a seamless online ordering experience. The application is intentionally simple and rudimentary at this stage, serving as a foundation for gathering feedback from the shop owner before implementing more advanced features.

### 🎯 Current Features

- **Product Showcase**: Beautiful gallery of cakes and pastries
- **Click & Collect Ordering**: Online ordering system for pickup
- **Responsive Design**: Optimized for all devices
- **Shopping Cart**: Add/remove items with size selection for whole cakes
- **Order Management**: Basic order processing and confirmation
- **Email Notifications**: Order confirmations for customers and shop owner
- **SMS Notifications**: Real-time alerts via Twilio integration
- **Print Integration**: Receipt printing for shop operations

### 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Email Service**: SendGrid
- **SMS Service**: Twilio
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/borntobesso/cakeshop.git
   cd cakeshop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Email Configuration
   NEXT_PUBLIC_EMAIL_HOST=smtp.gmail.com
   NEXT_PUBLIC_EMAIL_PORT=587
   NEXT_PUBLIC_EMAIL_USER=shop@example.com
   NEXT_PUBLIC_EMAIL_PASSWORD=your_email_host_password

   # Shop Information
   NEXT_PUBLIC_SHOP_NAME="Your Pastry Shop"
   NEXT_PUBLIC_SENDER_EMAIL=noreply@example.com
   NEXT_PUBLIC_SHOP_EMAIL="Your Pastry Shop Email"

   # Hiboutik Configuration
   NEXT_PUBLIC_HIBOUTIK_API_LOGIN=your_shop_login
   NEXT_PUBLIC_HIBOUTIK_API_KEY=your_hiboutik_api_key
   NEXT_PUBLIC_STORE_IP_ADDR=your_store_ip
   NEXT_PUBLIC_HIBOUTIK_PRINTER_PORT=your_shop_printer_port

   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔮 Planned Features

Based on feedback from the pastry shop owner, the following features are planned for implementation:

- **Database Integration**: PostgreSQL or MongoDB for persistent data storage
- **Order History**: Customer order tracking and history
- **Admin Dashboard**: Shop owner interface for order management
- **Payment Integration**: Stripe or PayPal for online payments
- **Inventory Management**: Stock tracking and availability
- **Customer Accounts**: User registration and profiles
- **Advanced Notifications**: WhatsApp integration and email templates
- **Analytics**: Sales reporting and customer insights

## 💼 Portfolio Project

This project is part of my portfolio as I seek **apprenticeship or internship opportunities** in web development. It demonstrates:

- **Full-stack development** with modern technologies
- **Real-world application** solving actual business needs
- **User-centered design** and responsive development
- **Third-party integrations** (email, SMS, payment systems)
- **Agile development** approach with iterative improvements

## 🤝 Contributing

As this is a learning project and portfolio piece, I welcome feedback and suggestions. Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Provide feedback on code structure and best practices

## 📞 Contact

If you're interested in discussing this project, potential opportunities, or have questions about the implementation:

- **GitHub**: https://github.com/borntobesso
- **Email**: soyoung.jung13@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/soyoung-jung-dev/

## 📄 License

This project is for educational and portfolio purposes. Please respect the business context and avoid commercial use without permission.

---

_This project represents my journey in learning modern web development while solving real business challenges. Thank you for taking the time to review my work!_
