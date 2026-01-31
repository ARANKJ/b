const express = require("express");
const app = express();

app.use(express.json());

// ===================== SERVIDORES =====================
let servers = {};
const SERVER_TIMEOUT_MS = 20000;

function cleanupServers() {
  const now = Date.now();
  for (const id in servers) {
    if (now - servers[id].lastSeen > SERVER_TIMEOUT_MS) {
      delete servers[id];
    }
  }
}

// ===================== REGISTRAR SERVIDOR =====================
app.post("/register", (req, res) => {
  const { id, name, host, port, players, max_players, map, mode } = req.body;

  if (!id || !host || !port) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }

  servers[id] = {
    id,
    name: name || "Five Lines Server",
    host,
    port,
    players: players ?? 0,
    max_players: max_players ?? 20,
    map: map || "unknown",
    mode: mode || "casual",
    lastSeen: Date.now()
  };

  return res.json({ ok: true });
});

// ===================== HEARTBEAT =====================
app.post("/heartbeat", (req, res) => {
  const { id, players, map } = req.body;

  if (!id || !servers[id]) {
    return res.status(404).json({ ok: false, error: "server_not_found" });
  }

  servers[id].lastSeen = Date.now();
  if (players !== undefined) servers[id].players = players;
  if (map !== undefined) servers[id].map = map;

  return res.json({ ok: true });
});

// ===================== LISTA DE SERVIDORES =====================
app.get("/servers", (req, res) => {
  cleanupServers();
  return res.json({ servers: Object.values(servers) });
});

// ===================== STATUS (pra testar no navegador) =====================
app.get("/", (req, res) => {
  res.send("Five Lines Master Server Online");
});

// ===================== START =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Master Server rodando na porta", PORT));