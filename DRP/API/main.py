from pathlib import Path
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "drp.db"
SCHEMA_FILE = BASE_DIR / "API"  # existing SQL schema in file

app = FastAPI(title="DRP API", version="0.1.0")

class TicketCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    id_cliente: int
    id_usuario: int
    id_estado: int
    id_subcategoria: Optional[int] = None
    id_sla: Optional[int] = None

class Ticket(BaseModel):
    id_ticket: int
    titulo: str
    descripcion: Optional[str] = None
    id_cliente: int
    id_usuario: int
    id_estado: int
    id_subcategoria: Optional[int] = None
    id_sla: Optional[int] = None


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    if DB_PATH.exists():
        return

    if not SCHEMA_FILE.exists():
        raise FileNotFoundError(f"Schema file not found: {SCHEMA_FILE}")

    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    conn = get_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/health")
def cd /workspaces/proyecto- && \
sudo service mysql start 2>/dev/null || sudo service mariadb start 2>/dev/null && \
mysql -u root -e "CREATE DATABASE IF NOT EXISTS soporte; USE soporte; CREATE TABLE IF NOT EXISTS clientes (id_cliente INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100), telefono VARCHAR(20), email VARCHAR(100), direccion TEXT); CREATE TABLE IF NOT EXISTS tickets (id_ticket INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(150), descripcion TEXT, id_cliente INT, fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP);" && \
pkill -f "node .vscode/sistema-soporte/server.js/server.js" || true && \
node .vscode/sistema-soporte/server.js/server.js & sleep 3 && \
curl -sS http://127.0.0.1:3000/health && echo && \
curl -sS -X POST http://127.0.0.1:3000/clientes -H "Content-Type: application/json" -d '{"nombre":"Juan","telefono":"999","email":"juan@example.com","direccion":"Tegucigalpa"}' && echo && \
curl -sS -X POST http://127.0.0.1:3000/tickets -H "Content-Type: application/json" -d '{"titulo":"Error impresora","descripcion":"No imprime","id_cliente":1}' && echo && \
curl -sS http://127.0.0.1:3000/ticketshealth():
    return {"status": "ok"}


@app.get("/tickets", response_model=List[Ticket])
def list_tickets():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM tickets").fetchall()
        return [Ticket(**dict(r)) for r in rows]
    finally:
        conn.close()


@app.post("/tickets", response_model=Ticket, status_code=201)
def create_ticket(ticket: TicketCreate):
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO tickets (titulo, descripcion, id_cliente, id_usuario, id_estado, id_subcategoria, id_sla) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (ticket.titulo, ticket.descripcion, ticket.id_cliente, ticket.id_usuario, ticket.id_estado, ticket.id_subcategoria, ticket.id_sla),
        )
        conn.commit()
        ticket_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM tickets WHERE id_ticket = ?", (ticket_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=500, detail="Ticket creation failed")
        return Ticket(**dict(row))
    finally:
        conn.close()


@app.get("/tickets/{id}", response_model=Ticket)
def get_ticket(id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM tickets WHERE id_ticket = ?", (id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return Ticket(**dict(row))
    finally:
        conn.close()

