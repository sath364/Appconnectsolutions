
import React, { useState } from 'react';
import { Receipt, ReceiptStatus } from '../types';
import { PdfIcon, DeleteIcon, Rupee, ViewIcon, WhatsAppIcon } from './Icons';
import { generateReceiptPdf } from '../services/pdfService';
import { sendWhatsAppMessage } from '../services/notificationService';

interface ReceiptViewProps {
    receipts: Receipt[];
    onNew: () => void;
    onEdit: (receipt: Receipt) => void;
    onDelete: (id: string) => void;
}

const statusStyles: { [key in ReceiptStatus]: { bg: string; text: string; } } = {
    [ReceiptStatus.Completed]: { bg: 'bg-success-light', text: 'text-success' },
    [ReceiptStatus.Scheduled]: { bg: 'bg-warning-light', text: 'text-warning' },
    [ReceiptStatus.Draft]: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const ReceiptView: React.FC<ReceiptViewProps> = ({ receipts, onNew, onEdit, onDelete }) => {
    const [filterStatus, setFilterStatus] = useState<ReceiptStatus | 'All'>('All');

    const filterOptions: (ReceiptStatus | 'All')[] = ['All', ReceiptStatus.Draft, ReceiptStatus.Completed, ReceiptStatus.Scheduled];

    const filteredReceipts = receipts.filter(receipt => {
        if (filterStatus === 'All') return true;
        return receipt.status === filterStatus;
    });

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-text-primary">Archana & Donation Receipts</h1>
                <button
                    onClick={onNew}
                    className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>New Receipt</span>
                </button>
            </div>
             <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                <span className="text-sm font-medium text-text-secondary flex-shrink-0">Filter by status:</span>
                {filterOptions.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors flex-shrink-0 ${
                            filterStatus === status 
                            ? 'bg-primary text-white font-semibold' 
                            : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Cards for Mobile */}
            <div className="md:hidden space-y-4">
                {filteredReceipts.map(receipt => {
                    const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                    const description = receipt.items.map(i => i.description).join(', ');
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
                            <div className="space-y-1">
                                <p className="text-sm text-text-secondary">{description}</p>
                                <p className="text-sm text-text-secondary">Date: {receipt.offeringDate}</p>
                            </div>
                            <div className="flex justify-between items-center border-t border-border-color pt-3 mt-3">
                                <p className="font-bold text-lg text-text-primary">₹{total.toLocaleString('en-IN')}</p>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => onEdit(receipt)} className="p-2 text-gray-500 hover:text-primary" aria-label="View Receipt"><ViewIcon /></button>
                                    <button onClick={() => generateReceiptPdf(receipt)} className="p-2 text-gray-500 hover:text-primary" aria-label="Download PDF"><PdfIcon /></button>
                                    {receipt.mobileNumber && (
                                        <button 
                                            onClick={() => sendWhatsAppMessage(receipt.mobileNumber!, receipt)} 
                                            className="p-2 text-gray-500 hover:text-success" 
                                            aria-label="Send WhatsApp Confirmation">
                                            <WhatsAppIcon />
                                        </button>
                                    )}
                                    <button onClick={() => onDelete(receipt.id)} className="p-2 text-gray-500 hover:text-danger" aria-label="Delete Receipt"><DeleteIcon /></button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Table for Desktop */}
            <div className="hidden md:block bg-card rounded-lg shadow-md border border-border-color overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-yellow-50 border-b border-border-color">
                        <tr>
                            {['Receipt No.', 'Devotee Name', 'Offering Date', 'Pooja/Donation', 'Amount', 'Status', 'Actions'].map(header => (
                                <th key={header} className="p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map(receipt => {
                            const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                            const description = receipt.items.map(i => i.description).join(', ');
                            const statusStyle = statusStyles[receipt.status];
                            
                            return (
                                <tr key={receipt.id} className="border-b border-border-color last:border-0 hover:bg-yellow-50">
                                    <td className="p-4 whitespace-nowrap font-medium">{receipt.receiptNumber}</td>
                                    <td className="p-4 whitespace-nowrap">{receipt.devoteeName}</td>
                                    <td className="p-4 whitespace-nowrap">{receipt.offeringDate}</td>
                                    <td className="p-4 whitespace-nowrap">{description}</td>
                                    <td className="p-4 whitespace-nowrap font-semibold">₹{total.toLocaleString('en-IN')}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                            {receipt.status}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => onEdit(receipt)} className="p-2 text-gray-500 hover:text-primary" aria-label="View Receipt"><ViewIcon /></button>
                                            <button onClick={() => generateReceiptPdf(receipt)} className="p-2 text-gray-500 hover:text-primary" aria-label="Download PDF"><PdfIcon /></button>
                                            {receipt.mobileNumber && (
                                                <button 
                                                    onClick={() => sendWhatsAppMessage(receipt.mobileNumber!, receipt)} 
                                                    className="p-2 text-gray-500 hover:text-success" 
                                                    aria-label="Send WhatsApp Confirmation">
                                                    <WhatsAppIcon />
                                                </button>
                                            )}
                                            <button onClick={() => onDelete(receipt.id)} className="p-2 text-gray-500 hover:text-danger" aria-label="Delete Receipt"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReceiptView;
