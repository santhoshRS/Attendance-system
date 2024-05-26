require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Set up your email service credentials
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'santhosh.raai0486@gmail.com',
        pass: 'ikxxphvbequoxtqe',
    },
});

app.post('/api/send-email', (req, res) => {
    const { email, qrCodeData } = req.body;

    // Generate the QR code image URL
    const qrCodeContent = qrCodeData.split(',')[1];

    const mailOptions = {
        from: 'santhosh.raai0486@gmail.com',
        to: email,
        subject: 'Your QR Code',
        html: `
            <p>Scan the QR code below to access the link:</p>
            <img src="cid:unique_image_cid" width='120' height='120'/>
        `,
        attachments: [{
            filename: 'image.png',
            content: qrCodeContent, // Replace with your base64 encoded image data
            encoding: 'base64',
            cid: 'unique_image_cid' // same cid value as in the html img src
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ error: error.toString() });
        }
        res.send({ message: 'Email sent successfully!' });
    });
});


// SQL Server connection configuration using environment variables
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // This can be a full server name like 'yourserver.database.windows.net'
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use encryption
        enableArithAbort: true
    }
};

// Connect to the database
sql.connect(config, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');

    app.get('/api/data', async (req, res) => {
        try {
            const result = await sql.query('SELECT * FROM Creative_Summit_Reg');
            res.json(result.recordset);
        } catch (err) {
            res.status(500).send(err);
        }
    });
    
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



