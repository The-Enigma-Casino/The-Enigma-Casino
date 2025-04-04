// Game logic handlers (escuchan mensajes WS)
import "../features/gameTables/models/GameTable.handlers";

// Game tables logic
import "../features/gameTables/store/tablesSamples"; // sample(joinTableClicked, ...)
import "../features/gameTables/store/tablesStores"; // opcional, si contiene efectos

// WebSocket logic
import "../websocket/store/wsSamples"; // sample(messageSent, ...)
import "../websocket/store/wsStores";  // conexión, userCount, etc.
