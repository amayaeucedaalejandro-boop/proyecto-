const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'soporte',
});

let dbConnected = false;

const connectDb = () => {
  db.connect((err) => {
    if (err) {
      dbConnected = false;
      console.error('Error de conexión (MySQL no disponible):', err.code || err.message || err);
      setTimeout(connectDb, 3000);
    } else {
      dbConnected = true;
      console.log('Conectado a la base de datos');
    }
  });
};

connectDb();

const ensureDb = (res) => {
  if (!dbConnected) {
    res.status(503).json({ error: 'Base de datos no disponible. Intente más tarde.' });
    return false;
  }
  return true;
};

// Rutas de salud
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API de Soporte en Node' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// APIs
app.post('/clientes', (req, res) => {
  if (!ensureDb(res)) return;

  const { nombre, telefono, email, direccion } = req.body;
  const sql = 'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?,?,?,?)';

  db.query(sql, [nombre, telefono, email, direccion], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message || error });
    } else {
      res.json({ message: 'Cliente guardado', id_cliente: result.insertId });
    }
  });
});

app.post('/tickets', (req, res) => {
  if (!ensureDb(res)) return;

  const { titulo, descripcion, id_cliente } = req.body;
  const sql = 'INSERT INTO tickets (titulo, descripcion, id_cliente, fecha_creacion) VALUES (?,?,?,NOW())';

  db.query(sql, [titulo, descripcion, id_cliente], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message || error });
    } else {
      res.json({ message: 'Ticket creado', id_ticket: result.insertId });
    }
  });
});

app.get('/tickets', (req, res) => {
  if (!ensureDb(res)) return;

  const sql = 'SELECT * FROM tickets';
  db.query(sql, (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message || error });
    } else {
      res.json(result);
    }
  });
});

// Archivos estáticos opcionales (si tenés frontend en /public)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
<!DOCTYPE html>
<html>
<head>
    <title>Registrar Cliente</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container mt-5">
    <h2>Registrar Cliente</h2>

    <form id="clienteForm">
        <input class="form-control mb-2" type="text" placeholder="Nombre" id="nombre" required>
        <input class="form-control mb-2" type="text" placeholder="Teléfono" id="telefono" required>
        <input class="form-control mb-2" type="email" placeholder="Email" id="email" required>
        <input class="form-control mb-2" type="text" placeholder="Dirección" id="direccion" required>
        <button class="btn btn-primary" type="submit">Guardar Cliente</button>
    </form>

    <script>
        document.getElementById("clienteForm").addEventListener("submit", function(e){
            e.preventDefault();

            const cliente = {
                nombre: document.getElementById("nombre").value,
                telefono: document.getElementById("telefono").value,
                email: document.getElementById("email").value,
                direccion: document.getElementById("direccion").value
            };

            fetch("/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cliente)
            })
            .then(res => res.text())
            .then(data => alert(data));
        });
    </script>
</body>
</html>
<!DOCTYPE html>
<html>
<head>
    <title>Crear Ticket</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container mt-5">
    <h2>Crear Ticket</h2>

    <form id="ticketForm" class="mb-4">
        <input class="form-control mb-2" type="text" placeholder="Título" id="titulo" required>
        <textarea class="form-control mb-2" placeholder="Descripción" id="descripcion" required></textarea>
        <input class="form-control mb-2" type="number" placeholder="ID Cliente" id="id_cliente" required>
        <button class="btn btn-success" type="submit">Crear Ticket</button>
    </form>

    <h3>Lista de Tickets</h3>
    <table class="table table-striped">
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>ID Cliente</th>
            </tr>
        </thead>
        <tbody id="tablaTickets"></tbody>
    </table>

    <script>
        const cargarTickets = () => {
            fetch("/tickets")
            .then(res => res.json())
            .then(data => {
                const tabla = document.getElementById("tablaTickets");
                tabla.innerHTML = "";
                data.forEach(ticket => {
                    tabla.innerHTML += `
                        <tr>
                            <td>${ticket.id_ticket}</td>
                            <td>${ticket.titulo}</td>
                            <td>${ticket.descripcion}</td>
                            <td>${ticket.id_cliente}</td>
                        </tr>
                    `;
                });
            });
        };

        document.getElementById("ticketForm").addEventListener("submit", function(e){
            e.preventDefault();

            const ticket = {
                titulo: document.getElementById("titulo").value,
                descripcion: document.getElementById("descripcion").value,
                id_cliente: document.getElementById("id_cliente").value
            };

            fetch("/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ticket)
            })
            .then(res => res.text())
            .then(data => {
                alert(data);
                cargarTickets();
            });
        });

        // Cargar tickets al abrir la página
        cargarTickets();
    </script>
</body>
</html>const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'soporte',
});

let dbConnected = false;
const connectDb = () => {
  db.connect((err) => {
    if (err) {
      dbConnected = false;
      console.error('Error de conexión (MySQL no disponible):', err.code || err.message || err);
      setTimeout(connectDb, 3000);
    } else {
      dbConnected = true;
      console.log('Conectado a la base de datos');
    }
  });
};

connectDb();

const ensureDb = (res) => {
  if (!dbConnected) {
    res.status(503).json({ error: 'Base de datos no disponible. Intente más tarde.' });
    return false;
  }
  return true;
};

app.get('/', (req, res) => res.json({ status: 'ok', message: 'API de Soporte en Node' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/clientes', (req, res) => {
  if (!ensureDb(res)) return;
  const { nombre, telefono, email, direccion } = req.body;
  const sql = 'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?,?,?,?)';
  db.query(sql, [nombre, telefono, email, direccion], (error, result) => {
    if (error) return res.status(500).json({ error: error.message || error });
    res.json({ message: 'Cliente guardado', id_cliente: result.insertId });
  });
});

app.post('/tickets', (req, res) => {
  if (!ensureDb(res)) return;
  const { titulo, descripcion, id_cliente } = req.body;
  const sql = 'INSERT INTO tickets (titulo, descripcion, id_cliente, fecha_creacion) VALUES (?,?,?,NOW())';
  db.query(sql, [titulo, descripcion, id_cliente], (error, result) => {
    if (error) return res.status(500).json({ error: error.message || error });
    res.json({ message: 'Ticket creado', id_ticket: result.insertId });
  });
});

app.get('/tickets', (req, res) => {
  if (!ensureDb(res)) return;
  db.query('SELECT * FROM tickets', (error, result) => {
    if (error) return res.status(500).json({ error: error.message || error });
    res.json(result);
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));