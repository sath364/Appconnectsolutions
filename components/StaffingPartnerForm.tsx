
import React, { useState, useEffect } from 'react';
import { Priest } from '../types';

interface PriestFormProps {
    initialData?: Priest;
    onSave: (priest: Omit<Priest, 'id' | 'joinedDate'> & { id?: string }) => void;
    onClose: () => void;
}

const PriestForm: React.FC<PriestFormProps> = ({ initialData, onSave, onClose }) => {
    const [formData, setFormData] = useState(
        initialData || {
            name: '', role: 'Priest', specialty: '', contactPerson: '', contactEmail: '', contactPhone: '',
            addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
        }
    );

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: initialData?.id });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 md:p-8 text-text-primary bg-white">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{initialData ? 'Edit Person' : 'Add New Person'}</h2>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-black text-3xl">&times;</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField label="Name" name="name" value={formData.name} onChange={handleChange} required />
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary">
                        <option>Head Priest</option>
                        <option>Assistant Priest</option>
                        <option>Sevadar</option>
                        <option>Volunteer</option>
                        <option>Temple Staff</option>
                    </select>
                </div>
                <InputField label="Specialty / Main Duty" name="specialty" value={formData.specialty} onChange={handleChange} />
                <InputField label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
                <InputField label="Contact Email" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} />
                <InputField label="Contact Phone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
                
                <div className="md:col-span-2 mt-4 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Address Details</h3>
                </div>
                <InputField label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                <InputField label="City" name="city" value={formData.city} onChange={handleChange} required />
                <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
                <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>

            <div className="flex justify-end space-x-4 mt-8">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition">{initialData ? 'Update Record' : 'Add Record'}</button>
            </div>
        </form>
    );
};

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
        <input type={type} name={name} value={value} onChange={onChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" required={required} />
    </div>
);

export default PriestForm;
