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
    const { invoice, totalAmount } = req.body; // Destructure to get totalAmount
    const doc = new PDFDocument({
        size: 'A4', // Set page size to A4 (standard paper size)
        margins: { top: 40, left: 50, right: 50, bottom: 50 } // Set margins
    });
    const timestamp = Date.now();
    const fileName = `invoice_${timestamp}.pdf`;
    const filePath = path.join(__dirname, 'bills', fileName);

    // Create a PDF and save it to the filePath
    doc.pipe(fs.createWriteStream(filePath));

    // Add invoice header
    doc.fontSize(18).font('Helvetica-Bold').text('Hunger Hills', { align: 'center' });
    doc.moveDown(1); // Add padding after header

    // Add invoice date
    doc.fontSize(12).font('Helvetica').text(`Invoice Date: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1); // Add padding after date

    // Add a line separator
    doc.lineWidth(1).strokeColor('#ddd').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1); // Add padding after line separator

    // Add table headers
    const columnWidths = { name: 220, quantity: 100, price: 100 };
    const startX = 50; // Starting X position
    let startY = doc.y; // Starting Y position

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Item Name', startX, startY, { width: columnWidths.name, align: 'left' });
    doc.text('Quantity', startX + columnWidths.name + 20, startY, { width: columnWidths.quantity, align: 'center' }); // Added 20px spacing
    doc.text('Price', startX + columnWidths.name + columnWidths.quantity + 40, startY, { width: columnWidths.price, align: 'right' }); // Added 40px spacing

    // Move to next line after headers
    startY += 25; // Increased vertical spacing after headers
    doc.moveTo(startX, startY);
    doc.lineTo(startX + columnWidths.name + columnWidths.quantity + columnWidths.price + 60, startY); // Adjust end line position
    doc.stroke();
    startY += 15; 
    doc.moveDown(1); // Add padding after line separator

    // Add invoice details
    // Add invoice details
doc.fontSize(12).font('Helvetica');
invoice.split('\n').forEach(line => {
    const columns = line.split('|').map(col => col.trim());
    if (columns.length === 3) {
        const itemName = columns[0];
        const quantity = columns[1];
        const price = columns[2];  // No need to remove "₹" as it's already excluded

        doc.text(itemName, startX, startY, { width: columnWidths.name, align: 'left' })
            .text(quantity, startX + columnWidths.name + 20, startY, { width: columnWidths.quantity, align: 'center' })
            .text(price, startX + columnWidths.name + columnWidths.quantity + 40, startY, { width: columnWidths.price, align: 'right' });
        startY += 25; // Adjust vertical spacing for each row
    }
});


    // Add a line separator before total
    doc.lineWidth(1).strokeColor('#ddd').moveTo(startX, startY).lineTo(startX + columnWidths.name + columnWidths.quantity + columnWidths.price + 60, startY).stroke();
    startY += 15; // Add padding before the total
    doc.moveDown(1);

    // Add total
    doc.fontSize(14).font('Helvetica-Bold')
        .text('Total:', startX, startY, { width: columnWidths.name + columnWidths.quantity, align: 'left' })
        .text(`${totalAmount}`, startX + columnWidths.name + columnWidths.quantity + 40, startY, { width: columnWidths.price, align: 'right' });

    // Move to the next line before adding the thank you note
    startY += 30; // Increase space before thank you note
    doc.moveDown(1);
    doc.lineWidth(1).strokeColor('#ddd').moveTo(startX, startY).lineTo(startX + columnWidths.name + columnWidths.quantity + columnWidths.price + 60, startY).stroke();
    doc.moveDown(1);
    startY += 15;
    // Add thank you note
    doc.fontSize(14).font('Helvetica-Bold');
    const thankYouText = 'Thank you for your purchase!';
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const textWidth = doc.widthOfString(thankYouText);
    const textX = (pageWidth - textWidth) / 2 + doc.page.margins.left; // Center the text horizontally
    doc.text(thankYouText, textX, startY, { align: 'center' });

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
