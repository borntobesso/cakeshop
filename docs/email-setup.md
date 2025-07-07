# Email Setup Guide for My Pastry Shop Application

This guide covers setting up email notifications for order confirmations and shop notifications in my pastry shop app.

## Option 1: Gmail SMTP Setup (Simple but Limited)

1. **Enable 2-Step Verification** on my Google account
2. **Create an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to environment variables**:
   ```env
   NEXT_PUBLIC_EMAIL_USER=my_gmail@gmail.com
   NEXT_PUBLIC_EMAIL_PASSWORD=generated_app_password
   ```

## Option 2: SendGrid Setup (Recommended for Production)

### 1. Create SendGrid Account

- Go to [SendGrid's website](https://signup.sendgrid.com/)
- Sign up using my business email
- Choose the "Free" plan (100 emails/day)

### 2. Verify Sender Identity

- Navigate to Settings → Sender Authentication
- Choose "Single Sender Verification"
- Enter my business email address
- Complete the verification process by checking my email

### 3. Create API Key

- Go to Settings → API Keys
- Click "Create API Key"
- Choose "Restricted Access" and select only "Mail Send" permissions
- Copy the generated API key (save it securely - it won't be shown again)

## Environment Variables Configuration

Add these to my `.env.local` file:

```env
# SendGrid Configuration
NEXT_PUBLIC_SENDGRID_API_KEY=SG.your_api_key_here
NEXT_PUBLIC_SHOP_EMAIL=my_shop@domain.com
NEXT_PUBLIC_SENDER_EMAIL=my_verified_sender@domain.com
NEXT_PUBLIC_SHOP_NAME="My Pastry Shop"
NEXT_PUBLIC_SHOP_PHONE=+33612345678

# Gmail SMTP (alternative)
NEXT_PUBLIC_EMAIL_USER=my_gmail@gmail.com
NEXT_PUBLIC_EMAIL_PASSWORD=my_app_password
```

Replace with my actual information:

- `SENDGRID_API_KEY`: The API key from SendGrid dashboard
- `SHOP_EMAIL`: Where I want to receive order notifications
- `SENDER_EMAIL`: The verified sender address in SendGrid
- `SHOP_NAME`: My business name for email templates
- `SHOP_PHONE`: My business phone number

## Email Templates Implementation

### Customer Confirmation Email

- Order summary with items and quantities
- Pickup date and time
- Total amount
- Shop contact information
- Order number for reference

### Shop Notification Email

- New order alert
- Customer details
- Order summary
- Pickup information
- Quick action buttons (if needed)

## Testing and Development

1. **Test Email Delivery**:

   - Send test emails to my own address
   - Check spam folder if emails don't arrive
   - Verify email formatting on different devices

2. **Monitor Usage**:
   - Track email sending in SendGrid dashboard
   - Monitor delivery rates and bounces
   - Check for any blocked emails

## Limits and Considerations

### SendGrid Free Plan

- **Limit**: 100 emails per day
- **Features**: Basic analytics, API access
- **Upgrade**: $14.95/month for 50,000 emails

### Gmail SMTP

- **Limit**: 500 emails per day
- **Considerations**: Less reliable for business use
- **Risk**: Account suspension if flagged as spam

## Troubleshooting

### Common Issues

- **Emails in spam**: Check sender reputation and content
- **API key errors**: Verify key permissions in SendGrid
- **Authentication failures**: Check Gmail app password setup
- **Rate limits**: Monitor daily usage in dashboards

### Debug Steps

1. Check environment variables are loaded correctly
2. Verify API credentials in SendGrid/Gmail
3. Test with simple email first
4. Check server logs for error messages
5. Validate email addresses format

## Security Best Practices

- Never commit API keys to version control
- Use environment variables for all credentials
- Rotate API keys periodically
- Monitor for unauthorized usage
- Keep SendGrid account secure with 2FA

## Next Steps

1. Choose between Gmail SMTP or SendGrid
2. Set up chosen email service
3. Configure environment variables
4. Implement email templates
5. Test thoroughly before production
6. Set up monitoring and alerts
