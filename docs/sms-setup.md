# Twilio SMS Notifications Setup Guide

This guide explains how to set up Twilio to receive SMS notifications for new orders in my pastry shop application.

## 1. Creating a Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and create a free account
2. Verify my phone number and email address
3. Once logged in, I'll have access to trial credit (approximately $15-20)

## 2. Getting Twilio Credentials

1. In the Twilio dashboard, go to "Account Info"
2. Note down the following information:
   - Account SID
   - Auth Token
   - My Twilio phone number (format: +1234567890)

## 3. Environment Variables Configuration

I need to add these variables to my `.env.local` file:

```env
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=my_account_sid
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=my_auth_token
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=my_twilio_number
NEXT_PUBLIC_SHOP_PHONE=my_personal_phone_number
```

## 4. Testing the Configuration

1. I'll test SMS sending with my Twilio account
2. I should receive a test SMS on my personal phone number
3. Verify that the message is properly received and readable

## 5. Costs and Limits

- **Trial period**: Free $15-20 credit
- **After trial period**:
  - Outbound SMS: ~$0.0075 per message
  - Inbound SMS: ~$0.0075 per message
  - Estimation for 10 orders per day: ~$2.25 per month

## 6. Important Notes

- SMS notifications are sent only to the shop owner (me)
- SMS content includes:
  - Customer name
  - Pickup date and time
  - Total order amount
- SMS notifications are sent simultaneously with email confirmations
- If Twilio has issues, email notifications will continue to work as backup

## 7. Implementation Details

The SMS notification will be triggered when:

- A new order is placed
- Order status changes (if implemented later)
- Payment is confirmed

The message format will be:

```
New Order #25-0107-01
Customer: [Name]
Pickup: [Date] at [Time]
Total: €[Amount]
```

## 8. Troubleshooting

- **SMS not received**: Check phone number format and Twilio account status
- **Authentication errors**: Verify Account SID and Auth Token
- **Rate limits**: Monitor usage in Twilio console
- **Delivery failures**: Check Twilio logs for detailed error messages

## 9. Next Steps

1. Set up Twilio account and get credentials
2. Add environment variables to my project
3. Test the integration with a sample order
4. Monitor initial usage and costs
5. Consider upgrading account when trial credit runs low
