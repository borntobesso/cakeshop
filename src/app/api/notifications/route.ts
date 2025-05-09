import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fetch from "node-fetch";

// Email configuration
const EMAIL_HOST = process.env.NEXT_PUBLIC_EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.NEXT_PUBLIC_EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.NEXT_PUBLIC_EMAIL_USER;
const EMAIL_PASS = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
const SHOP_EMAIL = process.env.NEXT_PUBLIC_SHOP_EMAIL;
const SENDER_EMAIL = process.env.NEXT_PUBLIC_SENDER_EMAIL;
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || "Fu Pâtisserie";

// Hiboutik API configuration
const HIBOUTIK_API_LOGIN = process.env.NEXT_PUBLIC_HIBOUTIK_API_LOGIN;
const HIBOUTIK_API_KEY = process.env.NEXT_PUBLIC_HIBOUTIK_API_KEY;
const HIBOUTIK_STORE_ID = 1; // Store ID as specified
const HIBOUTIK_PRINTER_IP = process.env.NEXT_PUBLIC_HIBOUTIK_PRINTER_IP;
const HIBOUTIK_PRINTER_PORT = process.env.NEXT_PUBLIC_HIBOUTIK_PRINTER_PORT;

// Log environment variables (without sensitive data)
console.log("Environment check:", {
  hasEmailConfig: !!(EMAIL_HOST && EMAIL_USER && EMAIL_PASS),
  hasShopEmail: !!SHOP_EMAIL,
  hasSenderEmail: !!SENDER_EMAIL,
  hasHiboutikConfig: !!(
    HIBOUTIK_API_LOGIN &&
    HIBOUTIK_API_KEY &&
    HIBOUTIK_PRINTER_IP
  ),
});

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

interface OrderDetails {
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  totalPrice: number;
}

function createCustomerEmailHTML(orderDetails: OrderDetails) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande - ${SHOP_NAME}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .order-details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .total {
            font-weight: bold;
            font-size: 1.2em;
            margin-top: 20px;
          }
          .pickup-info {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="cid:unique-logo-id" alt="${SHOP_NAME}" class="logo">
          <h1>Confirmation de votre commande</h1>
        </div>
        
        <p>Bonjour ${orderDetails.customerName},</p>
        
        <p>Merci pour votre commande chez ${SHOP_NAME} !</p>
        
        <div class="order-details">
          <h2>Détails de votre commande :</h2>
          ${orderDetails.items
            .map(
              (item) => `
            <div class="item">
              <strong>${item.name}${
                item.size ? ` (${item.size})` : ""
              }</strong><br>
              Quantité: ${item.quantity}<br>
              Prix: ${item.price * item.quantity}€
            </div>
          `
            )
            .join("")}
          
          <div class="total">
            Total : ${orderDetails.totalPrice}€
          </div>
        </div>
        
        <div class="pickup-info">
          <h2>Informations de retrait :</h2>
          <p>Date : ${orderDetails.pickupDate}</p>
          <p>Heure : ${orderDetails.pickupTime}</p>
          <p>Adresse : 101 Avenue de Choisy, 75013 Paris</p>
        </div>
        
        <p>À bientôt chez ${SHOP_NAME} !</p>
        
        <div class="footer">
          <p>${SHOP_NAME}</p>
          <p>101 Avenue de Choisy, 75013 Paris</p>
          <p>Tél: 01 40 21 04 55</p>
        </div>
      </body>
    </html>
  `;
}

function createOwnerEmailHTML(orderDetails: OrderDetails) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle commande reçue</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #ff6b6b;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            margin-bottom: 30px;
          }
          .customer-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .order-details {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 20px 0;
          }
          .item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .total {
            font-weight: bold;
            font-size: 1.2em;
            margin-top: 20px;
            color: #ff6b6b;
          }
          .pickup-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Nouvelle commande reçue !</h1>
        </div>
        
        <div class="customer-info">
          <h2>Informations client :</h2>
          <p>Nom : ${orderDetails.customerName}</p>
          <p>Email : ${orderDetails.email}</p>
          <p>Téléphone : ${orderDetails.phone}</p>
        </div>
        
        <div class="order-details">
          <h2>Détails de la commande :</h2>
          ${orderDetails.items
            .map(
              (item) => `
            <div class="item">
              <strong>${item.name}${
                item.size ? ` (${item.size})` : ""
              }</strong><br>
              Quantité: ${item.quantity}<br>
              Prix: ${item.price * item.quantity}€
            </div>
          `
            )
            .join("")}
          
          <div class="total">
            Total : ${orderDetails.totalPrice}€
          </div>
        </div>
        
        <div class="pickup-info">
          <h2>Informations de retrait :</h2>
          <p>Date : ${orderDetails.pickupDate}</p>
          <p>Heure : ${orderDetails.pickupTime}</p>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  console.log("API route called with method: POST");

  try {
    const orderDetails: OrderDetails = await request.json();
    console.log("Request body:", orderDetails);

    // Validate required fields
    if (
      !orderDetails.customerName ||
      !orderDetails.email ||
      !orderDetails.phone
    ) {
      console.error("Missing required fields:", {
        hasCustomerName: !!orderDetails.customerName,
        hasEmail: !!orderDetails.email,
        hasPhone: !!orderDetails.phone,
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
      console.error("Email configuration is missing");
      return NextResponse.json(
        { success: false, error: "Email configuration is incomplete" },
        { status: 500 }
      );
    }

    if (!SHOP_EMAIL || !SENDER_EMAIL) {
      console.error("Email addresses configuration is missing:", {
        hasShopEmail: !!SHOP_EMAIL,
        hasSenderEmail: !!SENDER_EMAIL,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Email addresses configuration is incomplete",
        },
        { status: 500 }
      );
    }

    // Email to customer
    const customerEmailOptions = {
      from: `"${SHOP_NAME}" <${SENDER_EMAIL}>`,
      to: orderDetails.email,
      subject: `Confirmation de votre commande - ${SHOP_NAME}`,
      html: createCustomerEmailHTML(orderDetails),
      attachments: [
        {
          filename: "logo.webp",
          path:
            process.env.VERCEL === "1"
              ? "logo-JPG.webp"
              : process.cwd() + "/public/logo-JPG.webp",
          cid: "unique-logo-id", // Use this ID in the image src
        },
      ],
      text: `
Bonjour ${orderDetails.customerName},

Merci pour votre commande chez ${SHOP_NAME} !

Détails de votre commande :
${orderDetails.items
  .map(
    (item) =>
      `- ${item.name}${item.size ? ` (${item.size})` : ""} x${
        item.quantity
      } : ${item.price * item.quantity}€`
  )
  .join("\n")}

Total : ${orderDetails.totalPrice}€

Date de retrait : ${orderDetails.pickupDate} à ${orderDetails.pickupTime}

À bientôt chez ${SHOP_NAME} !
      `.trim(),
    };

    // Email to shop owner
    const ownerEmailOptions = {
      from: `"Système de commandes" <${SENDER_EMAIL}>`,
      to: SHOP_EMAIL,
      subject: "Nouvelle commande reçue",
      html: createOwnerEmailHTML(orderDetails),
      text: `
Nouvelle commande reçue !

Client : ${orderDetails.customerName}
Email : ${orderDetails.email}
Téléphone : ${orderDetails.phone}

Détails de la commande :
${orderDetails.items
  .map(
    (item) =>
      `- ${item.name}${item.size ? ` (${item.size})` : ""} x${
        item.quantity
      } : ${item.price * item.quantity}€`
  )
  .join("\n")}

Total : ${orderDetails.totalPrice}€

Date de retrait : ${orderDetails.pickupDate} à ${orderDetails.pickupTime}
      `.trim(),
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(customerEmailOptions),
      transporter.sendMail(ownerEmailOptions),
    ]);

    // Print order notification using Hiboutik API
    if (HIBOUTIK_API_LOGIN && HIBOUTIK_API_KEY && HIBOUTIK_PRINTER_IP) {
      try {
        // Prepare the print content
        const printContent = `
=========================
NOUVELLE COMMANDE
=========================
Client: ${orderDetails.customerName}
Tel: ${orderDetails.phone}
Email: ${orderDetails.email}

DATE DE RETRAIT:
${orderDetails.pickupDate}
${orderDetails.pickupTime}

PRODUITS:
${orderDetails.items
  .map(
    (item) =>
      `${item.name}${item.size ? ` (${item.size})` : ""} x${item.quantity} : ${
        item.price * item.quantity
      }€`
  )
  .join("\n")}

TOTAL: ${orderDetails.totalPrice}€
=========================
        `.trim();

        // Create authentication string for Basic Auth
        const auth = Buffer.from(
          `${HIBOUTIK_API_LOGIN}:${HIBOUTIK_API_KEY}`
        ).toString("base64");

        // Send the print request
        const printResponse = await fetch(
          "https://fupatisserie.hiboutik.com/api/print/misc",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
              store_id: HIBOUTIK_STORE_ID,
              ip_address: HIBOUTIK_PRINTER_IP,
              port: HIBOUTIK_PRINTER_PORT || "", // Leave blank for default if not specified
              // printer: "receipt", // Using receipt printer as default
              data: printContent,
            }),
          }
        );

        const printResult = await printResponse.json();
        console.log("Print request result:", printResult);

        if (!printResponse.ok) {
          console.error("Error printing:", printResult);
        }
      } catch (printError) {
        console.error(
          "Error printing notification:",
          JSON.stringify(printError, null, 2)
        );
        // Don't fail the whole request if printing fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
