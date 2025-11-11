import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email configuration
const EMAIL_HOST = process.env.NEXT_PUBLIC_EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.NEXT_PUBLIC_EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.NEXT_PUBLIC_EMAIL_USER;
const EMAIL_PASS = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
const SHOP_EMAIL = process.env.NEXT_PUBLIC_SHOP_EMAIL;
const SENDER_EMAIL = process.env.NEXT_PUBLIC_SENDER_EMAIL;
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || "Fu Pâtisserie";

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
  message: string;
  images?: Array<{
    filename: string;
    content: string; // base64 encoded
    contentType: string;
  }>;
}

function createContactEmailHTML(data: ContactFormData) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle demande de gâteau événementiel</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #FFDCD5 0%, #FFEEB5 100%);
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #333;
            font-size: 28px;
          }
          .section {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #FFDCD5;
          }
          .section h2 {
            margin-top: 0;
            color: #555;
            font-size: 20px;
            border-bottom: 2px solid #FFEEB5;
            padding-bottom: 10px;
          }
          .info-row {
            display: flex;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            min-width: 150px;
          }
          .info-value {
            color: #333;
            flex: 1;
          }
          .message-box {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.8;
          }
          .images-section {
            background-color: #fff3e0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
          }
          .timestamp {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-style: italic;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎂 Nouvelle Demande de Gâteau Événementiel</h1>
        </div>

        <div class="section">
          <h2>👤 Informations du Client</h2>
          <div class="info-row">
            <span class="info-label">Nom :</span>
            <span class="info-value">${data.firstName} ${data.lastName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email :</span>
            <span class="info-value"><a href="mailto:${data.email}">${data.email}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Téléphone :</span>
            <span class="info-value"><a href="tel:${data.phone}">${data.phone}</a></span>
          </div>
        </div>

        <div class="section">
          <h2>🎉 Détails de l'Événement</h2>
          <div class="info-row">
            <span class="info-label">Date de l'événement :</span>
            <span class="info-value">${new Date(data.eventDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type d'événement :</span>
            <span class="info-value">${data.eventType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Nombre d'invités :</span>
            <span class="info-value">${data.guestCount}</span>
          </div>
        </div>

        <div class="section">
          <h2>💬 Message du Client</h2>
          <div class="message-box">${data.message}</div>
        </div>

        ${data.images && data.images.length > 0 ? `
          <div class="images-section">
            <h2>📷 Images de Référence</h2>
            <p><strong>${data.images.length}</strong> image(s) jointe(s) à ce message</p>
            <p style="font-size: 14px; color: #666;">Les images sont attachées à cet email en pièces jointes.</p>
          </div>
        ` : ''}

        <div class="timestamp">
          <p>Demande reçue le ${new Date().toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="footer">
          <p><strong>${SHOP_NAME}</strong></p>
          <p>101 Avenue de Choisy, 75013 Paris</p>
          <p>Tél: 01 40 21 04 55</p>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
      console.error("Email configuration missing");
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    const data: ContactFormData = await request.json();

    // Prepare attachments if images are provided
    const attachments = data.images?.map((img) => ({
      filename: img.filename,
      content: img.content.split(',')[1], // Remove data:image/jpeg;base64, prefix
      encoding: 'base64' as const,
      contentType: img.contentType,
    })) || [];

    const mailOptions = {
      from: `"${SHOP_NAME} - Demande Événementiel" <${SENDER_EMAIL}>`,
      to: SHOP_EMAIL || "fupatisserie@gmail.com",
      replyTo: data.email,
      subject: `🎂 Nouvelle demande - ${data.eventType} - ${data.firstName} ${data.lastName}`,
      html: createContactEmailHTML(data),
      attachments: attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Contact form email sent successfully: ${result.messageId}`);
    console.log(`From: ${data.firstName} ${data.lastName} (${data.email})`);
    console.log(`Event: ${data.eventType} on ${data.eventDate}`);
    console.log(`Images attached: ${attachments.length}`);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error("Contact form email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Email sending failed"
      },
      { status: 500 }
    );
  }
}
