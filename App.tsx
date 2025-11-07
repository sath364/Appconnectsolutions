
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Receipt, ReceiptStatus, Priest } from './types';
import Sidebar from './components/Sidebar';
import TempleOverview from './components/Dashboard';
import ReceiptView from './components/InvoiceView';
import FestivalFunds from './components/GstPayment';
import UserManagement from './components/UserManagement';
import HistoryView from './components/HistoryView';
import MonthlyView from './components/MonthlyView';
import ReceiptForm from './components/InvoiceForm';
import PriestView from './components/StaffingPartnerView';
import PriestForm from './components/StaffingPartnerForm';
import Modal from './components/Modal';
import Chatbox from './components/Chatbox';
import { MenuIcon } from './components/Icons';
import * as apiService from './services/apiService';

const Header: React.FC<{ onMenuClick: () => void; title: string; }> = ({ onMenuClick, title }) => {
  return (
    <header className="md:hidden bg-card p-4 border-b border-border-color flex items-center space-x-4 sticky top-0 z-10">
      <button onClick={onMenuClick} className="text-text-primary">
        <MenuIcon />
      </button>
      <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>
    </header>
  );
};

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [currentView, setCurrentView] = useState('temple_overview');
  const [loading, setLoading] = useState(true);
  
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptToEdit, setReceiptToEdit] = useState<Receipt | undefined>(undefined);
  
  const [isPriestModalOpen, setPriestModalOpen] = useState(false);
  const [priestToEdit, setPriestToEdit] = useState<Priest | undefined>(undefined);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [receiptsData, priestsData] = await Promise.all([
          apiService.getReceipts(),
          apiService.getPriests(),
        ]);
        setReceipts(receiptsData);
        setPriests(priestsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        // Here you might want to show an error message to the user
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleOpenCreateReceiptModal = useCallback(() => { setReceiptToEdit(undefined); setReceiptModalOpen(true); }, []);
  const handleOpenEditReceiptModal = useCallback((receipt: Receipt) => { setReceiptToEdit(receipt); setReceiptModalOpen(true); }, []);
  const handleCloseReceiptModal = useCallback(() => { setReceiptModalOpen(false); setReceiptToEdit(undefined); }, []);

  const handleOpenCreatePriestModal = useCallback(() => { setPriestToEdit(undefined); setPriestModalOpen(true); }, []);
  const handleOpenEditPriestModal = useCallback((priest: Priest) => { setPriestToEdit(priest); setPriestModalOpen(true); }, []);
  const handleClosePriestModal = useCallback(() => { setPriestModalOpen(false); setPriestToEdit(undefined); }, []);
  
  
  const generateReceiptNumber = () => `REC-${Math.floor(Math.random() * 90000) + 10000}`;

  const handleSaveReceipt = useCallback(async (receiptData: Omit<Receipt, 'id'> & { id?: string }) => {
    try {
      if (receiptData.id) {
        const updatedReceipt = await apiService.updateReceipt(receiptData.id, receiptData as Receipt);
        setReceipts(prev => prev.map(rec => rec.id === receiptData.id ? updatedReceipt : rec));
      } else {
        // FIX: The type assertion was incorrectly omitting 'receiptNumber', which is a required property for creating a new receipt.
        const newReceipt = await apiService.createReceipt(receiptData as Omit<Receipt, 'id'>);
        setReceipts(prev => [newReceipt, ...prev]);
      }
      handleCloseReceiptModal();
    } catch (error) {
      console.error("Failed to save receipt:", error);
      alert("Error: Could not save receipt. Please check the connection and try again.");
    }
  }, [handleCloseReceiptModal]);
  
  const handleAiReceiptCreation = useCallback(async (receiptData: Partial<Receipt>): Promise<Receipt> => {
     const newReceiptData: Omit<Receipt, 'id'> = { devoteeName: '', offeringDate: '', items: [], status: ReceiptStatus.Draft, mobileNumber: '', ...receiptData, receiptNumber: generateReceiptNumber() };
     try {
        const savedReceipt = await apiService.createReceipt(newReceiptData);
        setReceipts(prev => [savedReceipt, ...prev]);
        return savedReceipt;
     } catch(error) {
        console.error("Failed to save AI-generated receipt:", error);
        alert("Error: Could not save AI-generated receipt.");
        throw error;
     }
  }, []);

  const handleDeleteReceipt = useCallback(async (id: string) => { 
    if (window.confirm('Are you sure you want to delete this receipt?')) {
        try {
            await apiService.deleteReceipt(id);
            setReceipts(prev => prev.filter(rec => rec.id !== id));
        } catch (error) {
            console.error("Failed to delete receipt:", error);
            alert("Error: Could not delete receipt.");
        }
    }
  }, []);
  
  const handleSavePriest = useCallback(async (priestData: Omit<Priest, 'id' | 'joinedDate'> & { id?: string }) => {
      try {
        if(priestData.id) {
            const updatedPriest = await apiService.updatePriest(priestData.id, priestData as Priest);
            setPriests(prev => prev.map(p => p.id === priestData.id ? updatedPriest : p));
        } else {
            const newPriestData: Omit<Priest, 'id'|'joinedDate'> = { ...priestData };
            const newPriest = await apiService.createPriest(newPriestData);
            setPriests(prev => [newPriest, ...prev]);
        }
        handleClosePriestModal();
      } catch (error) {
          console.error("Failed to save priest:", error);
          alert("Error: Could not save priest record.");
      }
  }, [handleClosePriestModal]);
  
  const handleAiPriestCreation = useCallback(async (priestData: Partial<Priest>): Promise<Priest> => {
      const newPriestData: Omit<Priest, 'id' | 'joinedDate'> = { name: '', role: '', specialty: '', contactPerson: '', contactEmail: '', contactPhone: '', addressLine1: '', city: '', state: '', pincode: '', ...priestData };
      try {
        const savedPriest = await apiService.createPriest(newPriestData);
        setPriests(prev => [savedPriest, ...prev]);
        return savedPriest;
      } catch (error) {
        console.error("Failed to save AI-generated priest:", error);
        alert("Error: Could not save AI-generated priest record.");
        throw error;
      }
  }, []);

  const handleDeletePriest = useCallback(async (id: string) => { 
    if(window.confirm('Are you sure you want to delete this record?')) {
        try {
            await apiService.deletePriest(id);
            setPriests(prev => prev.filter(p => p.id !== id)); 
        } catch (error) {
            console.error("Failed to delete priest:", error);
            alert("Error: Could not delete priest record.");
        }
    }
  }, []);

  const currentViewTitle = useMemo(() => {
    if (currentView.startsWith('history_')) {
      const year = currentView.split('_')[1];
      return `Receipt History for ${year}`;
    }
    if (currentView.startsWith('monthly_')) {
      const [_, year, month] = currentView.split('_');
      const monthIndex = parseInt(month, 10);
      const monthName = new Date(parseInt(year), monthIndex).toLocaleString('default', { month: 'long' });
      return `Receipts for ${monthName} ${year}`;
    }
    switch(currentView) {
      case 'temple_overview': return "Temple Overview";
      case 'receipts': return "Archana & Donation Receipts";
      case 'priests_sevadars': return "Priests & Sevadars";
      case 'festival_funds': return "Festival Funds";
      case 'committee_members': return "Committee Members";
      default: return currentView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }, [currentView]);

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">Loading Temple Data...</p>
            <p className="text-text-secondary">Please wait.</p>
          </div>
        </div>
      );
    }

    if (currentView.startsWith('history_')) {
      const year = currentView.split('_')[1];
      const filtered = receipts.filter(rec => new Date(rec.offeringDate).getFullYear().toString() === year);
      return <HistoryView year={year} receipts={filtered} />;
    }
    if (currentView.startsWith('monthly_')) {
        const [_, year, month] = currentView.split('_');
        const monthIndex = parseInt(month, 10);
        const filtered = receipts.filter(rec => { const d = new Date(rec.offeringDate); return d.getFullYear().toString() === year && d.getMonth() === monthIndex; });
        const monthName = new Date(parseInt(year), monthIndex).toLocaleString('default', { month: 'long' });
        return <MonthlyView month={`${monthName} ${year}`} receipts={filtered} />;
    }
    switch(currentView) {
      case 'temple_overview': return <TempleOverview receipts={receipts} />;
      case 'receipts': return <ReceiptView receipts={receipts} onNew={handleOpenCreateReceiptModal} onEdit={handleOpenEditReceiptModal} onDelete={handleDeleteReceipt} />;
      case 'priests_sevadars': return <PriestView priests={priests} onNew={handleOpenCreatePriestModal} onEdit={handleOpenEditPriestModal} onDelete={handleDeletePriest} />;
      case 'festival_funds': return <FestivalFunds receipts={receipts} />;
      case 'committee_members': return <UserManagement />;
      default: return <div className="p-8"><h1 className="text-2xl font-bold">{currentView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1><p> இந்தப் பக்கம் உருவாக்கத்தில் உள்ளது.</p></div>;
    }
  }

  return (
    <div className="relative min-h-screen md:flex bg-background font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} 
        receipts={receipts}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsSidebarOpen(true)} title={currentViewTitle} />
        <div className="flex-grow">
          {renderView()}
        </div>
      </main>
      
      {isReceiptModalOpen && (
        <Modal onClose={handleCloseReceiptModal}>
          <ReceiptForm initialData={receiptToEdit} onSave={handleSaveReceipt} onClose={handleCloseReceiptModal} generateReceiptNumber={generateReceiptNumber} />
        </Modal>
      )}

      {isPriestModalOpen && (
          <Modal onClose={handleClosePriestModal}>
              <PriestForm initialData={priestToEdit} onSave={handleSavePriest} onClose={handleClosePriestModal} />
          </Modal>
      )}
      
      <Chatbox receipts={receipts} priests={priests} onReceiptCreate={handleAiReceiptCreation} onPriestCreate={handleAiPriestCreation} onOpenManualForm={handleOpenCreateReceiptModal} />
    </div>
  );
};

export default App;
