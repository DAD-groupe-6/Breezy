const amqp = require("amqplib");
const logger = require("../logger");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE = "breezy.events";
const QUEUE = "notifications";
const BINDINGS = ["post.liked", "post.commented", "user.followed"];

// RabbitMQ peut démarrer après le service → on réessaie quelques fois.
async function connectWithRetry(retries = 10, delayMs = 3000) {
    for (let i = 1; i <= retries; i++) {
        try {
            return await amqp.connect(RABBITMQ_URL);
        } catch (err) {
            logger.error(`RabbitMQ indisponible (${i}/${retries}) : ${err.message}`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw new Error("Impossible de se connecter à RabbitMQ");
}

// onEvent(routingKey, payload) : appelé pour chaque message reçu.
async function startConsumer(onEvent) {
    const conn = await connectWithRetry();
    const channel = await conn.createChannel();

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    for (const key of BINDINGS) {
        await channel.bindQueue(QUEUE, EXCHANGE, key);
    }

    channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        try {
            const payload = JSON.parse(msg.content.toString());
            await onEvent(msg.fields.routingKey, payload);
            channel.ack(msg);
        } catch (err) {
            logger.error(`Échec traitement message : ${err.message}`);
            channel.nack(msg, false, false); // pas de requeue → évite la boucle infinie
        }
    });

    logger.info("Consumer RabbitMQ démarré");
}

module.exports = { startConsumer };
