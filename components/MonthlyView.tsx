
import React from 'react';
import { Receipt, ReceiptStatus } from '../types';
import { PdfIcon } from './Icons';
import { generateReceiptPdf } from '../services/pdfService';

interface MonthlyViewProps {
    month: string;
    receipts: Receipt[];
}

const statusStyles: { [key in ReceiptStatus]: { bg: string; text: string; } } = {
    [ReceiptStatus.Completed]: { bg: 'bg-success-light', text: 'text-success' },
    [ReceiptStatus.Scheduled]: { bg: 'bg-warning-light', text: 'text-warning' },
    [ReceiptStatus.Draft]: { bg: 'bg-gray-100', text: 'text-gray-500' },
};


const MonthlyView: React.FC<MonthlyViewProps> = ({ month, receipts }) => {
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Receipts for {month}</h1>
            </div>

            {/* Cards for Mobile */}
            <div className="md:hidden space-y-4">
                 {receipts.length > 0 ? receipts.map(receipt => {
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
                             <p className="text-sm text-text-secondary">Date: {receipt.offeringDate}</p>
                            <div className="flex justify-between items-center border-t border-border-color pt-3 mt-3">
                                <p className="font-bold text-lg text-text-primary">₹{total.toLocaleString('en-IN')}</p>
                                <button 
                                    onClick={() => generateReceiptPdf(receipt)} 
                                    className="p-2 text-gray-500 hover:text-primary" 
                                    aria-label={`Download PDF for receipt ${receipt.receiptNumber}`}>
                                        <PdfIcon />
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center p-8 text-text-secondary">
                        No receipts found for {month}.
                    </div>
                )}
            </div>
            
            {/* Table for Desktop */}
            <div className="hidden md:block bg-card rounded-lg shadow-md border border-border-color overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-yellow-50 border-b border-border-color">
                        <tr>
                            {['Receipt Number', 'Devotee Name', 'Offering Date', 'Total', 'Status', 'Download'].map(header => (
                                <th key={header} className="p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {receipts.length > 0 ? receipts.map(receipt => {
                            const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                            const statusStyle = statusStyles[receipt.status];
                            
                            return (
                                <tr key={receipt.id} className="border-b border-border-color last:border-0 hover:bg-yellow-50">
                                    <td className="p-4 whitespace-nowrap font-medium">{receipt.receiptNumber}</td>
                                    <td className="p-4 whitespace-nowrap">{receipt.devoteeName}</td>
                                    <td className="p-4 whitespace-nowrap">{receipt.offeringDate}</td>
                                    <td className="p-4 whitespace-nowrap">₹{total.toLocaleString('en-IN')}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                            {receipt.status}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => generateReceiptPdf(receipt)} 
                                            className="p-2 text-gray-500 hover:text-primary" 
                                            aria-label={`Download PDF for receipt ${receipt.receiptNumber}`}>
                                                <PdfIcon />
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-text-secondary">
                                    No receipts found for {month}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyView;
