/**
 * Allowlist CORS pour Socket.IO, alignée sur celle du gateway Nginx (gateway/nginx.conf).
 * Autorise localhost / 127.0.0.1 (tout port) en dev, plus les domaines de prod listés
 */
const allowedOrigins = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    ...(process.env.CORS_ALLOWED_ORIGINS
        ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
        : []),
];

const corsOptions = { origin: allowedOrigins, credentials: true };

module.exports = { corsOptions };
