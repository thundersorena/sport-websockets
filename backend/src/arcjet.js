import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/node';

const arcjetKey = process.env.ARCJET_KEY;
const arcjetEnv = process.env.ARCJET_ENV || 'production';
const arcjetMode = process.env.ARCJET_MODE  === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if(!arcjetKey) throw new Error('ARCJET_KEY is not defined in environment variables');

export const httpArcjet = arcjetKey ? arcjet({
  key: arcjetKey,
  rules: [
    shield({mode : arcjetMode}),
    detectBot({mode : arcjetMode , allow: ['CURL', 'SEARCH_ENGINE', 'MONITORING' ,'PREVIEW', 'AUTOMATED']}),

    slidingWindow({mode : arcjetMode , interval: '10s', max: 50}),
  ],
}) : null;


export const wsArcjet = arcjetKey ? arcjet({
 key: arcjetKey,
  rules: [
    shield({mode : arcjetMode}),
    detectBot({mode : arcjetMode , allow: ['CURL', 'SEARCH_ENGINE', 'MONITORING' ,'PREVIEW', 'AUTOMATED']}),
    slidingWindow({mode : arcjetMode , interval: '2s', max: 5}),
  ],
}) : null;


export function securityMiddleware () {
    return async (req, res, next) => {
        if(!httpArcjet) return next();

        // Ensure user-agent header exists for detectBot
        if (!req.headers['user-agent']) {
            req.headers['user-agent'] = 'Unknown';
        }

        try {
            const decision = await httpArcjet.protect(req);

            if (decision.isDenied()) {
                if(decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: 'Too many requests' });
                }

                return res.status(403).json({ error: 'Forbidden' });
            }

        } catch (err) {
            console.error('Arcjet error:', err);
            return res.status(503).json({ error: 'service is unavailable' });
        }

        next();
    }

}