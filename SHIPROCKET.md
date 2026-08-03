# Shiprocket integration

The backend keeps checkout and inventory changes local. After an order is confirmed, an
order manager explicitly creates its shipment in Shiprocket. This prevents a Shiprocket
outage from breaking checkout or payment verification.

## Configuration

1. In Shiprocket, open **Settings > API > Configure** and create an API user.
2. Add these values to `.env`:

```env
SHIPROCKET_EMAIL=api-user@example.com
SHIPROCKET_PASSWORD=your-api-user-password
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_PICKUP_POSTCODE=110001
SHIPROCKET_WEBHOOK_TOKEN=use-a-long-random-secret
SHIPROCKET_DEFAULT_LENGTH_CM=10
SHIPROCKET_DEFAULT_BREADTH_CM=10
SHIPROCKET_DEFAULT_HEIGHT_CM=10
SHIPROCKET_DEFAULT_WEIGHT_KG=0.5
```

`SHIPROCKET_PICKUP_LOCATION` must exactly match an existing pickup location name in the
Shiprocket dashboard. Replace the default dimensions and weight with realistic package
values. The create-shipment endpoint also accepts per-order overrides.

3. In **Settings > API > Webhooks**, configure:

```text
POST https://YOUR_API_HOST/api/v1/order/shipping/webhook
x-api-key: the value of SHIPROCKET_WEBHOOK_TOKEN
```

Shiprocket recommends avoiding its brand keywords in the callback URL, so the webhook
path intentionally uses `shipping`.

## API workflow

All routes except the webhook require the application's bearer token. Shipment
management routes also require `admin`, `superAdmin`, or `orderManager`.

### 1. Check courier serviceability

```http
GET /api/v1/order/shipping/serviceability?deliveryPostcode=560001&cod=true&weight=0.5
```

Optional query parameters: `pickupPostcode`, `length`, `breadth`, `height`,
`declaredValue`, and `mode`.

### 2. Create the Shiprocket order

```http
POST /api/v1/order/:orderId/shipment
Content-Type: application/json

{
  "package": {
    "length": 12,
    "breadth": 10,
    "height": 8,
    "weight": 0.7
  }
}
```

This operation is idempotent locally: if the order already has a Shiprocket order ID,
the existing order is returned.

### 3. Assign an AWB

```http
POST /api/v1/order/:orderId/shipment/awb
Content-Type: application/json

{
  "courierId": 10
}
```

Omit `courierId` to let Shiprocket choose its default courier.

### 4. Schedule pickup

```http
POST /api/v1/order/:orderId/shipment/pickup
Content-Type: application/json

{
  "pickupDate": "2026-08-01"
}
```

`pickupDate` is optional. An AWB must already be assigned.

### 5. Generate a label

```http
POST /api/v1/order/:orderId/shipment/label
```

The returned label URL is also saved at `order.shiprocket.labelUrl`.

### 6. Track a shipment

```http
GET /api/v1/order/:orderId/shipment/tracking
```

The order owner and order-management roles may use this endpoint.

### Generate and retrieve an invoice

An order manager generates the Shiprocket invoice:

```http
POST /api/v1/order/:orderId/shipment/invoice
```

The customer or an order manager can retrieve the saved invoice URL:

```http
GET /api/v1/order/:orderId/shipment/invoice
```

The URL is also available as `order.shiprocket.invoiceUrl` in order responses.

## Stored order fields

Shiprocket identifiers, AWB, courier, package measurements, label URL, sync state,
last error, and last-sync time are stored under `order.shiprocket`. Webhook events
automatically move local orders to `Shipped`, `Out For Delivery`, or `Delivered`.
Customer cancellation is also sent to Shiprocket before local stock is restored.
