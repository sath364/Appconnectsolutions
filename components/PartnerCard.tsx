import React from 'react';
import { Priest } from '../types';
import { EditIcon, DeleteIcon } from './Icons';

interface PriestCardProps {
    priest: Priest;
    onEdit: (priest: Priest) => void;
    onDelete: (id: string) => void;
}

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    value ? <p className="text-sm"><span className="font-semibold text-text-secondary">{label}:</span> {value}</p> : null
);

const PriestCard: React.FC<PriestCardProps> = ({ priest, onEdit, onDelete }) => {
    return (
        <div className="bg-card rounded-lg shadow-md border border-border-color p-6 flex flex-col justify-between space-y-4">
            <div>
                <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-text-primary mb-1">{priest.name}</h2>
                    <div className="flex space-x-2">
                        <button onClick={() => onEdit(priest)} className="text-gray-400 hover:text-primary"><EditIcon /></button>
                        <button onClick={() => onDelete(priest.id)} className="text-gray-400 hover:text-danger"><DeleteIcon /></button>
                    </div>
                </div>
                 <p className="text-sm font-semibold text-primary mb-4">{priest.role}</p>
                <div className="space-y-2 text-text-primary">
                    <DetailItem label="Specialty" value={priest.specialty} />
                    <DetailItem label="Email" value={priest.contactEmail} />
                    <DetailItem label="Phone" value={priest.contactPhone} />
                </div>
            </div>
            <div className="text-xs text-text-secondary text-right pt-4 border-t border-border-color">
                Joined: {new Date(priest.joinedDate).toLocaleDateString()}
            </div>
        </div>
    );
};

export default PriestCard;
