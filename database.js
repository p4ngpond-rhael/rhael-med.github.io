// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mdkku.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the MDKKU SQLite database.');
});

db.serialize(() => {
    // Create tables...
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student')`);
    db.run(`CREATE TABLE IF NOT EXISTS topics (id INTEGER PRIMARY KEY, year INTEGER NOT NULL, name TEXT NOT NULL, description TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS materials (id INTEGER PRIMARY KEY, topic_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, file_url TEXT, material_type TEXT NOT NULL, FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE)`);

    // Add sample data only if users table is empty
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            console.log("Tables are empty, inserting all sample data...");
            const insertUser = 'INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)';
            // Admin User
            db.run(insertUser, ['Admin User', 'admin@example.com', 'password123', 'admin']);
            // NEW: Student User
            db.run(insertUser, ['Student User', 'student@example.com', 'password123', 'student']);

            // ... (rest of the sample data for topics and materials)
            const insertTopic = 'INSERT INTO topics (year, name, description) VALUES (?,?,?)';
            const insertMaterial = 'INSERT INTO materials (topic_id, title, description, file_url, material_type) VALUES (?,?,?,?,?)';
            db.run(insertTopic, [1, "Psychiatry", "Study of mental disorders..."], function(err) {
                if(err) return console.error(err.message);
                db.run(insertMaterial, [this.lastID, "Intro to Neurotransmitters", "Lecture slides.", "/uploads/sample.pdf", "Slides"]);
            });
            db.run(insertTopic, [1, "Biochemistry", "Chemical processes..."], function(err) {
                if(err) return console.error(err.message);
                db.run(insertMaterial, [this.lastID, "The Krebs Cycle", "Detailed diagram.", "/uploads/sample.pdf", "Diagram"]);
            });
            db.run(insertTopic, [2, "Pharmacology", "Study of drug action..."]);
        }
    });
});

db.close((err) => {
    if (err) return console.error(err.message);
    console.log('Database setup complete. Connection closed.');
});
