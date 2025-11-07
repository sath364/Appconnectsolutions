

import React from 'react';
import { Priest } from '../types';
import PriestCard from './PartnerCard';

interface PriestViewProps {
    priests: Priest[];
    onNew: () => void;
    onEdit: (priest: Priest) => void;
    onDelete: (id: string) => void;
}

const PriestView: React.FC<PriestViewProps> = ({ priests, onNew, onEdit, onDelete }) => {
    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-text-primary">Priests & Sevadars</h1>
                <button
                    onClick={onNew}
                    className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add New Person</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {priests.map(priest => (
                    <PriestCard key={priest.id} priest={priest} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
};

export default PriestView;
