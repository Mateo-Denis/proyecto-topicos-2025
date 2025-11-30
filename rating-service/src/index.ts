import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'ratings_exchange';
const ROUTING_KEY = 'rating.created';

app.use(cors());
app.use(express.json());

let channel: amqp.Channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        // Retry logic could be added here
        setTimeout(connectRabbitMQ, 5000);
    }
}

connectRabbitMQ();

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

app.listen(PORT, () => {
    console.log(`Rating Service running on port ${PORT}`);
});
