require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const port = 3000;
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "mysql",
    database: process.env.DB_NAME || "employee_db"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    } else {
        console.log("Database Connected Successfully");

        const ensureColumn = (table, column, definition, callback) => {
            db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column], (showErr, results) => {
                if (showErr) {
                    return callback(showErr);
                }
                if (results.length === 0) {
                    db.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`, callback);
                } else {
                    callback();
                }
            });
        };

        const ensureUniqueIndex = (table, indexName, definition, callback) => {
            db.query(`SHOW INDEX FROM ${table} WHERE Key_name = ?`, [indexName], (showErr, results) => {
                if (showErr) {
                    return callback(showErr);
                }
                if (results.length === 0) {
                    db.query(`ALTER TABLE ${table} ADD UNIQUE INDEX ${indexName} (${definition})`, callback);
                } else {
                    callback();
                }
            });
        };

        ensureColumn('attendance', 'employee_id', 'employee_id INT NULL AFTER id', err => {
            if (err) console.error('Error ensuring attendance.employee_id column:', err);
        });

        ensureColumn('attendance', 'status', 'status VARCHAR(20) NULL AFTER date', err => {
            if (err) console.error('Error ensuring attendance.status column:', err);
        });

        ensureColumn('attendance', 'updated_at', 'updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', err => {
            if (err) console.error('Error ensuring attendance.updated_at column:', err);
        });

        db.query(`ALTER TABLE attendance MODIFY COLUMN employee_name VARCHAR(100) NULL`, err => {
            if (err && err.code !== 'ER_BAD_FIELD_ERROR') {
                console.error('Error modifying attendance.employee_name to nullable:', err);
            }
        });

        db.query(`ALTER TABLE attendance MODIFY COLUMN attendance VARCHAR(20) NULL`, err => {
            if (err && err.code !== 'ER_BAD_FIELD_ERROR') {
                console.error('Error modifying attendance.attendance to nullable:', err);
            }
        });

        db.query(`SHOW COLUMNS FROM attendance LIKE 'attendance'`, (showOldErr, oldResults) => {
            if (!showOldErr && oldResults && oldResults.length > 0) {
                db.query(`UPDATE attendance SET status = attendance WHERE status IS NULL`, updateErr => {
                    if (updateErr) console.error('Error migrating attendance.status values from old attendance column:', updateErr);
                });
                db.query(`UPDATE attendance SET attendance = status WHERE attendance IS NULL AND status IS NOT NULL`, fillErr => {
                    if (fillErr) console.error('Error populating legacy attendance column from status:', fillErr);
                });
            }
        });

        db.query(`SHOW COLUMNS FROM attendance LIKE 'employee_name'`, (showNameErr, nameResults) => {
            if (!showNameErr && nameResults && nameResults.length > 0) {
                db.query(`UPDATE attendance a JOIN employees e ON a.employee_name = e.name SET a.employee_id = e.id WHERE a.employee_id IS NULL`, joinErr => {
                    if (joinErr) console.error('Error setting attendance.employee_id values from employee_name:', joinErr);
                });
                db.query(`UPDATE attendance a JOIN employees e ON a.employee_id = e.id SET a.employee_name = e.name WHERE a.employee_name IS NULL`, fillNameErr => {
                    if (fillNameErr) console.error('Error populating attendance.employee_name values from employee_id:', fillNameErr);
                });
            }

            db.query(`DELETE a1 FROM attendance a1 JOIN attendance a2 ON a1.employee_id = a2.employee_id AND a1.date = a2.date AND a1.id > a2.id`, dedupeErr => {
                if (dedupeErr) {
                    console.error('Error deduplicating attendance records:', dedupeErr);
                }
                ensureUniqueIndex('attendance', 'uniq_attendance_employee_date', 'employee_id, date', err => {
                    if (err) console.error('Error creating unique attendance index:', err);
                });
            });
        });
    }
});

// Static folder serve
app.use(express.static(path.join(__dirname, '../public')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Add Employee
app.post("/add-employee", (req, res) => {
    const { name, mobile, salary } = req.body;
    if (!name || !mobile || !salary) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO employees (name, mobile, salary) VALUES (?, ?, ?)";
    db.query(sql, [name, mobile, salary], (err, result) => {
        if (err) {
            console.error("Error adding employee:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Employee added", id: result.insertId });
    });
});

// Get Employees
app.get("/get-employees", (req, res) => {
    const sql = "SELECT * FROM employees ORDER BY id ASC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching employees:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Delete Employee and Reset IDs
app.delete("/delete-employee/:id", (req, res) => {
    const { id } = req.params;

    // Step 1: Delete Employee
    db.query("DELETE FROM employees WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting employee");
        }

        // Step 2: Reset IDs Sequentially
        db.query("SET @count = 0;", (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error resetting count");
            }
            db.query("UPDATE employees SET id = (@count := @count + 1);", (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Error updating employee IDs");
                }

                // Step 3: Reset Auto-Increment Counter
                db.query("ALTER TABLE employees AUTO_INCREMENT = 1;", (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error resetting auto-increment");
                    }
                    res.send("Employee deleted and IDs reset.");
                });
            });
        });
    });
});

// Update Employee
app.put("/update-employee/:id", (req, res) => {
    const { id } = req.params;
    const { name, mobile, salary } = req.body;

    if (!name || !mobile || !salary) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "UPDATE employees SET name = ?, mobile = ?, salary = ? WHERE id = ?";
    db.query(sql, [name, mobile, salary, id], (err, result) => {
        if (err) {
            console.error("Error updating employee:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Employee updated" });
    });
});

// Get Attendance for a specific date
app.post("/get-attendance", express.json(), (req, res) => {
    const { date } = req.body;
    
    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }
    
    const sql = "SELECT employee_id, employee_name, status, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM attendance WHERE date = ?";
    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error("Error fetching attendance:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Get Attendance for a specific month
app.post("/get-monthly-attendance", express.json(), (req, res) => {
    const { month } = req.body;
    
    if (!month) {
        return res.status(400).json({ error: "Month is required" });
    }
    
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;
    
    const sql = `SELECT employee_id, employee_name, status, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM attendance WHERE date >= ? AND date <= ? ORDER BY employee_id, date`;
    db.query(sql, [startDate, endDate], (err, results) => {
        if (err) {
            console.error("Error fetching monthly attendance:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Add, update, or delete attendance records
app.post("/save-attendance", express.json(), (req, res) => {
    const { attendance } = req.body;

    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
        return res.status(400).json({ error: "Valid attendance data is required" });
    }

    let completedCount = 0;
    let errorCount = 0;

    attendance.forEach(record => {
        const { id: employee_id, date, status } = record;

        if (!employee_id || !date || typeof status !== 'string') {
            errorCount++;
            checkCompletion();
            return;
        }

        if (status === 'Select') {
            const deleteSql = "DELETE FROM attendance WHERE employee_id = ? AND date = ?";
            db.query(deleteSql, [employee_id, date], (deleteErr) => {
                if (deleteErr) {
                    console.error("Error deleting attendance record:", deleteErr);
                    errorCount++;
                } else {
                    completedCount++;
                }
                checkCompletion();
            });
            return;
        }

        const insertSql = `INSERT INTO attendance (employee_id, date, status, employee_name, attendance)
            VALUES (?, ?, ?, (SELECT name FROM employees WHERE id = ?), ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status), attendance = VALUES(attendance), employee_name = VALUES(employee_name), updated_at = CURRENT_TIMESTAMP`;

        db.query(insertSql, [employee_id, date, status, employee_id, status], (insertErr) => {
            if (insertErr) {
                console.error("Error saving attendance record:", { employee_id, date, status }, insertErr);
                errorCount++;
            } else {
                completedCount++;
            }
            checkCompletion();
        });
    });

    function checkCompletion() {
        if (completedCount + errorCount === attendance.length) {
            if (errorCount > 0) {
                return res.status(500).json({ 
                    error: "Some attendance records failed to save", 
                    completed: completedCount,
                    failed: errorCount
                });
            }
            return res.status(200).json({ 
                message: "Attendance saved successfully",
                count: completedCount
            });
        }
    }
});

// Start the server
let currentPort = port;

const startServer = (listenPort) => {
    const instance = app.listen(listenPort, () => {
        console.log(`Server running on http://localhost:${listenPort}`);
    });

    instance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            const nextPort = listenPort + 1;
            console.warn(`Port ${listenPort} is already in use. Trying port ${nextPort}...`);
            startServer(nextPort);
            return;
        }
        throw err;
    });
};

startServer(currentPort);