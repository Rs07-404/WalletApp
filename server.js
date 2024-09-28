const express = require("express");
const mysql = require('mysql2');
const app = express();
const bcrypt = require("bcryptjs")
require("dotenv").config();
const host = process.env.SERVERHOST;
const port = process.env.PORT;
const cookieParser = require("cookie-parser")
app.use(express.json());
app.use(cookieParser());
app.use("/",express.static("./public"));

const database = process.env.DATABASE;
var con = mysql.createConnection({
    host: process.env.DATABASEHOST,
    user: process.env.USER,
    password: process.env.PASSWORD
})

function createTable(tableName, callback) {
    con.query(`USE ${database}`, (err) => {
        if (err) return callback(err);

        con.query(`SHOW TABLES LIKE '${tableName}'`, (err, result) => {
            if (err) return callback(err);

            if (result.length === 0) {
                console.log(`Creating Table '${tableName}'`);

                let createTableQuery;
                let insertDataQuery;

                switch (tableName) {
                    case "users":
                        createTableQuery = `
                            CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    verification BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

                        `;
                        insertDataQuery = `
                            INSERT INTO users (name, username, email, phone, password, verification) VALUES
('John Doe', 'john_doe', 'john.doe@example.com', '1234567890', '$2b$10$ExU58e8T2r2/UbA1CqE7H.3hl6YPbTg6TosRX0xhkwL4n/SlDsYWC', TRUE),
('Jane Smith', 'jane_smith', 'jane.smith@example.com', '0987654321', '$2b$10$thCTyxw8Nl/Pqz47l5URCO2/wo2uxk25H/eFNBFBrEZT5dx3J4Sii', FALSE),
('Raunak Rajesh Shah', 'rs7', 'shahrrs2004@gmail.com', '07620880485', '$2a$10$2BCfHYrAJrMTyITWRLmawO4cC2CkXv2Z3FPzIdtBGjdtHSeKxETv6', 0);

                        `;
                        break;
                    case "admins":
                        createTableQuery = `
                            CREATE TABLE admins (
                                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                                admin_name VARCHAR(50) NOT NULL UNIQUE,
                                email VARCHAR(100) NOT NULL UNIQUE,
                                password VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            );
                        `;
                        insertDataQuery = `
                            INSERT INTO admins (admin_name, email, password) VALUES 
                            ('admin_1', 'admin1@example.com', 'hashed_password3'),
                            ('admin_2', 'admin2@example.com', 'hashed_password4'),
                            ('rs7','shahrrs2004@gmail.com','$2a$10$2BCfHYrAJrMTyITWRLmawO4cC2CkXv2Z3FPzIdtBGjdtHSeKxETv6');
                        `;
                        break;
                    case "cards":
                        createTableQuery = `
                            CREATE TABLE cards (
                                card_id INT AUTO_INCREMENT PRIMARY KEY,
                                card_number VARCHAR(19) NOT NULL UNIQUE,
                                cardholder_name VARCHAR(100) NOT NULL,
                                card_type VARCHAR(50) NOT NULL,
                                expiration_date DATE NOT NULL,
                                cvv VARCHAR(4) NOT NULL,
                                bank_name VARCHAR(100) NOT NULL,
                                issuing_country VARCHAR(50) NOT NULL,
                                user_id INT,
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
                            );
                        `;
                        insertDataQuery = `
                            INSERT INTO cards (card_number, cardholder_name, card_type, expiration_date, cvv, bank_name, issuing_country, user_id) VALUES
                            ('4539677908016808', 'John Doe', 'Visa', '2026-11-30', '123', 'ABC Bank', 'USA', 1),
                            ('5382903748728495', 'Jane Smith', 'MasterCard', '2025-04-30', '456', 'XYZ Bank', 'Canada', 2),
                            ('371449635398431', 'Alice Johnson', 'American Express', '2027-08-31', '7890', 'DEF Bank', 'UK', 3),
                            ('6011748923890834', 'Bob Brown', 'Discover', '2024-09-30', '321', 'GHI Bank', 'Australia', 3),
                            ('3530111333300000', 'Charlie Davis', 'JCB', '2026-02-28', '654', 'JKL Bank', 'Japan', 1),
                            ('213198765432101', 'Emily Wilson', 'Diners Club', '2025-12-31', '987', 'MNO Bank', 'France', 3);
                        `;
                        break;
                    default:
                        return callback(new Error(`Unknown table name: ${tableName}`));
                }

                con.query(createTableQuery, (err) => {
                    if (err) return callback(err);

                    if (insertDataQuery) {
                        con.query(insertDataQuery, (err) => {
                            if (err) console.error(err);
                            else console.log(`Sample data added to '${tableName}' table`);
                        });
                    }

                    console.log(`Table '${tableName}' created`);
                    callback();
                });
            } else {
                console.log(`${tableName} table found.`);
                callback();
            }
        });
    });
}
con.connect(async function(err){
    if(err) {console.error("error " + err);}
    else {
        console.log("Connected!");
        con.query(`SHOW DATABASES LIKE '${database}'`,function(err, result){
            if(err) throw err;
            if(result.length === 0){
                con.query(`CREATE DATABASE ${database}`,(err)=>{
                    if(err) {throw err;}
                    else {
                        console.log(`Database ${database} created`); 
                        createTable("users", () => {
                            createTable("admins", () => {
                                createTable("cards", () => {
                                    console.log("Ready");
                                });
                            });
                        })
                        
                    }
                })
            }else{
                console.log(`database ${database} found.`);
                createTable("users", () => {
                    createTable("admins", () => {
                        createTable("cards", () => {
                            console.log("Ready");
                        });
                    });
                })
            }
        })
    }
});

const authenticate = require('./middlewares/authenticate');
const authorizeAdmin = require('./middlewares/adminAuth');
const jwt = require("jsonwebtoken");


app.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    con.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid username.' });

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ success: false, message: 'Error comparing passwords.' });
            if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid password.' });

            const token = jwt.sign({ user_id: user.user_id, username: user.username, role: role }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie("token",token,{maxAge: 24*60*60*1000, httpOnly: true, secure: true, sameSite: 'strict'}).json({ success: true, message: 'Login successful', token: token, user_id: user.user_id, name: user.name });
        });
    });
});

app.post('/signup', async (req, res) => {
    const {name, username, email, phone, password} = req.body;
    con.query(`SELECT * FROM ${database}.users WHERE email = ?`, [email], (err, results) => {
        if (err) {console.log(err); return res.status(500).json({ success: false, message: 'Database error' });}
        if (results.length > 0) return res.status(400).json({ success: false, message: 'User already exists' });
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) { console.log(err); return res.status(500).json({ success: false, message: 'Error hashing password' });}
            con.query(`INSERT INTO ${database}.users (name, username, email, phone, password, verification) VALUES (?, ?, ?, ?, ?, ?)`, [name, username, email, phone, hashedPassword, 0], (err, results) => {
                if (err) return res.status(500).json({ success: false, message: 'Error creating user' });
                res.status(201).json({ success: true, message: 'User created successfully' });
            });
        });
    });
});

app.get('/cards', authenticate, (req, res) => {
    const { user_id } = req.query;
    if (req.user.user_id !== parseInt(user_id, 10)) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to cards.' });
    }
    con.query('SELECT * FROM cards WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        res.json({ success: true, cards: results });
    });
});

app.post('/cards', authenticate,(req, res) => {
    const { cardholder_name, card_number, card_type, expiration_date, cvv, bank_name, issuing_country } = req.body;
    const usr_id = req.user.user_id;
    try {
        con.query(`INSERT INTO ${database}.cards (cardholder_name, card_number, card_type, expiration_date, cvv, bank_name, issuing_country, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,[cardholder_name, card_number, card_type, expiration_date, cvv, bank_name, issuing_country, usr_id],(err)=>{
            if(err) { res.status(500).json({ message: 'An error occurred while adding the card.' });}
            else {res.status(201).json({ message: 'Card added successfully!' });}
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while adding the card.' });
    }
}); 

app.delete('/cards/:id', authenticate, async (req, res) => {
    const cardId = parseInt(req.params.id);
    const usr_id = req.user.user_id;
    con.query(
        `DELETE FROM ${database}.cards WHERE card_id = ? AND user_id = ?`,
        [cardId, usr_id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'An error occurred while deleting the card.' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Card not found or not authorized.' });
            }
            res.status(200).json({ message: 'Card deleted successfully!' });
        }
    );
});

app.put('/cards/:id', authenticate, (req, res) => {
    const id = req.params.id;
    const { cardholder_name, card_number, card_type, expiration_date, cvv, bank_name, issuing_country } = req.body;

    const query = `UPDATE ${database}.cards 
                   SET cardholder_name = ?, card_number = ?, card_type = ?, expiration_date = ?, cvv = ?, bank_name = ?, issuing_country = ? 
                   WHERE card_id = ? AND user_id = ?`;

    con.query(query, [cardholder_name, card_number, card_type, expiration_date, cvv, bank_name, issuing_country, id, req.user.user_id], (err, result) => {
        console.log(result);
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'An error occurred while updating the card.' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Card not found or you do not have permission to edit this card.' });
        } else {
            res.status(200).json({ message: 'Card updated successfully!' });
        }
    });
});


// Admin Controls
app.get('/users', authenticate, authorizeAdmin, (req, res) => {
    const query = 'SELECT user_id, name, phone, email, username FROM users';
    con.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while fetching users.' });
        }
        res.status(200).json(result);
    });
});

app.get('/users/:id', authenticate, authorizeAdmin, (req, res) => {
    const id = req.params.id;
    const query = 'SELECT user_id, name, phone, email, username FROM users WHERE user_id = ?';
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while fetching users.' });
        }
        res.status(200).json(result);
    });
});

app.post('/users', authenticate, authorizeAdmin, async (req, res) => {
    const { name, phone, email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO ${database}.users (name, phone, email, username, password) VALUES (?, ?, ?, ?, ?)`;
    con.query(query, [name, phone, email, username, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while creating the user.' });
        }
        res.status(201).json({ message: 'User created successfully!' });
    });
});

app.delete('/users/:id', authenticate, authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM ${database}.users WHERE user_id = ?`;
    con.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'An error occurred while deleting the user.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully!' });
    });
});

app.use('/admin', authenticate, authorizeAdmin, express.static('./public/admin'));

app.listen(port,()=>{
    console.log(`listening on http://${host}:${port}/`);
});
