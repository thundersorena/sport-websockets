import WebSocket, { WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

function normalizeArcjetRequest (request) {
    const headers = { ...request.headers };

    // DetectBot requires a user-agent header, but many WS clients omit it.
    if (!headers['user-agent']) {
        headers['user-agent'] = 'Unknown';
    }

    return {
        method: request.method,
        url: request.url,
        headers,
        httpVersion: request.httpVersion,
        socket: request.socket ? {
            remoteAddress: request.socket.remoteAddress,
            encrypted: request.socket.encrypted,
        } : undefined,
    };
}

function sendJson (socket , payload) {
    if(socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload))
}

function broadcast (wss , payload) {

    for(const client of wss.clients) {
        if(client.readyState !== WebSocket.OPEN) continue;
        client.send(JSON.stringify(payload))
     }

}

const PING_INTERVAL_MS = 30_000;

async function isWebSocketAllowed (socket, request) {
    if (!wsArcjet) return true;

    try {
        const decision = await wsArcjet.protect(normalizeArcjetRequest(request));

        if (!decision.isDenied()) {
            return true;
        }

        const isRateLimited = typeof decision.reason?.isRateLimit === 'function' && decision.reason.isRateLimit();
        const code = isRateLimited ? 1013 : 1008;
        const reason = isRateLimited ? 'Rate limit exceeded' : 'Access denied by Arcjet';
        socket.close(code, reason);
        return false;
    } catch (err) {
        console.error('Arcjet WebSocket error:', err);
        socket.close(1011, 'Server security check failed');
        return false;
    }
}

export function attachWebsocketServer (server) {

    const wss = new WebSocketServer({ server , path: '/ws', maxPayload: 1024 * 1024 })

    const heartbeat = setInterval(() => {
        for (const socket of wss.clients) {
            if (!socket.isAlive) {
                socket.terminate();
                continue;
            }
            socket.isAlive = false;
            socket.ping();
        }
    }, PING_INTERVAL_MS);

    wss.on('close', () => clearInterval(heartbeat));

    wss.on('connection' , async (socket, request) => {
        const allowed = await isWebSocketAllowed(socket, request);
        if (!allowed) {
            return;
        }

        socket.isAlive = true;

        sendJson(socket , { type: 'welcome' , message: 'Welcome to the live sports commentary WebSocket!' })

        socket.on('pong', () => { socket.isAlive = true; });

        socket.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw);
                console.log('[ws] received:', msg);
            } catch {
                socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
            }
        });

        socket.on('close', (code, reason) => {
            console.log(`[ws] client disconnected — code: ${code}, reason: ${reason}`);
        });

        socket.on('error' , console.error)
    })

    function broadCastMatchCreated (match) {
        broadcast(wss , { type: 'match_created' , data: match })
    }

    return {broadCastMatchCreated}
}