const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve static files (e.g., HTML, CSS, JavaScript) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to save the invoice as a PDF
app.post('/save-invoice', (req, res) => {
    const invoiceText = req.body.invoice;
    const doc = new PDFDocument({
        size: 'A4', // Set page size to A4 (standard paper size)
        margins: { top: 40, left: 50, right: 50, bottom: 50 } // Set margins
    });
    const timestamp = Date.now();
    const fileName = `invoice_${timestamp}.pdf`;
    const filePath = path.join(__dirname, 'bills', fileName);

    // Create a PDF and save it to the filePath
    doc.pipe(fs.createWriteStream(filePath));

    // Add invoice styling and content
    doc.fontSize(18).font('Helvetica-Bold').text('Cafe Billing System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Invoice Date: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Add a line separator
    doc.moveDown();
    doc.lineWidth(1).strokeColor('#ddd').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Add invoice details
    doc.fontSize(12).font('Helvetica').text(invoiceText, { align: 'left' });

    // Add a line separator
    doc.moveDown();
    doc.lineWidth(1).strokeColor('#ddd').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Add thank you note
    doc.fontSize(14).font('Helvetica-Bold').text('Thank you for your purchase!', { align: 'center' });

    doc.end();

    // Respond with the saved file's path and file name for download
    res.json({ message: 'Invoice saved successfully!', fileName, filePath });
});

// Serve the 'bills' folder statically to access PDFs via URL
app.use('/bills', express.static(path.join(__dirname, 'bills')));

// Handle root URL request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
