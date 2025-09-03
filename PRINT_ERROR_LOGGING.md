# Print Error Logging System

This document explains how to use the print error logging system for troubleshooting printer issues.

## Overview

The system automatically logs all print failures with comprehensive details including:
- Order information (customer, items, pickup details)
- Technical error details (attempts, retries, API responses)
- Severity levels (Critical vs Warning)
- Resolution tracking

## Accessing Print Error Logs

### 1. Via API Endpoint

**Get Recent Logs:**
```
GET /api/admin/print-logs
```

**Get Critical Errors Only:**
```
GET /api/admin/print-logs?severity=critical
```

**Get Last 24 Hours:**
```
GET /api/admin/print-logs?sinceHours=24
```

**Get Error Statistics:**
```
GET /api/admin/print-logs?stats=true&sinceHours=24
```

**Export as CSV:**
```
GET /api/admin/print-logs?format=csv
```

### 2. API Response Examples

**Log Entry Structure:**
```json
{
  "id": "print_err_mf1q2u6b_i0bxax",
  "timestamp": "2025-09-01T23:00:13.763Z",
  "orderId": "test_order_001",
  "orderNumber": "020925-001",
  "severity": "critical",
  "errorMessage": "Printer is offline",
  "technicalDetails": {
    "printAttempts": 6,
    "successfulPrints": 0,
    "failedPrints": 2,
    "retryCount": 4,
    "printerApiResponse": {...},
    "httpStatus": 500
  },
  "orderContext": {
    "customerName": "Alice Dupont",
    "customerPhone": "+33123456789",
    "totalAmount": 35.50,
    "pickupDate": "02/09/2025",
    "pickupTime": "14:30",
    "paymentMethod": "online",
    "itemCount": 2
  },
  "resolution": {
    "resolved": true,
    "resolvedAt": "2025-09-01T23:05:00.000Z",
    "resolution": "Printer restarted",
    "resolvedBy": "admin"
  }
}
```

**Statistics Response:**
```json
{
  "stats": {
    "totalErrors": 15,
    "criticalErrors": 5,
    "warningErrors": 10,
    "errorsPerHour": 2.3,
    "commonErrors": [
      { "error": "Printer offline", "count": 8 },
      { "error": "Out of paper", "count": 4 }
    ],
    "affectedOrders": 12
  }
}
```

## Error Severity Levels

### 🚨 Critical Errors
- **Definition:** No receipts printed (0 of 2)
- **Impact:** Order completely without receipt
- **Notifications:** SMS + Email sent immediately
- **Action Required:** Immediate intervention needed

**Common Critical Errors:**
- Printer offline/unreachable
- Network connectivity issues
- Printer hardware failure
- API authentication failure

### ⚠️ Warning Errors  
- **Definition:** Partial printing (1 of 2 receipts)
- **Impact:** One receipt missing
- **Notifications:** SMS sent, email sent for backup
- **Action Required:** Check and reprint if needed

**Common Warning Errors:**
- Paper low/jam on second print
- Intermittent network issues
- Temporary API delays

## Troubleshooting Common Issues

### 1. Printer Offline Errors
```
Error: "Printer is offline"
Status: printer_status = "offline"
```
**Solutions:**
- Check printer power and connectivity
- Verify network connection to `80.15.110.147:9177`
- Restart printer if necessary
- Check Hiboutik printer service status

### 2. Network/Connection Issues
```
Error: "Connection timeout"
Status: timeout = true
```
**Solutions:**
- Check internet connectivity
- Verify IP address configuration
- Check firewall settings
- Test Hiboutik API connectivity

### 3. Paper Issues
```
Error: "Printer out of paper"
Status: printer_status = "no_paper"
```
**Solutions:**
- Refill printer paper
- Check paper alignment
- Clear any paper jams

### 4. API Authentication Issues
```
Error: "Print HTTP error: 401"
Status: HTTP 401 Unauthorized
```
**Solutions:**
- Verify Hiboutik API credentials in environment variables
- Check API key expiration
- Confirm store ID configuration

## Marking Errors as Resolved

When you fix an issue, mark it as resolved via API:

```bash
curl -X POST /api/admin/print-logs \
  -H "Content-Type: application/json" \
  -d '{
    "action": "resolve",
    "logId": "print_err_mf1q2u6b_i0bxax",
    "resolution": "Printer was restarted and connectivity restored",
    "resolvedBy": "admin_name"
  }'
```

## Monitoring Recommendations

### Daily Monitoring
1. Check error statistics for last 24 hours
2. Review unresolved critical errors
3. Monitor error rates and trends

### Weekly Review
1. Export error logs as CSV for analysis
2. Identify recurring issues
3. Plan preventive maintenance

### Alert Thresholds
- **Critical:** More than 3 critical errors/day
- **Warning:** Error rate > 10% of orders
- **Pattern:** Same error recurring 5+ times

## File Locations

- **Log Files:** `/logs/print-errors.jsonl` (production)
- **API Endpoint:** `/api/admin/print-logs`
- **Error Logger:** `/src/lib/error-logger.ts`
- **Print Service:** `/src/lib/order-notifications.ts`

## Environment Variables

Ensure these are configured for proper error tracking:

```env
# Printer Configuration
NEXT_PUBLIC_HIBOUTIK_API_LOGIN=fupatisserie@gmail.com
NEXT_PUBLIC_HIBOUTIK_API_KEY=your_api_key
NEXT_PUBLIC_STORE_IP_ADDR=80.15.110.147
NEXT_PUBLIC_HIBOUTIK_PRINTER_PORT=9177

# Notification Settings
NEXT_PUBLIC_SHOP_EMAIL=your@email.com
NEXT_PUBLIC_SHOP_PHONE=+33123456789
```

## Emergency Procedures

### Complete Printer Failure
1. **Immediate:** Check error logs for details
2. **Temporary:** Manually track orders needing receipts
3. **Communication:** Inform staff about manual receipt procedure
4. **Resolution:** Follow troubleshooting guide above
5. **Recovery:** Verify system working, clear resolved errors

### High Error Rate (>20%)
1. **Analysis:** Review error patterns in logs
2. **Investigation:** Check system components systematically
3. **Escalation:** Contact technical support if needed
4. **Prevention:** Implement monitoring improvements

---

*This logging system runs automatically and requires no manual intervention for error capture. Focus on resolution and pattern analysis.*