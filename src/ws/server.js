import WebSocket, { WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

// Global subscription manager: matchId -> Set<WebSocket>
const matchSubscriber = new Map();

function subscribe(matchId, socket) {
    console.log(`[ws:subscribe] Subscribing socket to match ${matchId}`);
    
    if (!matchSubscriber.has(matchId)) {
        matchSubscriber.set(matchId, new Set());
        console.log(`[ws:subscribe] Created new subscriber set for match ${matchId}`);
    }

    matchSubscriber.get(matchId).add(socket);
    console.log(`[ws:subscribe] Match ${matchId} now has ${matchSubscriber.get(matchId).size} subscriber(s)`);
}

function unSubscribe(matchId, socket) {
    console.log(`[ws:unsubscribe] Unsubscribing socket from match ${matchId}`);
    
    const subscribers = matchSubscriber.get(matchId);
    if (!subscribers) {
        console.log(`[ws:unsubscribe] No subscribers found for match ${matchId}`);
        return;
    }

    subscribers.delete(socket);
    console.log(`[ws:unsubscribe] Match ${matchId} now has ${subscribers.size} subscriber(s)`);

    if (subscribers.size === 0) {
        matchSubscriber.delete(matchId);
        console.log(`[ws:unsubscribe] Removed empty subscriber set for match ${matchId}`);
    }
}

function cleanupSubscriptions(socket) {
    if (!socket.subscriptions || socket.subscriptions.size === 0) {
        console.log('[ws:cleanup] No subscriptions to clean up');
        return;
    }

    console.log(`[ws:cleanup] Cleaning up ${socket.subscriptions.size} subscription(s)`);
    
    for (const matchId of socket.subscriptions) {
        unSubscribe(matchId, socket);
    }
    
    socket.subscriptions.clear();
}


function normalizeArcjetRequest (request) {
    const headers = { ...request.headers };

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

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) {
        console.log('[ws:sendJson] Socket not open, skipping send');
        return;
    }
    
    const message = JSON.stringify(payload);
    console.log('[ws:sendJson] Sending:', message);
    socket.send(message);
}

function broadcastToAll(wss, payload) {
    console.log(`[ws:broadcastAll] Broadcasting to ${wss.clients.size} client(s)`);
    
    const message = JSON.stringify(payload);
    let sentCount = 0;

    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        client.send(message);
        sentCount++;
    }
    
    console.log(`[ws:broadcastAll] Sent to ${sentCount} client(s)`);
}

function broadcastToMatch(matchId, payload) {
    const subscribers = matchSubscriber.get(matchId);

    if (!subscribers || subscribers.size === 0) {
        console.log(`[ws:broadcastMatch] No subscribers for match ${matchId}`);
        return;
    }
    
    console.log(`[ws:broadcastMatch] Broadcasting to ${subscribers.size} subscriber(s) for match ${matchId}`);
    
    const message = JSON.stringify(payload);
    let sentCount = 0;

    for (const client of subscribers) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            sentCount++;
        }
    }
    
    console.log(`[ws:broadcastMatch] Sent to ${sentCount}/${subscribers.size} subscriber(s) for match ${matchId}`);
}

function handleMessage(socket, rawData) {
    // Log raw data type and content
    console.log('[ws:handleMessage] Received raw data type:', rawData.constructor.name);
    console.log('[ws:handleMessage] Raw data:', rawData);
    
    let dataString;
    try {
        // Handle Buffer, Uint8Array, or string
        if (Buffer.isBuffer(rawData)) {
            dataString = rawData.toString('utf8');
            console.log('[ws:handleMessage] Converted Buffer to string:', dataString);
        } else if (rawData instanceof Uint8Array) {
            dataString = new TextDecoder().decode(rawData);
            console.log('[ws:handleMessage] Converted Uint8Array to string:', dataString);
        } else if (typeof rawData === 'string') {
            dataString = rawData;
            console.log('[ws:handleMessage] Data is already string:', dataString);
        } else {
            dataString = String(rawData);
            console.log('[ws:handleMessage] Converted unknown type to string:', dataString);
        }
    } catch (err) {
        console.error('[ws:handleMessage] Failed to convert data to string:', err);
        sendJson(socket, { type: 'error', message: 'Failed to read message' });
        return;
    }

    // Parse JSON
    let message;
    try {
        message = JSON.parse(dataString);
        console.log('[ws:handleMessage] Parsed JSON successfully:', message);
    } catch (err) {
        console.error('[ws:handleMessage] JSON parse error:', err.message);
        console.error('[ws:handleMessage] Failed to parse:', dataString);
        sendJson(socket, { type: 'error', message: 'Invalid JSON' });
        return;
    }

    // Validate message structure
    if (!message || typeof message !== 'object') {
        console.log('[ws:handleMessage] Message is not an object:', message);
        sendJson(socket, { type: 'error', message: 'Message must be an object' });
        return;
    }

    if (!message.type) {
        console.log('[ws:handleMessage] Message missing type field:', message);
        sendJson(socket, { type: 'error', message: 'Message must have a "type" field' });
        return;
    }

    console.log('[ws:handleMessage] Message type:', message.type);

    // Handle subscribe
    if (message.type === 'subscribe') {
        console.log('[ws:handleMessage] Processing subscribe request for matchId:', message.matchId);
        
        if (!Number.isInteger(message.matchId)) {
            console.log('[ws:handleMessage] Invalid matchId (not an integer):', message.matchId);
            sendJson(socket, { 
                type: 'error', 
                message: 'matchId must be an integer',
                received: message.matchId
            });
            return;
        }

        subscribe(message.matchId, socket);
        socket.subscriptions.add(message.matchId);
        
        sendJson(socket, { 
            type: 'subscribed', 
            matchId: message.matchId 
        });
        
        console.log('[ws:handleMessage] Subscribe successful for match', message.matchId);
        return;
    }

    // Handle unsubscribe
    if (message.type === 'unsubscribe') {
        console.log('[ws:handleMessage] Processing unsubscribe request for matchId:', message.matchId);
        
        if (!Number.isInteger(message.matchId)) {
            console.log('[ws:handleMessage] Invalid matchId (not an integer):', message.matchId);
            sendJson(socket, { 
                type: 'error', 
                message: 'matchId must be an integer',
                received: message.matchId
            });
            return;
        }

        unSubscribe(message.matchId, socket);
        socket.subscriptions.delete(message.matchId);
        
        sendJson(socket, { 
            type: 'unsubscribed', 
            matchId: message.matchId 
        });
        
        console.log('[ws:handleMessage] Unsubscribe successful for match', message.matchId);
        return;
    }

    // Unknown message type
    console.log('[ws:handleMessage] Unknown message type:', message.type);
    sendJson(socket, { 
        type: 'error', 
        message: `Unknown message type: ${message.type}`,
        supportedTypes: ['subscribe', 'unsubscribe']
    });
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

export function attachWebsocketServer(server) {
    console.log('[ws:init] Initializing WebSocket server on path /ws');

    const wss = new WebSocketServer({ 
        server, 
        path: '/ws', 
        maxPayload: 1024 * 1024 
    });

    console.log('[ws:init] WebSocket server created');

    const heartbeat = setInterval(() => {
        console.log(`[ws:heartbeat] Checking ${wss.clients.size} client(s)`);
        
        let terminated = 0;
        for (const socket of wss.clients) {
            if (!socket.isAlive) {
                console.log('[ws:heartbeat] Terminating inactive client');
                socket.terminate();
                terminated++;
                continue;
            }
            socket.isAlive = false;
            socket.ping();
        }
        
        if (terminated > 0) {
            console.log(`[ws:heartbeat] Terminated ${terminated} inactive client(s)`);
        }
    }, PING_INTERVAL_MS);

    wss.on('close', () => {
        console.log('[ws:wss] WebSocket server closing, clearing heartbeat');
        clearInterval(heartbeat);
    });

    wss.on('connection', async (socket, request) => {
        console.log('[ws:connection] New connection from:', request.socket.remoteAddress);
        console.log('[ws:connection] Request URL:', request.url);
        console.log('[ws:connection] User-Agent:', request.headers['user-agent']);

        const allowed = await isWebSocketAllowed(socket, request);
        if (!allowed) {
            console.log('[ws:connection] Connection rejected by Arcjet');
            return;
        }

        console.log('[ws:connection] Connection allowed, initializing socket');

        socket.isAlive = true;
        socket.subscriptions = new Set();

        // Send welcome message
        sendJson(socket, { 
            type: 'welcome', 
            message: 'Welcome to the live sports commentary WebSocket!' 
        });

        // Pong handler for heartbeat
        socket.on('pong', () => { 
            socket.isAlive = true; 
        });

        // Message handler
        socket.on('message', (data) => {
            console.log('[ws:connection] Received message event');
            handleMessage(socket, data);
        });

        // Error handler
        socket.on('error', (err) => {
            console.error('[ws:connection] Socket error:', err);
            socket.terminate();
        });

        // Close handler
        socket.on('close', (code, reason) => {
            console.log(`[ws:connection] Client disconnected — code: ${code}, reason: ${reason || 'none'}`);
            cleanupSubscriptions(socket);
        });

        console.log('[ws:connection] Socket fully initialized');
    });

    function broadCastMatchCreated(match) {
        console.log('[ws:broadcast] Broadcasting match_created event for match:', match.id);
        broadcastToAll(wss, { type: 'match_created', data: match });
    }

    function broadCastCommentary(matchId, comment) {
        console.log('[ws:broadcast] Broadcasting commentary event for match:', matchId);
        console.log('[ws:broadcast] Commentary data:', comment);
        broadcastToMatch(matchId, { type: 'commentary', data: comment });
    }

    console.log('[ws:init] WebSocket server fully initialized and listening');

    return { broadCastMatchCreated, broadCastCommentary };
}