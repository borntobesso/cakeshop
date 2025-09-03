   !/bin/bash

# Cron script to send pickup reminders
# Add this to your crontab to run every 5 minutes:
# */5 * * * * /path/to/your/project/scripts/cron-send-reminders.sh >> /var/log/cron-reminders.log 2>&1

# Configuration
APP_URL="${NEXTAUTH_URL:-http://localhost:3000}"
````CRON_SECRET_TOKEN````="${CRON_SECRET_TOKEN}"
LOG_FILE="/tmp/reminder-cron.log"

# Add timestamp to log
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting reminder cron job" >> "$LOG_FILE"

# Make the API call
if [ -n "$CRON_SECRET_TOKEN" ]; then
    # With authentication token
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CRON_SECRET_TOKEN" \
        "$APP_URL/api/cron/send-reminders")
else
    # Without authentication (less secure)
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        "$APP_URL/api/cron/send-reminders")
fi

# Check if curl was successful
if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Cron job completed successfully" >> "$LOG_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Response: $response" >> "$LOG_FILE"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Cron job failed - curl error" >> "$LOG_FILE"
    exit 1
fi