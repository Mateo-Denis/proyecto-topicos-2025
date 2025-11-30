# Opinions Service

Consumes rating events from RabbitMQ and stores them in MongoDB.

## Functionality

- Listens to `opinions_queue` bound to `ratings_exchange`
- Saves opinions to MongoDB
- Updates movie aggregates (average rating, count)
- Implements idempotency using message IDs

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `RABBITMQ_URL` - RabbitMQ connection URL

## Running

```bash
npm install
npm run dev
```
