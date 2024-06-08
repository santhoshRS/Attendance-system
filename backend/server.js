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
// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'santhosh.raai0486@gmail.com',
//         pass: 'ikxxphvbequoxtqe',
//     },
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // SMTP server address (e.g., smtp.mailtrap.io)
    port: 587, // Port for secure SMTP (usually 587 for TLS, 465 for SSL, 25 for non-secure)
    secure: false, // Set to true if you are connecting to port 465
    auth: {
        user: 'connect@thecreativessummit.net', // Your email address
        pass: 'creativesummit2024', // Your email password or an app-specific password
    },
});

app.post('/api/send-email', (req, res) => {
    const { email, qrCodeData } = req.body;

    // Generate the QR code image URL
    const qrCodeContent = qrCodeData.split(',')[1];

    const mailOptions = {
        from: 'connect@thecreativessummit.net',
        to: email,
        subject: 'Creative Summit 2024 Registration',
        html: `
        <p>Thank you for registering for the Creative Summit “Powering Your Future”
        Attached is your personal QR code for your check-in process.</p>
        </br>
        <p>Please note</p>
        <p>1. Your QR code should not be shared with anyone.</p>
        <p>2. You must have your QR code present for entry (Day and Night sessions)</p>
        <p>3. No new QR code will be issued during the days of the conference.</p>
        <p>4. If you did not receive a QR code please let us know by email: connect@thecreativessummit.net or message on Facebook.</p>
        </br>
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
            console.log(error);
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
        enableArithAbort: true,
        trustServerCertificate: true
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
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query('SELECT * FROM Creative_Summit_Reg');
            res.json(result.recordset);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/api/data/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('RegistrationID', sql.Int, id)
                .query('SELECT * FROM Creative_Summit_Reg WHERE RegistrationID = @RegistrationID');
            res.json(result.recordset);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/create', async (req, res) => {
        const { firstName, lastName, email, phone, organization, classSelection, location, socialMedia, comments } = req.body;

        try {

            // Get the connection pool
            const pool = await sql.connect(config);

            // SQL insert statement
            const insertQuery = `
            INSERT INTO Creative_Summit_Reg (FirstName, LastName, Email, Phone, Organization, ClassName, Location, SocialMedia, Comment) 
            VALUES (@FirstName, @LastName, @Email, @Phone, @Organization, @ClassName, @Location, @SocialMedia, @Comment)
          `;

            // Execute the insert query
            await pool.request()
                .input('FirstName', sql.NVarChar, firstName) // Use appropriate sql data type and value
                .input('LastName', sql.NVarChar, lastName)
                .input('Email', sql.NVarChar, email)
                .input('Phone', sql.NVarChar, phone)
                .input('Organization', sql.NVarChar, organization)
                .input('ClassName', sql.NVarChar, classSelection)
                .input('Location', sql.NVarChar, location)
                .input('SocialMedia', sql.NVarChar, socialMedia)
                .input('Comment', sql.NVarChar, comments)
                .query(insertQuery);

            res.status(200).send('Record inserted successfully!');
        } catch (err) {
            console.error('Error inserting record: ', err);
            res.status(500).send('Error inserting record');
        } 
    });

    app.post('/api/checkin', async (req, res) => {
        const { id } = req.body;

        try {

            // Get the connection pool
            const pool = await sql.connect(config);

            // SQL insert statement
            const insertQuery = `
            INSERT INTO UserCheckin (RegistrationID, Checkin_Status, Checkin_Time) 
            VALUES (@RegistrationID, @Checkin_Status, @Checkin_Time)
          `;

            // Execute the insert query
            await pool.request()
                .input('RegistrationID', sql.Int, id) // Use appropriate sql data type and value
                .input('Checkin_Status', sql.Bit, true)
                .input('Checkin_Time', sql.DateTime, new Date())
                .query(insertQuery);

            res.status(200).send('Record inserted successfully!');
        } catch (err) {
            console.error('Error inserting record: ', err);
            res.status(500).send('Error inserting record');
        }
    });

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



