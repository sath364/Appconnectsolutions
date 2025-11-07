import React, { useState, useRef, useEffect } from 'react';
import { getAiChatResponse } from '../services/geminiService';
import { Receipt, Priest } from '../types';
import { generateReceiptPdf } from '../services/pdfService';
import { sendWhatsAppMessage, sendSmsMessage } from '../services/notificationService';
import Spinner from './Spinner';
import { ChatIcon, WhatsAppIcon, SmsIcon } from './Icons';

interface ChatboxProps {
    receipts: Receipt[];
    priests: Priest[];
    onReceiptCreate: (receiptData: Partial<Receipt>) => Promise<Receipt>;
    onPriestCreate: (priestData: Partial<Priest>) => Promise<Priest>;
    onOpenManualForm: () => void;
}

type AiAction = 
    { type: 'receipt_draft', data: Partial<Receipt> } |
    { type: 'priest_draft', data: Partial<Priest> } |
    { type: 'send_confirmation', receipt: Receipt } |
    { type: 'send_sms', receipt: Receipt, mobileNumber: string, message: string };
    
type Message = {
    sender: 'user' | 'ai';
    text: string;
    action?: AiAction;
    requiresConfirmation?: boolean;
}

const Chatbox: React.FC<ChatboxProps> = ({ receipts, priests, onReceiptCreate, onPriestCreate, onOpenManualForm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([{ sender: 'ai', text: `Vanakam! How can I assist you with the temple's activities today?` }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponse = await getAiChatResponse(input, receipts, priests);
        
        const aiMessage: Message = {
            sender: 'ai',
            text: aiResponse.text,
            action: aiResponse.action,
            requiresConfirmation: !!(aiResponse.action?.type === 'receipt_draft' || aiResponse.action?.type === 'priest_draft'),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleConfirmation = async (confirmed: boolean, action?: AiAction) => {
        setMessages(prev => prev.filter(m => !m.requiresConfirmation)); // Remove confirmation buttons immediately

        if (confirmed && action) {
            let confirmationText = 'Working on it...';
            setMessages(prev => [...prev, { sender: 'ai', text: confirmationText }]);
            try {
                if (action.type === 'receipt_draft') {
                    const newReceipt = await onReceiptCreate(action.data);
                    confirmationText = `Done. Receipt ${newReceipt.receiptNumber} has been created successfully.`;
                } else if (action.type === 'priest_draft') {
                    const newPriest = await onPriestCreate(action.data);
                    confirmationText = `Excellent. "${newPriest.name}" has been added to the temple records.`;
                }
                // Replace "Working on it..." with the final confirmation
                setMessages(prev => [...prev.slice(0, -1), { sender: 'ai', text: confirmationText }]);
            } catch (error) {
                console.error("Confirmation action failed:", error);
                setMessages(prev => [...prev.slice(0, -1), { sender: 'ai', text: 'Sorry, there was an error saving the data to the database. Please try again.' }]);
            }
        } else {
             setMessages(prev => [...prev, { sender: 'ai', text: 'Of course, the request has been cancelled. How else may I assist?'}]);
        }
    }

    const handleActionClick = (action: AiAction) => {
        // Find the message with this action and remove its action part so the button disappears
        setMessages(prev => prev.map(m => m.action === action ? { ...m, action: undefined } : m));
        
        if (action.type === 'send_confirmation') {
            if (action.receipt.mobileNumber) {
                sendWhatsAppMessage(action.receipt.mobileNumber, action.receipt);
                 setMessages(prev => [...prev, { sender: 'ai', text: `I have opened WhatsApp to send the confirmation for ${action.receipt.receiptNumber}.` }]);
            } else {
                setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I could not find a valid phone number for receipt ${action.receipt.receiptNumber}.` }]);
            }
        }
        if (action.type === 'send_sms') {
            sendSmsMessage(action.mobileNumber, action.message);
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: `உங்கள் செய்தியிடல் செயலி திறக்கப்பட்டுள்ளது. செய்தியைச் சரிபார்த்து அனுப்பவும்.` 
            }]);
        }
    }
    
    const formatDataForDisplay = (action: AiAction): string => {
        if (action.type === 'receipt_draft') {
            let summary = "Please confirm the receipt details:\n";
            summary += `- Devotee: ${action.data.devoteeName}\n`;
            const total = action.data.items?.reduce((sum, item) => sum + item.amount, 0) || 0;
            action.data.items?.forEach(item => { summary += `- Offering: ${item.description}\n`; });
            summary += `- Total: ₹${total.toLocaleString('en-IN')}`;
            return summary;
        }
        if (action.type === 'priest_draft') {
            let summary = "Please confirm the new person's details:\n";
            summary += `- Name: ${action.data.name}\n`;
            summary += `- Role: ${action.data.role}\n`;
            summary += `- Phone: ${action.data.contactPhone}`;
            return summary;
        }
        return '';
    }

    const renderActionButton = (action: AiAction) => {
        switch (action.type) {
            case 'send_confirmation':
                return (
                     <button onClick={() => handleActionClick(action)} className="flex items-center space-x-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                        <WhatsAppIcon /><span>Send Confirmation</span>
                    </button>
                );
            case 'send_sms':
                return (
                    <button onClick={() => handleActionClick(action)} className="flex items-center space-x-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                        <SmsIcon /><span>Send SMS</span>
                    </button>
                );
            default:
                return null;
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover transition-transform transform hover:scale-110 z-20" aria-label="Open AI Chat"><ChatIcon /></button>
            {isOpen && (
                <div className="fixed inset-0 sm:bottom-28 sm:right-8 sm:inset-auto sm:w-96 sm:h-[32rem] bg-white rounded-none sm:rounded-lg shadow-2xl flex flex-col border border-border-color z-30">
                    <header className="p-4 bg-yellow-50 border-b border-border-color rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold text-lg text-text-primary">Kovil Assistant</h3>
                         <button onClick={() => { onOpenManualForm(); setIsOpen(false); }} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover text-sm transition-colors">New Receipt</button>
                    </header>
                    <main className="flex-grow p-4 overflow-y-auto">
                        <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'}`}>
                                    <p>{msg.text}</p>
                                    {(msg.action?.type === 'receipt_draft' || msg.action?.type === 'priest_draft') && (
                                        <div className="mt-2 p-2 border-t border-gray-300">
                                            <p className="font-semibold text-sm">Draft Details:</p>
                                            <p className="text-xs">{formatDataForDisplay(msg.action)}</p>
                                        </div>
                                    )}
                                    {msg.requiresConfirmation && (
                                        <div className="flex space-x-2 mt-3">
                                            <button onClick={() => handleConfirmation(true, msg.action)} className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-green-600">Confirm</button>
                                            <button onClick={() => handleConfirmation(false)} className="px-3 py-1 text-xs bg-danger text-white rounded hover:bg-red-600">Cancel</button>
                                        </div>
                                    )}
                                    {msg.action && (
                                        <div className="flex space-x-2 mt-3">
                                            {renderActionButton(msg.action)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-100 text-text-primary"><Spinner /></div></div>}
                        <div ref={messagesEndRef} />
                        </div>
                    </main>
                    <footer className="p-2 border-t border-border-color">
                        <div className="flex space-x-2">
                             <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for assistance..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" disabled={isLoading} />
                             <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover disabled:bg-gray-400">Send</button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default Chatbox;