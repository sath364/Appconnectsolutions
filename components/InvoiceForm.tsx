
import React, { useState, useEffect, useMemo } from 'react';
import { Receipt, OfferingItem, ReceiptStatus } from '../types';

interface ReceiptFormProps {
  initialData?: Receipt;
  onSave: (receipt: Omit<Receipt, 'id'> & { id?: string }) => void;
  onClose: () => void;
  generateReceiptNumber: () => string;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ initialData, onSave, onClose, generateReceiptNumber }) => {
  const [formData, setFormData] = useState<Omit<Receipt, 'id'>>(
    initialData || {
      receiptNumber: '',
      devoteeName: '',
      offeringDate: new Date().toISOString().split('T')[0],
      items: [{ id: `new-${Date.now()}`, description: 'அர்ச்சனை', amount: 0 }],
      status: ReceiptStatus.Completed,
      notes: '',
      mobileNumber: '',
      poojaType: 'அர்ச்சனை',
    }
  );

  useEffect(() => {
    if (initialData) {
      const items = initialData.items.length > 0 ? initialData.items : [{ id: `new-${Date.now()}`, description: '', amount: 0 }];
      setFormData({ ...initialData, items });
    } else {
        setFormData(prev => ({ ...prev, receiptNumber: generateReceiptNumber() }));
    }
  }, [initialData, generateReceiptNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount' || name === 'description') {
        const newItems = [...formData.items];
        (newItems[0] as any)[name] = name === 'amount' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, items: newItems }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id });
  };
  
  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  }, [formData.items]);
  
  const currentItem: OfferingItem = formData.items[0] || { id: '', description: '', amount: 0 };

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-8 text-text-primary bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">{initialData ? 'ரசீதை திருத்து' : 'புதிய ரசீது உருவாக்கு'}</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-black text-3xl">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ரசீது எண் *</label>
            <input type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">பக்தர் பெயர் *</label>
            <input type="text" name="devoteeName" value={formData.devoteeName} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">மொபைல் எண்</label>
            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md" placeholder="உறுதிப்படுத்தல் செய்தி அனுப்ப" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">காணிக்கை நாள் *</label>
            <input type="date" name="offeringDate" value={formData.offeringDate} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">பூஜை / சேவை வகை *</label>
            <select name="description" value={currentItem.description} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md">
                <option value="அர்ச்சனை">அர்ச்சனை</option>
                <option value="அபிஷேகம்">அபிஷேகம்</option>
                <option value="சிறப்பு பூஜை">சிறப்பு பூஜை</option>
                <option value="அன்னதானம் நன்கொடை">அன்னதானம் நன்கொடை</option>
                <option value="பொது நன்கொடை">பொது நன்கொடை</option>
                <option value="சிவராத்திரி நன்கொடை">சிவராத்திரி நன்கொடை</option>
                <option value="பூக்குழி நன்கொடை">பூக்குழி நன்கொடை</option>
                <option value="கும்பாபிஷேக நன்கொடை">கும்பாபிஷேக நன்கொடை</option>
                <option value="வருடாந்திர நன்கொடை">வருடாந்திர நன்கொடை</option>
                <option value="கட்டுமான நன்கொடை">கட்டுமான நன்கொடை</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">தொகை (₹) *</label>
            <input type="number" name="amount" value={currentItem.amount || 0} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md" min="0" required />
        </div>
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">குறிப்புகள்</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md" rows={3} placeholder="உதாரணம்: பெயர், நட்சத்திரம், கோத்திரம்"></textarea>
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">நிலை *</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 p-2 rounded-md">
                {Object.values(ReceiptStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-border-color text-right">
        <p className="text-xl font-bold">மொத்த தொகை: <span className="font-bold">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition">ரத்து செய்</button>
        <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition">{initialData ? 'ரசீதை புதுப்பி' : 'ரசீதை உருவாக்கு'}</button>
      </div>
    </form>
  );
};

export default ReceiptForm;
