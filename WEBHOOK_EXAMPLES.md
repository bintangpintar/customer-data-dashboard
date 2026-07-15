# Webhook API - cURL Examples

## Message Sent Event (message.sent)

### Basic Example
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.sent",
    "to": "6281234567890",
    "body": "Penawaran khusus untuk Anda",
    "timestamp": 1745208000
  }'
```

### Complete Example with All Fields
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.sent",
    "deviceId": "D-ABC123",
    "msgId": "3EB0A1B2C3D4E5F60718",
    "to": "6281234567890",
    "messageType": "text",
    "body": "Penawaran khusus untuk Anda",
    "mediaUrl": "",
    "caption": null,
    "fileName": null,
    "timestamp": 1745208000,
    "queueTime": 1250,
    "clientMsgId": "INV-2026-0001",
    "message": "Message sent successfully (queue: 1250ms)"
  }'
```

### With Custom Timestamp (Current Time)
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"message.sent\",
    \"deviceId\": \"D-ABC123\",
    \"msgId\": \"3EB0A1B2C3D4E5F60718\",
    \"to\": \"6281234567890\",
    \"messageType\": \"text\",
    \"body\": \"Penawaran khusus untuk Anda\",
    \"timestamp\": $(date +%s),
    \"queueTime\": 1250,
    \"clientMsgId\": \"INV-2026-0001\"
  }"
```

### Multiple Recipients (Send Separately)
```bash
# Customer 1
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.sent",
    "to": "6281234567890",
    "body": "Penawaran khusus untuk Anda",
    "timestamp": 1745208000
  }'

# Customer 2
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.sent",
    "to": "6289876543210",
    "body": "Penawaran khusus untuk Anda",
    "timestamp": 1745208001
  }'

# Customer 3
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.sent",
    "to": "62811111111",
    "body": "Penawaran khusus untuk Anda",
    "timestamp": 1745208002
  }'
```

---

## Message Failed Event (message.failed)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.failed",
    "deviceId": "D-ABC123",
    "to": "6281234567890",
    "messageType": "text",
    "body": "Pesan yang gagal terkirim",
    "mediaUrl": "",
    "caption": null,
    "fileName": null,
    "error": "session is not connected",
    "errorCode": "SEND_FAILED",
    "timestamp": 1745208050,
    "queueTime": 850,
    "message": "Message failed: session is not connected"
  }'
```

---

## Message Read Event (message.ack - Read)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.ack",
    "deviceId": "D-ABC123",
    "msgId": "3EB0A1B2C3D4E5F60718",
    "from": "6281234567890@s.whatsapp.net",
    "to": "6289876543210@s.whatsapp.net",
    "status": "read",
    "timestamp": 1745208100,
    "clientMsgId": "INV-2026-0001"
  }'
```

---

## Message Delivered Event (message.ack - Delivered)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.ack",
    "deviceId": "D-ABC123",
    "msgId": "3EB0A1B2C3D4E5F60718",
    "from": "6281234567890@s.whatsapp.net",
    "to": "6289876543210@s.whatsapp.net",
    "status": "delivered",
    "timestamp": 1745208100,
    "clientMsgId": "INV-2026-0001"
  }'
```

---

## Expected Response

### Success Response
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "leadStatus": "sent"
}
```

### Error Response (Missing Phone)
```json
{
  "error": "Phone number not found in payload"
}
```

---

## Test Flow (Complete Sequence)

```bash
# 1. Create lead with message.sent
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.sent",
    "to": "6281234567890",
    "body": "Penawaran khusus",
    "timestamp": 1745208000
  }'

# Wait a moment, then check lead status
sleep 1

# 2. Update with message delivered
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.ack",
    "from": "6281234567890@s.whatsapp.net",
    "status": "delivered",
    "timestamp": 1745208010
  }'

# 3. Update with message read
sleep 1
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.ack",
    "from": "6281234567890@s.whatsapp.net",
    "status": "read",
    "timestamp": 1745208020
  }'

# 4. Check final lead data
curl -s http://localhost:3000/api/leads?phone=%2B6281234567890 | jq '.lead'
```

---

## Notes

- Replace `http://localhost:3000` with your actual domain
- Phone numbers can include or exclude the `+` prefix
- Timestamp should be Unix timestamp in seconds
- Phone number with `@s.whatsapp.net` suffix is automatically normalized
- Each event creates an entry in the lead's event history
