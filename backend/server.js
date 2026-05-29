const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Limit besar untuk upload image base64

// Konfigurasi Koneksi Database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corp_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Endpoint Berita (CRUD)
app.get('/api/news', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM news ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM news WHERE id = ?', [id]);
        res.json({ message: 'Berita berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/news', async (req, res) => {
    const { title, category, content, image, author, modify_by } = req.body;
    try {
        const sql = `INSERT INTO news (title, category, content, image, author, date, modify_date, modify_by) 
                     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)`;
        const [result] = await pool.execute(sql, [title, category, content, image, author, modify_by]);
        res.json({ id: result.insertId, message: 'Berita berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    const { title, category, content, image, modify_by } = req.body;
    try {
        const sql = `UPDATE news SET title = ?, category = ?, content = ?, image = ?, modify_date = NOW(), modify_by = ? WHERE id = ?`;
        await pool.execute(sql, [title, category, content, image, modify_by, id]);
        res.json({ message: 'Berita berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Master Data (Helper untuk Frontend)
app.get('/api/master-data', async (req, res) => {
    try {
        const [depts] = await pool.execute('SELECT * FROM departments');
        const [types] = await pool.execute('SELECT * FROM approval_types');
        const [procs] = await pool.execute('SELECT * FROM procedures');
        const [emps] = await pool.execute('SELECT * FROM employees');
        const [routings] = await pool.execute('SELECT * FROM routings');
        const [gls] = await pool.execute('SELECT * FROM gl_accounts');
        const [ccs] = await pool.execute('SELECT * FROM cost_centers');
        const [events] = await pool.execute('SELECT * FROM events');
        const [approvals] = await pool.execute('SELECT * FROM approvals ORDER BY id DESC');
        
        res.json({ 
            departments: depts, 
            approvalTypes: types, 
            procedures: procs, 
            employees: emps, 
            routings,
            glAccounts: gls,
            costCenters: ccs,
            events,
            approvals
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Formulir & Prosedur
app.post('/api/procedures', async (req, res) => {
    const { title, department, category, type, size, description, attachment, modify_by } = req.body;
    try {
        const sql = `INSERT INTO procedures (title, department, category, type, size, description, attachment, modify_date, modify_by) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;
        const [result] = await pool.execute(sql, [title, department, category, type, size, description, JSON.stringify(attachment), modify_by]);
        res.json({ id: result.insertId, message: 'Dokumen berhasil dipublikasikan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/procedures/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM procedures WHERE id = ?', [req.params.id]);
        res.json({ message: 'Dokumen berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Approval (Transaksi)
app.post('/api/approvals', async (req, res) => {
    const { type, requester, description, status, date, path, attachment, amount, gl_account, cost_center } = req.body;
    try {
        const sql = `INSERT INTO approvals (type, requester, description, status, date, current_step_index, path, attachment, amount, gl_account, cost_center) 
                     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(sql, [type, requester, description, status, date, JSON.stringify(path), JSON.stringify(attachment), amount, gl_account, cost_center]);
        res.json({ id: result.insertId, message: 'Pengajuan berhasil dibuat' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/approvals/:id', async (req, res) => {
    const { id } = req.params;
    const { status, current_step_index, last_comment } = req.body;
    try {
        await pool.execute('UPDATE approvals SET status = ?, current_step_index = ?, last_comment = ? WHERE id = ?', [status, current_step_index, last_comment, id]);
        res.json({ message: 'Status approval diperbarui' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint GL Accounts (CRUD)
app.post('/api/gl-accounts', async (req, res) => {
    const { code, name, description, modify_by } = req.body;
    try {
        const sql = `INSERT INTO gl_accounts (code, name, description, modify_date, modify_by) VALUES (?, ?, ?, NOW(), ?)`;
        const [result] = await pool.execute(sql, [code, name, description, modify_by]);
        res.json({ id: result.insertId, message: 'GL Account berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/gl-accounts/:id', async (req, res) => {
    const { id } = req.params;
    const { code, name, description, modify_by } = req.body;
    try {
        const sql = `UPDATE gl_accounts SET code = ?, name = ?, description = ?, modify_date = NOW(), modify_by = ? WHERE id = ?`;
        await pool.execute(sql, [code, name, description, modify_by, id]);
        res.json({ message: 'GL Account diperbarui' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/gl-accounts/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM gl_accounts WHERE id = ?', [req.params.id]);
        res.json({ message: 'GL Account dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Cost Centers (CRUD)
app.post('/api/cost-centers', async (req, res) => {
    const { code, name, description, modify_by } = req.body;
    try {
        const sql = `INSERT INTO cost_centers (code, name, description, modify_date, modify_by) VALUES (?, ?, ?, NOW(), ?)`;
        const [result] = await pool.execute(sql, [code, name, description, modify_by]);
        res.json({ id: result.insertId, message: 'Cost Center berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cost-centers/:id', async (req, res) => {
    const { id } = req.params;
    const { code, name, description, modify_by } = req.body;
    try {
        const sql = `UPDATE cost_centers SET code = ?, name = ?, description = ?, modify_date = NOW(), modify_by = ? WHERE id = ?`;
        await pool.execute(sql, [code, name, description, modify_by, id]);
        res.json({ message: 'Cost Center diperbarui' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cost-centers/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM cost_centers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Cost Center dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Auth / Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM employees WHERE username = ? AND password = ?', 
            [username, password]
        );
        
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Kredensial salah' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Audit Logs
app.post('/api/logs', async (req, res) => {
    const { modify_by, action_type, menu_asal, description } = req.body;
    try {
        await pool.execute(
            'INSERT INTO audit_logs (modify_date, modify_by, action_type, menu_asal, description) VALUES (NOW(), ?, ?, ?, ?)',
            [modify_by, action_type, menu_asal, description]
        );
        res.sendStatus(201);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM audit_logs ORDER BY modify_date DESC LIMIT 100');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Kalender Event (CRUD)
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM events ORDER BY event_date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events', async (req, res) => {
    const { title, description, event_date, event_time, color, modify_by } = req.body;
    try {
        const sql = `INSERT INTO events (title, description, event_date, event_time, color, modify_by) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(sql, [title, description, event_date, event_time, color, modify_by]);
        res.json({ id: result.insertId, message: 'Event berhasil disimpan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));