const amqp = require("amqplib");
const logger = require("../logger");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE = "breezy.events";

let channel = null;

/**
 * Connecte le publisher RabbitMQ et déclare l'exchange, avec plusieurs tentatives.
 * Entrée : retries (number), delayMs (number)
 * Sortie : rien (channel prêt, ou abandon loggé après épuisement des tentatives)
 */
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

/**
 * Publie un événement sur l'exchange (best-effort : ne fait jamais échouer l'action métier).
 * Entrée : routingKey (string), payload (object)
 * Sortie : rien
 */
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
