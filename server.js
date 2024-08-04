const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to save the invoice as a PDF
app.post('/save-invoice', (req, res) => {
    const invoiceText = req.body.invoice;
    const doc = new PDFDocument();
    const timestamp = Date.now();
    const fileName = `invoice_${timestamp}.pdf`;
    const filePath = path.join(__dirname, 'bills', fileName);

    // Create a PDF and save it to the filePath
    doc.pipe(fs.createWriteStream(filePath));
    doc.text(invoiceText);
    doc.end();

    // Respond with the saved file's path and file name for download
    res.json({ message: 'Invoice saved successfully!', fileName, filePath });
});

// Serve the 'bills' folder statically to access PDFs via URL
app.use('/bills', express.static(path.join(__dirname, 'bills')));

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
 