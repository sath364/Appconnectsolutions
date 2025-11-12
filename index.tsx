import React, { useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// ====================================================================================
// TYPES
// ====================================================================================
enum ReceiptStatus {
  Draft = 'வரைவு',
  Completed = 'முடிந்தது',
  Scheduled = 'திட்டமிடப்பட்டது',
}

interface OfferingItem {
  id: string;
  description: string;
  amount: number;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  devoteeName: string;
  offeringDate: string;
  items: OfferingItem[];
  status: ReceiptStatus;
  notes?: string;
  mobileNumber?: string;
}

// ====================================================================================
// DUMMY DATA
// ====================================================================================
const initialReceipts: Receipt[] = [
  { id: '1', receiptNumber: 'REC-001', devoteeName: 'Karthik S.', offeringDate: '2024-07-20', items: [{ id: 'i1', description: 'Archana', amount: 100 }], status: ReceiptStatus.Completed, mobileNumber: '9876543210', notes: 'In the name of family' },
  { id: '2', receiptNumber: 'REC-002', devoteeName: 'Priya M.', offeringDate: '2024-07-19', items: [{ id: 'i2', description: 'Abishekam', amount: 500 }], status: ReceiptStatus.Completed },
  { id: '3', receiptNumber: 'REC-003', devoteeName: 'Anand R.', offeringDate: '2024-07-18', items: [{ id: 'i3', description: 'General Donation', amount: 1001 }], status: ReceiptStatus.Completed, mobileNumber: '9123456789' },
  { id: '4', receiptNumber: 'REC-004', devoteeName: 'Lakshmi V.', offeringDate: '2024-08-01', items: [{ id: 'i4', description: 'Special Pooja', amount: 2500 }], status: ReceiptStatus.Scheduled, notes: 'For child\'s birthday' },
  { id: '5', receiptNumber: 'REC-005', devoteeName: 'Suresh Kumar', offeringDate: '2024-07-21', items: [{ id: 'i5', description: 'Annadanam Donation', amount: 200 }], status: ReceiptStatus.Draft },
];

// ====================================================================================
// ICONS
// ====================================================================================
const TempleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V10.722a2 2 0 01.553-1.414l3.553-3.553a2 2 0 012.828 0l3.553 3.553A2 2 0 0119 10.722V21M8 21v-5a2 2 0 012-2h4a2 2 0 012 2v5" />
    </svg>
);
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const InvoiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const ChartUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const Rupee = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h5m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.505 1.905 6.425l-1.241 4.545 4.644-1.216z"/>
    </svg>
);
const SmsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ====================================================================================
// FUNCTIONAL SERVICES
// ====================================================================================
const generateReceiptPdf = (receipt: Receipt) => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
    const offeringDate = new Date(receipt.offeringDate).toLocaleDateString('en-GB');

    doc.setFontSize(22);
    doc.text("Arulmigu Angala Parameswari Temple", 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text("Donation Receipt", 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Receipt No: ${receipt.receiptNumber}`, 20, 50);
    doc.text(`Date: ${offeringDate}`, 150, 50);
    
    doc.text(`Devotee Name: ${receipt.devoteeName}`, 20, 60);
    if(receipt.mobileNumber) doc.text(`Mobile No: ${receipt.mobileNumber}`, 20, 70);
    
    doc.line(20, 80, 190, 80);

    doc.setFont("helvetica", "bold");
    doc.text("Offering Description", 20, 90);
    doc.text("Amount (INR)", 185, 90, { align: 'right' });
    doc.setFont("helvetica", "normal");
    
    let yPos = 100;
    receipt.items.forEach(item => {
        doc.text(item.description, 20, yPos);
        doc.text(`₹${item.amount.toLocaleString('en-IN')}`, 185, yPos, { align: 'right' });
        yPos += 10;
    });

    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 20, yPos);
    doc.text(`₹${total.toLocaleString('en-IN')}`, 185, yPos, { align: 'right' });
    doc.setFont("helvetica", "normal");

    if (receipt.notes) {
        yPos += 20;
        doc.text("Notes:", 20, yPos);
        const notesLines = doc.splitTextToSize(receipt.notes, 170);
        doc.text(notesLines, 20, yPos + 7);
    }

    yPos = 270;
    doc.setFontSize(10);
    doc.text("Thank you for your generous donation.", 105, yPos, { align: 'center' });
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, yPos + 7, { align: 'center' });

    doc.save(`Receipt-${receipt.receiptNumber}.pdf`);
};

const sendWhatsAppMessage = (phone: string, receipt: Receipt) => {
    const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
    const message = `Vanakam from Arulmigu Angala Parameswari Temple! 🙏\nThank you, ${receipt.devoteeName}, for your offering.\n\nReceipt No: ${receipt.receiptNumber}\nTotal Amount: ₹${total.toLocaleString('en-IN')}\n\nThis is a confirmation of your donation.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
};

const sendSmsMessage = (phone: string, message: string) => {
    const smsUrl = `sms:${phone.replace(/\D/g, '')}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
};

// ====================================================================================
// GEMINI AI SERVICE
// ====================================================================================
const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    devoteeName: { type: Type.STRING, description: "The name of the devotee." },
    offeringDate: { type: Type.STRING, description: "The date of the offering, in YYYY-MM-DD format. Assume today if not specified." },
    mobileNumber: { type: Type.STRING, description: "The devotee's mobile number." },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Description of the pooja or donation (e.g., 'Archana')." },
          amount: { type: Type.NUMBER, description: "The amount." },
        },
        required: ["description", "amount"],
      },
    },
    notes: { type: Type.STRING, description: "Any specific notes." },
  },
  required: ["devoteeName", "offeringDate", "items"],
};

const createReceiptTool: FunctionDeclaration = { name: 'createReceipt', description: 'Creates a new receipt for a pooja or donation.', parameters: receiptSchema };
const getReceiptDetailsTool: FunctionDeclaration = { name: 'getReceiptDetails', description: 'Retrieves info for a receipt using its number or the devotee\'s name.', parameters: { type: Type.OBJECT, properties: { identifier: { type: Type.STRING, description: "Receipt number or devotee name" } } } };
const sendConfirmationTool: FunctionDeclaration = { name: 'sendConfirmation', description: 'Prepares a WhatsApp confirmation for a receipt.', parameters: { type: Type.OBJECT, properties: { receiptNumber: { type: Type.STRING } }, required: ["receiptNumber"] } };
const sendSmsTool: FunctionDeclaration = { name: 'sendSms', description: 'Prepares an SMS message for a receipt.', parameters: { type: Type.OBJECT, properties: { receiptNumber: { type: Type.STRING }, mobileNumber: { type: Type.STRING } }, required: ["receiptNumber", "mobileNumber"] } };

const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

type AiAction = 
    { type: 'receipt_draft', data: Partial<Receipt> } |
    { type: 'send_confirmation', receipt: Receipt } |
    { type: 'send_sms', receipt: Receipt, mobileNumber: string, message: string };

const getAiChatResponse = async (prompt: string, receipts: Receipt[]): Promise<{text: string, action?: AiAction}> => {
    if (!process.env.API_KEY) {
        return { text: "AI Assistant is not configured. An API key is required." };
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Today is ${new Date().toISOString().split('T')[0]}. User prompt: "${prompt}"`,
            config: {
                tools: [{ functionDeclarations: [createReceiptTool, getReceiptDetailsTool, sendConfirmationTool, sendSmsTool] }],
                systemInstruction: `You are a helpful Tamil temple assistant. Your name is 'Kovil Assistant'. You help manage receipts for devotees. Be polite and use temple-appropriate, respectful language. Use the provided tools to create or find receipts and prepare confirmations.`
            }
        });
        
        const functionCall = response.functionCalls?.[0];

        if (functionCall) {
            switch(functionCall.name) {
                case 'createReceipt': {
                    const receiptData = functionCall.args as Omit<Receipt, 'id' | 'receiptNumber' | 'status'>;
                    const itemsWithIds = receiptData.items.map(item => ({ ...item, id: `temp-${Math.random().toString(36).substr(2, 9)}` }));
                    return { text: 'I have the offering details. Please review and confirm to create the receipt.', action: { type: 'receipt_draft', data: { ...receiptData, items: itemsWithIds, status: ReceiptStatus.Draft } } };
                }
                case 'sendConfirmation': {
                    const { receiptNumber } = functionCall.args;
                    const receipt = receipts.find(r => r.receiptNumber.toLowerCase() === receiptNumber?.toLowerCase());
                     if (receipt) {
                        if (!receipt.mobileNumber) return { text: `Sorry, receipt ${receiptNumber} has no mobile number.` };
                        return { text: `To send the confirmation for receipt ${receipt.receiptNumber}, click the button below.`, action: { type: 'send_confirmation', receipt } };
                    }
                    return { text: `Sorry, I could not find receipt ${receiptNumber}.` };
                }
                case 'sendSms': {
                    const { receiptNumber, mobileNumber } = functionCall.args;
                    const receipt = receipts.find(r => r.receiptNumber.toLowerCase() === receiptNumber.toLowerCase());
                    if (receipt) {
                        const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                        const message = `Vanakam from Arulmigu Angala Parameswari Temple. Thank you, ${receipt.devoteeName}! Receipt No: ${receipt.receiptNumber}. Total: ₹${total.toLocaleString('en-IN')}.`;
                        return { text: `The SMS for receipt ${receipt.receiptNumber} is ready. Click below to send it to ${mobileNumber}.`, action: { type: 'send_sms', receipt, mobileNumber, message } };
                    }
                    return { text: `Sorry, I could not find receipt ${receiptNumber}.` };
                }
                case 'getReceiptDetails': {
                    const { identifier } = functionCall.args;
                    const found = receipts.find(r => r.receiptNumber.toLowerCase() === identifier.toLowerCase() || r.devoteeName.toLowerCase().includes(identifier.toLowerCase()));
                    if (found) {
                        const total = found.items.reduce((s, i) => s + i.amount, 0);
                        const itemsSummary = found.items.map(item => `• ${item.description} – ${formatCurrency(item.amount)}`).join('\n');
                        const offeringDate = new Date(found.offeringDate).toLocaleDateString('en-GB');
                        return { text: `🙏 Receipt Details – ${found.receiptNumber} 🙏\n\n🧾 Receipt No: ${found.receiptNumber}\n👤 Devotee: ${found.devoteeName}\n🗓️ Date: ${offeringDate}\n\n🌺 Offerings:\n${itemsSummary}\n\n💰 Total: ${formatCurrency(total)}\n✅ Status: ${found.status}` };
                    }
                    return { text: "Sorry, I couldn't find a matching receipt." };
                }
            }
        }
        return { text: response.text.trim() };
    } catch (error) {
        console.error("Error in AI chat response:", error);
        return { text: "There was an error contacting the AI assistant." };
    }
};

// ====================================================================================
// REACT COMPONENTS
// ====================================================================================
const Header: React.FC<{ onMenuClick: () => void; title: string; }> = ({ onMenuClick, title }) => (
    <header className="md:hidden bg-card p-4 border-b border-border-color flex items-center space-x-4 sticky top-0 z-10">
      <button onClick={onMenuClick} className="text-text-primary"><MenuIcon /></button>
      <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>
    </header>
);

const DashboardCard: React.FC<{ title: string; value: string; icon: ReactNode; trend?: 'up' | 'down'; }> = ({ title, value, icon, trend }) => {
    const trendColor = trend === 'up' ? 'text-success' : 'text-danger';
    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border-color">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-text-secondary font-medium">{title}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-full ${trend === 'up' ? 'bg-success-light' : trend === 'down' ? 'bg-danger-light' : 'bg-gray-100'}`}>
                    <span className={trend ? trendColor : 'text-text-secondary'}>{icon}</span>
                </div>
            </div>
        </div>
    );
};

const TempleOverview: React.FC<{ receipts: Receipt[] }> = ({ receipts }) => {
    const totalDonationAmount = receipts.reduce((sum, rec) => sum + rec.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);
    const poojaCount = receipts.length;
    const averageDonation = poojaCount > 0 ? totalDonationAmount / poojaCount : 0;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-text-primary mb-6">Temple Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Total Collection" value={`₹${totalDonationAmount.toLocaleString('en-IN')}`} icon={<ChartUp />} trend="up" />
                <DashboardCard title="Total Receipts" value={poojaCount.toString()} icon={<InvoiceIcon />} />
                <DashboardCard title="Average Collection" value={`₹${averageDonation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Rupee />} />
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Recent Receipts</h2>
                <div className="bg-card rounded-lg shadow-md border border-border-color overflow-hidden">
                    <ul className="divide-y divide-border-color">
                        {receipts.slice(0, 5).map(receipt => (
                            <li key={receipt.id} className="p-4 flex justify-between items-center hover:bg-yellow-50 transition-colors">
                                <div>
                                    <p className="font-semibold text-text-primary">{receipt.devoteeName}</p>
                                    <p className="text-sm text-text-secondary">{receipt.receiptNumber} - {new Date(receipt.offeringDate).toLocaleDateString('en-GB')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-text-primary">₹{receipt.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-text-secondary">{receipt.items.map(i => i.description).join(', ')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const ReceiptView: React.FC<{ receipts: Receipt[]; onNew: () => void; onEdit: (receipt: Receipt) => void; onDelete: (id: string) => void; }> = ({ receipts, onNew, onEdit, onDelete }) => {
    const [filter, setFilter] = useState<ReceiptStatus | 'All'>('All');
    const filteredReceipts = receipts.filter(r => filter === 'All' || r.status === filter);

    const statusStyles: { [key in ReceiptStatus]: { bg: string; text: string; } } = {
        [ReceiptStatus.Completed]: { bg: 'bg-success-light', text: 'text-success' },
        [ReceiptStatus.Scheduled]: { bg: 'bg-warning-light', text: 'text-warning' },
        [ReceiptStatus.Draft]: { bg: 'bg-gray-100', text: 'text-gray-500' },
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-text-primary">Donation Receipts</h1>
                <button onClick={onNew} className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover">
                    <span>New Receipt</span>
                </button>
            </div>
            <div className="hidden md:block bg-card rounded-lg shadow-md border border-border-color overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-yellow-50 border-b border-border-color">
                        <tr>
                            {['Receipt No.', 'Devotee Name', 'Date', 'Amount', 'Status', 'Actions'].map(h => <th key={h} className="p-4 text-sm font-semibold text-text-secondary">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map(receipt => {
                            const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                            const statusStyle = statusStyles[receipt.status];
                            return (
                                <tr key={receipt.id} className="border-b border-border-color last:border-0 hover:bg-yellow-50">
                                    <td className="p-4 font-medium">{receipt.receiptNumber}</td>
                                    <td className="p-4">{receipt.devoteeName}</td>
                                    <td className="p-4">{receipt.offeringDate}</td>
                                    <td className="p-4 font-semibold">₹{total.toLocaleString('en-IN')}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{receipt.status}</span></td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => onEdit(receipt)} className="p-2 text-gray-500 hover:text-primary"><ViewIcon /></button>
                                            <button onClick={() => generateReceiptPdf(receipt)} className="p-2 text-gray-500 hover:text-primary"><PdfIcon /></button>
                                            <button onClick={() => onDelete(receipt.id)} className="p-2 text-gray-500 hover:text-danger"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             <div className="md:hidden space-y-4">
                {filteredReceipts.map(receipt => {
                    const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                    const statusStyle = statusStyles[receipt.status];
                    return (
                        <div key={receipt.id} className="bg-card rounded-lg shadow-md border border-border-color p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-text-primary">{receipt.devoteeName}</p>
                                    <p className="text-sm text-text-secondary">{receipt.receiptNumber}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{receipt.status}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-border-color pt-3 mt-3">
                                <p className="font-bold text-lg text-text-primary">₹{total.toLocaleString('en-IN')}</p>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => onEdit(receipt)} className="p-2 text-gray-500 hover:text-primary"><ViewIcon /></button>
                                    <button onClick={() => generateReceiptPdf(receipt)} className="p-2 text-gray-500 hover:text-primary"><PdfIcon /></button>
                                    <button onClick={() => onDelete(receipt.id)} className="p-2 text-gray-500 hover:text-danger"><DeleteIcon /></button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const Sidebar: React.FC<{ currentView: string; onNavigate: (view: string) => void; isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }> = ({ currentView, onNavigate, isOpen, setIsOpen }) => {
    const navItems = [
        { id: 'temple_overview', label: 'Overview', icon: <DashboardIcon /> },
        { id: 'receipts', label: 'Receipts', icon: <InvoiceIcon /> },
    ];
    return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-border-color flex flex-col transform transition-transform z-40 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-border-color">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white"><TempleIcon /></div>
            <span className="font-bold text-lg text-text-primary">A.P. Kovil</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-text-secondary"><CloseIcon /></button>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${currentView === item.id ? 'bg-primary text-white font-semibold' : 'text-text-secondary hover:bg-yellow-50'}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-border-color">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-yellow-50"><LogoutIcon /><span>Logout</span></a>
        </div>
      </aside>
    </>
  );
};

const Modal: React.FC<{ children: ReactNode; onClose: () => void; }> = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
);

const ReceiptForm: React.FC<{ initialData?: Receipt; onSave: (receipt: Omit<Receipt, 'id'> & { id?: string }) => void; onClose: () => void; generateReceiptNumber: () => string; }> = ({ initialData, onSave, onClose, generateReceiptNumber }) => {
    const [formData, setFormData] = useState<Omit<Receipt, 'id'>>(initialData || {
        receiptNumber: '', devoteeName: '', offeringDate: new Date().toISOString().split('T')[0],
        items: [{ id: `new-${Date.now()}`, description: 'Archana', amount: 0 }],
        status: ReceiptStatus.Completed, notes: '', mobileNumber: '',
    });
    useEffect(() => {
        setFormData(prev => ({ ...prev, receiptNumber: initialData?.receiptNumber || generateReceiptNumber() }));
    }, [initialData, generateReceiptNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'amount' || name === 'description') {
            const newItems = [{...formData.items[0], [name]: name === 'amount' ? parseFloat(value) || 0 : value}];
            setFormData(p => ({ ...p, items: newItems }));
        } else {
            setFormData(p => ({ ...p, [name]: value }));
        }
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formData, id: initialData?.id }); };
    const totalAmount = useMemo(() => formData.items.reduce((sum, item) => sum + item.amount, 0), [formData.items]);

    return (
        <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold mb-6">{initialData ? 'Edit Receipt' : 'New Receipt'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm">Receipt No.*</label><input type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" required /></div>
                <div><label className="block text-sm">Devotee Name*</label><input type="text" name="devoteeName" value={formData.devoteeName} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" required /></div>
                <div><label className="block text-sm">Mobile No.</label><input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" /></div>
                <div><label className="block text-sm">Date*</label><input type="date" name="offeringDate" value={formData.offeringDate} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" required /></div>
                <div><label className="block text-sm">Offering*</label><input type="text" name="description" value={formData.items[0].description} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" required /></div>
                <div><label className="block text-sm">Amount (₹)*</label><input type="number" name="amount" value={formData.items[0].amount || ''} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" min="0" required /></div>
                <div className="md:col-span-2"><label className="block text-sm">Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded" rows={2}></textarea></div>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded text-right"><p className="text-xl font-bold">Total: ₹{totalAmount.toLocaleString('en-IN')}</p></div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg">{initialData ? 'Update' : 'Create'}</button>
            </div>
        </form>
    );
};

const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Chatbox: React.FC<{ receipts: Receipt[]; onReceiptCreate: (data: Partial<Receipt>) => void; onOpenManualForm: () => void; }> = ({ receipts, onReceiptCreate, onOpenManualForm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; action?: AiAction; requiresConfirmation?: boolean; }[]>([{ sender: 'ai', text: `Vanakam! How can I help?` }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = { sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponse = await getAiChatResponse(input, receipts);
        const aiMessage = { sender: 'ai' as const, ...aiResponse, requiresConfirmation: !!(aiResponse.action?.type === 'receipt_draft') };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleConfirmation = async (confirmed: boolean, action?: AiAction) => {
        setMessages(prev => prev.map(m => m.requiresConfirmation ? { ...m, requiresConfirmation: false } : m));
        if (confirmed && action?.type === 'receipt_draft') {
            onReceiptCreate(action.data);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Done. The receipt has been created.' }]);
        } else {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Okay, the action was cancelled.' }]);
        }
    };
    
    const handleActionClick = (action: AiAction) => {
        setMessages(prev => prev.map(m => m.action === action ? { ...m, action: undefined } : m));
        if (action.type === 'send_confirmation' && action.receipt.mobileNumber) {
            sendWhatsAppMessage(action.receipt.mobileNumber, action.receipt);
            setMessages(prev => [...prev, { sender: 'ai', text: `Opened WhatsApp for ${action.receipt.receiptNumber}.` }]);
        }
        if (action.type === 'send_sms') {
            sendSmsMessage(action.mobileNumber, action.message);
            setMessages(prev => [...prev, { sender: 'ai', text: `Opened SMS app for ${action.receipt.receiptNumber}.` }]);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover z-20"><ChatIcon /></button>
            {isOpen && (
                <div className="fixed inset-0 sm:bottom-28 sm:right-8 sm:inset-auto sm:w-96 sm:h-[32rem] bg-white rounded-lg shadow-2xl flex flex-col border z-30">
                    <header className="p-4 bg-yellow-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg text-text-primary">Kovil Assistant</h3>
                        <button onClick={() => { onOpenManualForm(); setIsOpen(false); }} className="bg-primary text-white px-3 py-1 rounded-lg text-sm">New Receipt</button>
                    </header>
                    <main className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'}`}>
                                    <p>{msg.text}</p>
                                    {msg.requiresConfirmation && (
                                        <div className="flex space-x-2 mt-3">
                                            <button onClick={() => handleConfirmation(true, msg.action)} className="px-3 py-1 text-xs bg-success text-white rounded">Confirm</button>
                                            <button onClick={() => handleConfirmation(false)} className="px-3 py-1 text-xs bg-danger text-white rounded">Cancel</button>
                                        </div>
                                    )}
                                     {msg.action && (msg.action.type === 'send_confirmation' || msg.action.type === 'send_sms') && (
                                        <div className="flex space-x-2 mt-3">
                                             <button onClick={() => handleActionClick(msg.action)} className="flex items-center space-x-2 px-3 py-1 text-xs bg-green-500 text-white rounded">
                                                {msg.action.type === 'send_confirmation' ? <WhatsAppIcon /> : <SmsIcon />}
                                                <span>Send</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-100"><Spinner /></div></div>}
                        <div ref={messagesEndRef} />
                    </main>
                    <footer className="p-2 border-t">
                        <div className="flex space-x-2">
                             <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for assistance..." className="w-full p-2 border rounded-md" disabled={isLoading} />
                             <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-primary text-white px-4 py-2 rounded-lg disabled:bg-gray-400">Send</button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

// ====================================================================================
// MAIN APP COMPONENT
// ====================================================================================
const App: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [currentView, setCurrentView] = useState('temple_overview');
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptToEdit, setReceiptToEdit] = useState<Receipt | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenCreateReceiptModal = useCallback(() => { setReceiptToEdit(undefined); setReceiptModalOpen(true); }, []);
  const handleOpenEditReceiptModal = useCallback((receipt: Receipt) => { setReceiptToEdit(receipt); setReceiptModalOpen(true); }, []);
  const handleCloseReceiptModal = useCallback(() => { setReceiptModalOpen(false); setReceiptToEdit(undefined); }, []);
  
  const generateReceiptNumber = () => `REC-${Math.floor(Date.now() / 1000) % 100000}`;

  const handleSaveReceipt = useCallback((receiptData: Omit<Receipt, 'id'> & { id?: string }) => {
    if (receiptData.id) {
      setReceipts(prev => prev.map(rec => rec.id === receiptData.id ? receiptData as Receipt : rec));
    } else {
      const newReceipt: Receipt = { ...receiptData, id: `id-${Date.now()}` };
      setReceipts(prev => [newReceipt, ...prev]);
    }
    handleCloseReceiptModal();
  }, [handleCloseReceiptModal]);
  
  const handleAiReceiptCreation = useCallback((receiptData: Partial<Receipt>) => {
      const newReceipt: Receipt = {
          id: `id-${Date.now()}`,
          receiptNumber: generateReceiptNumber(),
          devoteeName: 'Unknown',
          offeringDate: new Date().toISOString().split('T')[0],
          items: [],
          status: ReceiptStatus.Draft,
          ...receiptData,
      };
      setReceipts(prev => [newReceipt, ...prev]);
  }, []);

  const handleDeleteReceipt = useCallback((id: string) => { 
    if (window.confirm('Are you sure you want to delete this receipt?')) {
        setReceipts(prev => prev.filter(rec => rec.id !== id));
    }
  }, []);

  const renderView = () => {
    switch(currentView) {
      case 'temple_overview': return <TempleOverview receipts={receipts} />;
      case 'receipts': return <ReceiptView receipts={receipts} onNew={handleOpenCreateReceiptModal} onEdit={handleOpenEditReceiptModal} onDelete={handleDeleteReceipt} />;
      default: return <TempleOverview receipts={receipts} />;
    }
  };
  const currentViewTitle = currentView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="relative min-h-screen md:flex bg-background font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsSidebarOpen(true)} title={currentViewTitle} />
        <div className="flex-grow">{renderView()}</div>
      </main>
      
      {isReceiptModalOpen && (
        <Modal onClose={handleCloseReceiptModal}>
          <ReceiptForm initialData={receiptToEdit} onSave={handleSaveReceipt} onClose={handleCloseReceiptModal} generateReceiptNumber={generateReceiptNumber} />
        </Modal>
      )}
      
      <Chatbox receipts={receipts} onReceiptCreate={handleAiReceiptCreation} onOpenManualForm={handleOpenCreateReceiptModal} />
    </div>
  );
};

// ====================================================================================
// RENDER APP
// ====================================================================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);