
import React from 'react';
import { Receipt } from '../types';
import DashboardCard from './DashboardCard';
import { ChartUp, ChartDown, Rupee } from './Icons';

interface FestivalFundsProps {
    receipts: Receipt[];
}

const FestivalFunds: React.FC<FestivalFundsProps> = ({ receipts }) => {
    // Mocking festival fund data
    const totalCollection = receipts.reduce((sum, rec) => sum + rec.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0) * 0.3; // Assume 30% of donations go to festivals
    const totalExpenses = totalCollection * 0.65; // Assume 65% of collection is spent
    const netBalance = totalCollection - totalExpenses;

    const topDonors = [...receipts]
        .sort((a, b) => b.items.reduce((s, i) => s + i.amount, 0) - a.items.reduce((s, i) => s + i.amount, 0))
        .slice(0, 5);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-2xl font-bold text-text-primary">Festival Fund Tracking</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <DashboardCard 
                    title="Total Festival Collection"
                    value={`₹${totalCollection.toLocaleString('en-IN')}`}
                    icon={<ChartUp />}
                    trend="up"
                />
                 <DashboardCard 
                    title="Total Expenses"
                    value={`₹${totalExpenses.toLocaleString('en-IN')}`}
                    icon={<ChartDown />}
                    trend="down"
                />
                <DashboardCard 
                    title="Net Balance"
                    value={`₹${netBalance.toLocaleString('en-IN')}`}
                    icon={<Rupee />}
                />
            </div>

            <div className="bg-card rounded-lg shadow-md border border-border-color mt-8">
                <h2 className="text-xl font-bold text-text-primary p-6 border-b border-border-color">Top Festival Donors</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-yellow-50">
                            <tr>
                                {['Receipt Number', 'Devotee Name', 'Offering Date', 'Amount'].map(h => (
                                <th key={h} className="p-4 text-sm font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topDonors.map(receipt => {
                                const total = receipt.items.reduce((sum, item) => sum + item.amount, 0);
                                return (
                                <tr key={receipt.id} className="border-b border-border-color last:border-0 hover:bg-yellow-50">
                                    <td className="p-4 font-medium">{receipt.receiptNumber}</td>
                                    <td className="p-4">{receipt.devoteeName}</td>
                                    <td className="p-4">{receipt.offeringDate}</td>
                                    <td className="p-4 font-semibold">₹{total.toLocaleString('en-IN')}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FestivalFunds;
