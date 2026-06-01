import WebSocket, { WebSocketServer } from 'ws';

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

export function attachWebsocketServer (server) {

    const wss = new WebSocketServer({ server , path: '/ws', maxPayload: 1024 * 1024 })

    // Heartbeat: ping every client on an interval; terminate any that missed the last ping
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

    wss.on('connection' , (socket) => {
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