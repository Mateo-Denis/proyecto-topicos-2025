import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const PORT = process.env.PORT || 3003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
const EXCHANGE_NAME = 'ratings_exchange';
const ROUTING_KEY = 'rating.created';

export function createApp(channelOverride?: amqp.Channel | null): Express {
    const app = express();
    let channel: amqp.Channel | null = channelOverride || null;

    app.use(cors());
    app.use(express.json());

    app.post('/ratings', async (req, res) => {
        try {
            const { movie_id, rating, comment } = req.body;

            if (!movie_id || !rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Invalid input' });
            }

            const ratingEvent = {
                id: uuidv4(),
                movie_id,
                rating,
                comment: comment || null,
                timestamp: new Date().toISOString(),
                origin: 'rating-service'
            };

            if (channel) {
                channel.publish(
                    EXCHANGE_NAME,
                    ROUTING_KEY,
                    Buffer.from(JSON.stringify(ratingEvent)),
                    { persistent: true }
                );
                console.log(`Published rating event: ${ratingEvent.id}`);
                res.status(201).json({ message: 'Rating received', id: ratingEvent.id });
            } else {
                res.status(503).json({ error: 'Messaging service unavailable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return app;
}

async function connectRabbitMQ() {
    while (true) {
        try {
            const connection = await amqp.connect(RABBITMQ_URL);
            const channel = await connection.createChannel();

            await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

            console.log("Connected to RabbitMQ");
            return channel;
        } catch (error) {
            console.error("RabbitMQ connection error:", error);
            console.log("Retrying in 5 seconds...");
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}


if (require.main === module) {
    (async () => {
        const channel = await connectRabbitMQ();
        const app = createApp(channel);
        app.listen(PORT, () => {
            console.log(`Rating Service running on port ${PORT}`);
        });
    })();
}
