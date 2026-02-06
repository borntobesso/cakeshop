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
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

interface EmailRequest {
  type: "order_confirmation" | "new_order_shop" | "print_failure" | "pickup_reminder";
  order: any;
  to: string;
  error?: string;
  severity?: 'warning' | 'critical';
}

function createCustomerEmailHTML(order: any) {
  const pickupDate = new Date(order.pickupDate).toLocaleDateString('fr-FR');
  
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
          .payment-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
          }
          .payment-online {
            background-color: #e8f5e8;
            border-left-color: #4caf50;
          }
          .payment-onsite {
            background-color: #fff3e0;
            border-left-color: #ff9800;
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
          <h1>Confirmation de votre commande</h1>
        </div>

        <p>Bonjour ${order.customerName},</p>

        <p>Merci pour votre commande chez ${SHOP_NAME} !</p>

        <div class="order-details">
          <h2>Détails de votre commande :</h2>
          ${order.items
            .map((item: any) => `
            <div class="item">
              <strong>${item.name}${item.size ? ` (${item.size})` : ""}</strong><br>
              Quantité: ${item.quantity}<br>
              Prix: ${(item.price * item.quantity).toFixed(2)}€
            </div>
          `)
            .join("")}

          <div class="total">
            Total : ${order.totalAmount.toFixed(2)}€
          </div>
        </div>

        <div class="payment-info ${order.paymentMethod === 'online' ? 'payment-online' : 'payment-onsite'}">
          <h2>💳 Informations de paiement :</h2>
          ${order.paymentMethod === 'online' 
            ? `<p><strong>✅ Paiement en ligne :</strong> PAYÉ</p>
               <p>Votre commande est entièrement réglée. Vous n'avez rien à payer lors du retrait.</p>`
            : `<p><strong>🏪 Paiement sur place :</strong> À RÉGLER</p>
               <p>Le montant de <strong>${order.totalAmount.toFixed(2)}€</strong> sera à régler lors du retrait en magasin.</p>
               <p>Moyens de paiement acceptés : Espèces, Carte bancaire</p>`}
          ${order.specialCode ? `<p><strong>🎟️ Code spécial utilisé :</strong> ${order.specialCode}</p>` : ''}
        </div>

        <div class="pickup-info">
          <h2>📍 Informations de retrait :</h2>
          <p><strong>Date :</strong> ${pickupDate}</p>
          <p><strong>Heure :</strong> ${order.pickupTime}</p>
          <p><strong>Adresse :</strong> 101 Avenue de Choisy, 75013 Paris</p>
        </div>

        <p><strong>📋 Numéro de commande :</strong> ${order.orderNumber || order.id.slice(-8)}</p>

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

function createShopEmailHTML(order: any) {
  const pickupDate = new Date(order.pickupDate).toLocaleDateString('fr-FR');
  
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
          .payment-info {
            background-color: #f3e5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #9c27b0;
          }
          .payment-online {
            background-color: #e8f5e8;
            border-left-color: #4caf50;
          }
          .payment-onsite {
            background-color: #fff3e0;
            border-left-color: #ff9800;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Nouvelle commande reçue !</h1>
        </div>

        <div class="customer-info">
          <h2>Informations client :</h2>
          <p>Nom : ${order.customerName}</p>
          <p>Email : ${order.customerEmail}</p>
          <p>Téléphone : ${order.customerPhone}</p>
        </div>

        <div class="order-details">
          <h2>Détails de la commande :</h2>
          ${order.items
            .map((item: any) => `
            <div class="item">
              <strong>${item.name}${item.size ? ` (${item.size})` : ""}</strong><br>
              Quantité: ${item.quantity}<br>
              Prix: ${(item.price * item.quantity).toFixed(2)}€
            </div>
          `)
            .join("")}

          <div class="total">
            Total : ${order.totalAmount.toFixed(2)}€
          </div>
        </div>

        <div class="payment-info ${order.paymentMethod === 'online' ? 'payment-online' : 'payment-onsite'}">
          <h2>💳 Statut de paiement :</h2>
          ${order.paymentMethod === 'online' 
            ? `<p><strong>✅ Paiement en ligne : PAYÉ</strong></p>
               <p>La commande est entièrement réglée. Aucun paiement à encaisser.</p>`
            : `<p><strong>🏪 Paiement sur place : À ENCAISSER</strong></p>
               <p>Montant à encaisser : <strong>${order.totalAmount.toFixed(2)}€</strong></p>
               <p>⚠️ Paiement requis lors du retrait</p>`}
          ${order.specialCode ? `<p><strong>🎟️ Code spécial appliqué :</strong> ${order.specialCode}</p>` : ''}
        </div>

        <div class="pickup-info">
          <h2>📍 Informations de retrait :</h2>
          <p><strong>Date :</strong> ${pickupDate}</p>
          <p><strong>Heure :</strong> ${order.pickupTime}</p>
        </div>

        <p><strong>📋 Numéro de commande:</strong> ${order.orderNumber || order.id.slice(-8)}</p>
        <p><strong>🔗 ID Système:</strong> ${order.id.slice(-8)}</p>
      </body>
    </html>
  `;
}

function createPrintFailureEmailHTML(order: any, error: string, severity: 'warning' | 'critical') {
  const pickupDate = new Date(order.pickupDate).toLocaleDateString('fr-FR');
  const urgencyColor = severity === 'critical' ? '#dc3545' : '#fd7e14';
  const urgencyIcon = severity === 'critical' ? '🚨' : '⚠️';
  const urgencyText = severity === 'critical' ? 'CRITIQUE' : 'AVERTISSEMENT';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Erreur d'impression ${urgencyText} - Commande ${order.orderNumber || order.id.slice(-8)}</title>
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
            background-color: ${urgencyColor};
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 3px solid ${severity === 'critical' ? '#b71c1c' : '#e65100'};
          }
          .severity-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .error-info {
            background-color: ${severity === 'critical' ? '#f8d7da' : '#fff3cd'};
            border: 2px solid ${severity === 'critical' ? '#f5c6cb' : '#ffeaa7'};
            color: ${severity === 'critical' ? '#721c24' : '#856404'};
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .customer-info {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
          }
          .order-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
          }
          .item {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .item-details {
            flex: 1;
          }
          .item-price {
            font-weight: bold;
            color: ${urgencyColor};
          }
          .total {
            font-weight: bold;
            font-size: 1.3em;
            margin-top: 20px;
            padding: 15px;
            background-color: ${severity === 'critical' ? '#f5c6cb' : '#d4edda'};
            border-radius: 5px;
            text-align: center;
            color: ${severity === 'critical' ? '#721c24' : '#155724'};
          }
          .pickup-info {
            background-color: #fff3e0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
          }
          .payment-info {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #9c27b0;
          }
          .payment-online {
            background-color: #e8f5e8;
            border-left-color: #4caf50;
          }
          .payment-onsite {
            background-color: #fff3e0;
            border-left-color: #ff9800;
          }
          .action-required {
            background-color: #ffebee;
            border: 2px solid #f44336;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            text-align: center;
          }
          .timestamp {
            font-size: 0.9em;
            color: #666;
            margin-top: 20px;
            text-align: center;
            font-style: italic;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="severity-badge">${urgencyIcon} ${urgencyText}</div>
          <h1>Erreur d'impression détectée</h1>
          <p style="margin: 0; font-size: 1.1em;">Une intervention est requise</p>
        </div>

        <div class="error-info">
          <h2>🔧 Détails techniques de l'erreur</h2>
          <p><strong>Type d'erreur :</strong> ${error}</p>
          <p><strong>Sévérité :</strong> ${urgencyText}</p>
          <p><strong>Heure de détection :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          ${severity === 'critical' 
            ? '<p><strong>⚠️ Impact :</strong> Aucune impression réussie - Intervention immédiate requise</p>' 
            : '<p><strong>ℹ️ Impact :</strong> Impression partielle - Vérification recommandée</p>'}
        </div>

        <div class="customer-info">
          <h2>👤 Informations client</h2>
          <p><strong>Nom :</strong> ${order.customerName}</p>
          <p><strong>Email :</strong> ${order.customerEmail}</p>
          <p><strong>Téléphone :</strong> ${order.customerPhone}</p>
        </div>

        <div class="order-details">
          <h2>📋 Détails de la commande affectée</h2>
          <p><strong>Numéro de commande :</strong> ${order.orderNumber || order.id.slice(-8)}</p>
          <p><strong>ID système :</strong> ${order.id}</p>
          
          <h3>Produits commandés :</h3>
          ${order.items
            .map((item: any) => `
            <div class="item">
              <div class="item-details">
                <strong>${item.name}${item.size ? ` (${item.size})` : ""}</strong><br>
                <span style="color: #666;">Quantité : ${item.quantity}</span>
              </div>
              <div class="item-price">${(item.price * item.quantity).toFixed(2)}€</div>
            </div>
          `)
            .join("")}

          <div class="total">
            Total commande : ${order.totalAmount.toFixed(2)}€
          </div>
        </div>

        <div class="payment-info ${order.paymentMethod === 'online' ? 'payment-online' : 'payment-onsite'}">
          <h2>💳 Statut de paiement</h2>
          ${order.paymentMethod === 'online' 
            ? `<p><strong>✅ Paiement en ligne :</strong> PAYÉ</p>
               <p>Commande entièrement réglée. Aucun encaissement nécessaire.</p>`
            : `<p><strong>💰 Paiement sur place :</strong> À ENCAISSER</p>
               <p><strong>Montant à encaisser :</strong> ${order.totalAmount.toFixed(2)}€</p>`}
          ${order.specialCode ? `<p><strong>🎟️ Code spécial appliqué :</strong> ${order.specialCode}</p>` : ''}
        </div>

        <div class="pickup-info">
          <h2>📅 Informations de retrait</h2>
          <p><strong>Date de retrait :</strong> ${pickupDate}</p>
          <p><strong>Heure prévue :</strong> ${order.pickupTime}</p>
          <p><strong>Adresse :</strong> 101 Avenue de Choisy, 75013 Paris</p>
        </div>

        <div class="action-required">
          <h2>🔧 Actions requises</h2>
          ${severity === 'critical' 
            ? `<p><strong>URGENT :</strong> Aucune impression n'a réussi pour cette commande.</p>
               <p>1. Vérifier l'état de l'imprimante (papier, connexion, statut)</p>
               <p>2. Relancer l'impression manuellement depuis le système de commande</p>
               <p>3. Si le problème persiste, préparer la commande manuellement avec ces détails</p>`
            : `<p><strong>ATTENTION :</strong> Impression partielle détectée.</p>
               <p>1. Vérifier si les deux reçus ont bien été imprimés</p>
               <p>2. Relancer l'impression si nécessaire</p>
               <p>3. Conserver une copie de ce mail comme backup</p>`}
        </div>

        <div class="timestamp">
          <p>Email généré automatiquement le ${new Date().toLocaleString('fr-FR', { 
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
          <p style="margin-top: 15px; font-size: 0.8em;">
            Ce message a été généré automatiquement par le système de notification d'erreurs d'impression.
          </p>
        </div>
      </body>
    </html>
  `;
}

function createPickupReminderEmailHTML(order: any) {
  const pickupDate = new Date(order.pickupDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rappel de retrait - ${SHOP_NAME}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .reminder-icon {
            font-size: 3em;
            margin-bottom: 10px;
          }
          .reminder-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .pickup-info {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
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
          .payment-info {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #9c27b0;
          }
          .payment-online {
            background-color: #e8f5e8;
            border-left-color: #4caf50;
          }
          .payment-onsite {
            background-color: #fff3e0;
            border-left-color: #ff9800;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 0.9em;
            color: #666;
          }
          .important {
            background-color: #ffebee;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #f44336;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="reminder-icon">🔔</div>
          <h1>Rappel de retrait</h1>
          <p style="margin: 0; font-size: 1.1em;">Votre commande vous attend demain !</p>
        </div>

        <p>Bonjour ${order.customerName},</p>

        <div class="reminder-box">
          <h2>⏰ N'oubliez pas !</h2>
          <p style="font-size: 1.1em; margin: 0;">
            Votre commande est prête à être récupérée <strong>demain</strong>.
          </p>
        </div>

        <div class="pickup-info">
          <h2>📍 Détails du retrait</h2>
          <p><strong>📅 Date :</strong> ${pickupDate}</p>
          <p><strong>🕐 Heure :</strong> ${order.pickupTime}</p>
          <p><strong>📍 Adresse :</strong> 101 Avenue de Choisy, 75013 Paris</p>
        </div>

        <div class="payment-info ${order.paymentMethod === 'online' ? 'payment-online' : 'payment-onsite'}">
          <h2>💳 Paiement</h2>
          ${order.paymentMethod === 'online'
            ? `<p><strong>✅ Déjà payé en ligne</strong></p>
               <p>Vous n'avez rien à payer lors du retrait.</p>`
            : `<p><strong>💰 À payer sur place</strong></p>
               <p>Montant à régler : <strong>${order.totalAmount.toFixed(2)}€</strong></p>
               <p>Moyens de paiement : Espèces, Carte bancaire</p>`}
        </div>

        <div class="order-details">
          <h2>📋 Récapitulatif de votre commande</h2>
          <p><strong>Numéro de commande :</strong> ${order.orderNumber || order.id.slice(-8)}</p>

          ${order.items
            .map((item: any) => `
            <div class="item">
              <strong>${item.name}${item.size ? ` (${item.size})` : ""}</strong><br>
              Quantité: ${item.quantity}<br>
              Prix: ${(item.price * item.quantity).toFixed(2)}€
            </div>
          `)
            .join("")}

          <div class="total">
            Total : ${order.totalAmount.toFixed(2)}€
          </div>
        </div>

        <p>À demain chez ${SHOP_NAME} !</p>

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

    const body: EmailRequest = await request.json();
    const { type, order, to, error, severity } = body;

    let subject = "";
    let html = "";

    switch (type) {
      case "order_confirmation":
        subject = `Confirmation de votre commande - ${SHOP_NAME}`;
        html = createCustomerEmailHTML(order);
        break;
        
      case "new_order_shop":
        subject = `🧁 NOUVELLE COMMANDE - ${order.customerName} - ${new Date().toLocaleTimeString('fr-FR')}`;
        html = createShopEmailHTML(order);
        break;
        
      case "print_failure":
        const printSeverity = severity || 'critical';
        const urgencyPrefix = printSeverity === 'critical' ? '🚨 CRITIQUE' : '⚠️ AVERTISSEMENT';
        subject = `${urgencyPrefix} - Erreur impression - Commande ${order.orderNumber || order.id.slice(-8)}`;
        html = createPrintFailureEmailHTML(order, error || 'Erreur inconnue', printSeverity);
        break;

      case "pickup_reminder":
        subject = `🔔 Rappel - Retrait demain chez ${SHOP_NAME}`;
        html = createPickupReminderEmailHTML(order);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid email type" },
          { status: 400 }
        );
    }

    const mailOptions = {
      from: `"${SHOP_NAME}" <${SENDER_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${result.messageId}`);
    console.log(`Email type: ${type}, To: ${to}, Subject: ${subject}`);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      type: type,
      recipient: to,
      subject: subject,
    });

  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Email sending failed"
      },
      { status: 500 }
    );
  }
}