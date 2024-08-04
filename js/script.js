function generateInvoice() {
    const items = [
        { id: 'pizza', name: 'Pizza', price: 10.00 },
        { id: 'sandwich', name: 'Sandwich', price: 5.00 },
        // Add more items here
    ];

    let selectedItems = items.map(item => {
        const quantity = parseInt(document.getElementById(`${item.id}-quantity`).value);
        return { ...item, quantity, total: item.price * quantity };
    }).filter(item => item.quantity > 0);

    if (selectedItems.length === 0) {
        alert("No items selected!");
        return;
    }

    const invoiceDate = new Date().toLocaleString();
    const invoiceDetails = selectedItems.map(item => `${item.name} x${item.quantity} = $${item.total.toFixed(2)}`).join('\n');
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2);

    const invoiceText = `
        Invoice Date: ${invoiceDate}
        ----------------------------------------
        ${invoiceDetails}
        ----------------------------------------
        Total: $${totalAmount}
    `;

    const customerPhone = document.getElementById("customer-phone").value;
    if (customerPhone === "") {
        alert("Please enter the customer's WhatsApp number!");
        return;
    }

    // Save the invoice as a PDF and get the file path
    saveInvoicePDF(invoiceText, customerPhone);
}

function saveInvoicePDF(invoiceText, customerPhone) {
    fetch('/save-invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice: invoiceText }),
    }).then(response => response.json())
      .then(data => {
          console.log('Invoice saved:', data);
          alert('Invoice saved successfully!');
          createWhatsAppLink(customerPhone, data.fileName);
      })
      .catch((error) => {
          console.error('Error:', error);
          alert('Failed to save invoice.');
      });
}

function createWhatsAppLink(phoneNumber, fileName) {
    const message = `Hello, please find your invoice here: http://localhost:3000/bills/${fileName}`;
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
}
