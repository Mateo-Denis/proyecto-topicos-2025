import mongoose from 'mongoose';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import Opinion from './models/Opinion';
import MovieAggregate from './models/MovieAggregate';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movies-db';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'ratings_exchange';
const QUEUE_NAME = 'opinions_queue';
const ROUTING_KEY = 'rating.created';

async function processMessage(msg: amqp.ConsumeMessage | null) {
    if (!msg) return;

    try {
        const content = JSON.parse(msg.content.toString());
        console.log('Received message:', content);

        const { movie_id, rating, comment, timestamp, origin, id } = content;

        // Idempotency check
        const existingOpinion = await Opinion.findOne({ message_id: id });
        if (existingOpinion) {
            console.log(`Duplicate message ${id}, skipping.`);
            return;
        }

        // Save Opinion
        const opinion = new Opinion({
            movie_id,
            rating,
            comment,
            received_at: new Date(),
            source: origin,
            message_id: id
        });
        await opinion.save();

        // Update Aggregate
        const aggregate = await MovieAggregate.findOne({ movie_id });
        if (aggregate) {
            const newCount = aggregate.ratings_count + 1;
            const newAvg = ((aggregate.avg_rating * aggregate.ratings_count) + rating) / newCount;
            aggregate.ratings_count = newCount;
            aggregate.avg_rating = newAvg;
            await aggregate.save();
        } else {
            await MovieAggregate.create({
                movie_id,
                avg_rating: rating,
                ratings_count: 1
            });
        }

        console.log(`Processed rating for movie ${movie_id}`);
    } catch (error) {
        console.error('Error processing message:', error);
    }
}

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

        console.log('Waiting for messages in %s', QUEUE_NAME);

        channel.consume(QUEUE_NAME, async (msg) => {
            await processMessage(msg);
            if (msg) channel.ack(msg);
        });

    } catch (error) {
        console.error('Error starting service:', error);
        setTimeout(start, 5000);
    }
}

start();
