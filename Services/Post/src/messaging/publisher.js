const amqp = require("amqplib");
const logger = require("../logger");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE = "breezy.events";

let channel = null;

async function connectPublisher(retries = 10, delayMs = 3000) {
    for (let i = 1; i <= retries; i++) {
        try {
            const conn = await amqp.connect(RABBITMQ_URL);
            channel = await conn.createChannel();
            await channel.assertExchange(EXCHANGE, "topic", { durable: true });
            conn.on("close", () => { channel = null; });
            logger.info("Publisher RabbitMQ prêt");
            return;
        } catch (err) {
            logger.error(`RabbitMQ indisponible (${i}/${retries}) : ${err.message}`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    logger.error("Publisher RabbitMQ non connecté (les events ne seront pas publiés)");
}

// Publication best-effort : ne jamais faire échouer l'action métier si RabbitMQ est down.
function publishEvent(routingKey, payload) {
    if (!channel) {
        logger.error(`Event ${routingKey} non publié (pas de canal RabbitMQ)`);
        return;
    }
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
    });
}

module.exports = { connectPublisher, publishEvent };
