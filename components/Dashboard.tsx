
import React from 'react';
import { Receipt } from '../types';
import DashboardCard from './DashboardCard';
import { ChartUp, Rupee, InvoiceIcon } from './Icons';

interface TempleOverviewProps {
    receipts: Receipt[];
}

const TempleOverview: React.FC<TempleOverviewProps> = ({ receipts }) => {
    const totalDonationAmount = receipts.reduce((sum, rec) => sum + rec.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);
    const poojaCount = receipts.length;
    const averageDonation = poojaCount > 0 ? totalDonationAmount / poojaCount : 0;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-text-primary mb-6">கோவில் மேலோட்டம்</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="மொத்த காணிக்கை"
                    value={`₹${totalDonationAmount.toLocaleString('en-IN')}`}
                    icon={<ChartUp />}
                    trend="up"
                />
                <DashboardCard
                    title="மொத்த ரசீதுகள்"
                    value={poojaCount.toString()}
                    icon={<InvoiceIcon />}
                />
                <DashboardCard
                    title="சராசரி காணிக்கை"
                    value={`₹${averageDonation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<Rupee />}
                />
            </div>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">சமீபத்திய ரசீதுகள்</h2>
                <div className="bg-card rounded-lg shadow-md border border-border-color overflow-hidden">
                    <ul className="divide-y divide-border-color">
                        {receipts.slice(0, 5).map(receipt => (
                            <li key={receipt.id} className="p-4 flex justify-between items-center hover:bg-yellow-50 transition-colors">
                                <div>
                                    <p className="font-semibold text-text-primary">{receipt.devoteeName}</p>
                                    <p className="text-sm text-text-secondary">{receipt.receiptNumber} - {new Date(receipt.offeringDate).toLocaleDateString('en-GB')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-text-primary">
                                        ₹{receipt.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                                    </p>
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

export default TempleOverview;
