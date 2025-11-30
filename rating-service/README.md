# Rating Service

Accepts movie ratings and publishes them to RabbitMQ.

## Endpoints

- `POST /ratings` - Submit a rating

### Request Body
```json
{
  "movie_id": "string",
  "rating": 1-5,
  "comment": "optional string"
}
```

## Environment Variables

- `PORT` - Service port (default: 3003)
- `RABBITMQ_URL` - RabbitMQ connection URL

## Running

```bash
npm install
npm run dev
```
