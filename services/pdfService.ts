import { Receipt } from '../types';

// Helper to convert number to words in Indian numbering system
const numberToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const inWords = (n: number): string => {
        let str = '';
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str;
    };

    let n = Math.floor(num);
    let out = '';
    out += inWords(Math.floor(n / 10000000) % 100).trim() ? inWords(Math.floor(n / 10000000) % 100) + 'crore ' : '';
    out += inWords(Math.floor(n / 100000) % 100).trim() ? inWords(Math.floor(n / 100000) % 100) + 'lakh ' : '';
    out += inWords(Math.floor(n / 1000) % 100).trim() ? inWords(Math.floor(n / 1000) % 100) + 'thousand ' : '';
    out += inWords(Math.floor(n / 100) % 100).trim() ? inWords(Math.floor(n / 100) % 100) + 'hundred ' : '';
    if (n > 100 && n % 100 > 0) {
        out += 'and ';
    }
    out += inWords(n % 100);

    return out.trim().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export const generateReceiptPdf = (receipt: Receipt) => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const autoTable = (window as any).autoTable;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Arulmigu Angala Parameswari Temple', 105, 22, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sannathi Street, Madurai, Tamil Nadu - 625001', 105, 30, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Donation & Pooja Receipt', 105, 45, { align: 'center' });

    doc.setFontSize(10);
    const date = new Date(receipt.offeringDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Date: ${date}`, 195, 55, { align: 'right' });
    doc.text(`Receipt No: ${receipt.receiptNumber}`, 15, 55);

    doc.text('Received with thanks from:', 15, 65);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.devoteeName, 15, 70);
    
    const totalAmount = receipt.items.reduce((sum, item) => sum + item.amount, 0);

    const mainTableColumn = ["Seva / Donation Description", "Amount"];
    const mainTableRows: any[] = [];
    receipt.items.forEach(item => {
        mainTableRows.push([
            item.description,
            item.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        ]);
    });

    autoTable(doc, {
        head: [mainTableColumn],
        body: mainTableRows,
        startY: 80,
        theme: 'grid',
        headStyles: { fillColor: [128, 0, 0], textColor: 255, fontStyle: 'bold' }, // Maroon header
        styles: { cellPadding: 3, fontSize: 10 },
        columnStyles: { 1: { halign: 'right' } }
    });

    let finalY = (doc as any).lastAutoTable.finalY;
    
    // Total Amount
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 130, finalY + 10);
    doc.text(totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), 195, finalY + 10, { align: 'right' });

    finalY += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`In words: Rupees ${numberToWords(totalAmount)} Only`, 15, finalY + 10);
    
    finalY += 20;
    doc.setLineWidth(0.2);
    doc.line(15, finalY, 195, finalY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Prasadam will be offered in your name. May the blessings of the deity be with you always.', 105, finalY + 10, { align: 'center', maxWidth: 180 });

    doc.text('For Arulmigu Angala Parameswari Temple Trust', 195, finalY + 30, { align: 'right' });


    doc.save(`Receipt-${receipt.receiptNumber}.pdf`);
};