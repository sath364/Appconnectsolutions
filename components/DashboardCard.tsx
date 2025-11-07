import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend }) => {
    const trendColor = trend === 'up' ? 'text-success' : 'text-danger';
    
    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border-color">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-text-secondary font-medium">{title}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-full ${trend === 'up' ? 'bg-success-light' : trend === 'down' ? 'bg-danger-light' : 'bg-gray-100'}`}>
                    <span className={trend ? trendColor : 'text-text-secondary'}>
                        {icon}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
