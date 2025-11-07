
import React, { useState, useMemo } from 'react';
import { DashboardIcon, InvoiceIcon, GstIcon, UserIcon, DataIcon, LogoutIcon, StaffIcon, HistoryIcon, ChevronDownIcon, CalendarIcon, TempleIcon, CloseIcon } from './Icons';
import { Receipt } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  receipts: Receipt[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, receipts, isOpen, setIsOpen }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMonthlyOpen, setIsMonthlyOpen] = useState(false);

  const navItems = [
    { id: 'temple_overview', label: 'Temple Overview', icon: <DashboardIcon /> },
    { id: 'priests_sevadars', label: 'Priests & Sevadars', icon: <StaffIcon /> },
    { id: 'receipts', label: 'Archana Receipts', icon: <InvoiceIcon /> },
    { id: 'festival_funds', label: 'Festival Funds', icon: <GstIcon /> },
    { id: 'committee_members', label: 'Committee Members', icon: <UserIcon /> },
    { id: 'temple_records', label: 'Temple Records', icon: <DataIcon /> },
  ];
  
  const receiptYears = useMemo(() => {
    const years = new Set(receipts.map(rec => new Date(rec.offeringDate).getFullYear().toString()));
    return Array.from(years).sort((a: string, b: string) => parseInt(b) - parseInt(a));
  }, [receipts]);

  const receiptMonths = useMemo(() => {
    const months = new Set<string>();
    receipts.forEach(rec => {
        const date = new Date(rec.offeringDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        months.add(`${year}-${month}`);
    });
    return Array.from(months).sort().reverse();
  }, [receipts]);


  const NavLink: React.FC<{item: any, isSubItem?: boolean}> = ({ item, isSubItem = false }) => {
    const isActive = currentView === item.id;
    return (
      <li key={item.id}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(item.id);
          }}
          className={`flex items-center space-x-3 py-3 rounded-lg transition-colors duration-200 ${
            isSubItem ? 'px-8' : 'px-4'
          } ${
            isActive
              ? 'bg-primary text-white font-semibold shadow-md'
              : 'text-text-secondary hover:bg-yellow-50 hover:text-text-primary'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      </li>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-border-color flex flex-col transform transition-transform z-40 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-border-color">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <TempleIcon />
            </div>
            <span className="font-bold text-lg text-text-primary">Arulmigu A.P. Kovil</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-text-secondary">
            <CloseIcon />
          </button>
        </div>
        <div className="p-4 border-b border-border-color">
          <p className="text-sm text-text-primary font-semibold">contact@ap-kovil.org</p>
        </div>
        <nav className="flex-grow p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => <NavLink key={item.id} item={item} />)}
            <li>
                <button
                  onClick={() => setIsMonthlyOpen(!isMonthlyOpen)}
                  className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-yellow-50 hover:text-text-primary`}
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon />
                    <span>Monthly</span>
                  </div>
                  <ChevronDownIcon className={`transform transition-transform duration-200 ${isMonthlyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMonthlyOpen && (
                  <ul className="pt-2 space-y-1">
                    {receiptMonths.map(monthStr => {
                      const [year, month] = monthStr.split('-');
                      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
                      const monthName = monthDate.toLocaleString('default', { month: 'long' });
                      return (
                          <NavLink 
                          key={monthStr} 
                          item={{ id: `monthly_${year}_${parseInt(month) - 1}`, label: `${monthName} ${year}`, icon: <span className="w-6 text-center text-xs font-semibold">{monthName.substring(0,1)}</span> }}
                          isSubItem 
                          />
                      )
                    })}
                  </ul>
                )}
            </li>
            <li>
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-yellow-50 hover:text-text-primary`}
                >
                  <div className="flex items-center space-x-3">
                    <HistoryIcon />
                    <span>History</span>
                  </div>
                  <ChevronDownIcon className={`transform transition-transform duration-200 ${isHistoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {isHistoryOpen && (
                  <ul className="pt-2 space-y-1">
                    {receiptYears.map(year => (
                      <NavLink 
                        key={year} 
                        item={{ id: `history_${year}`, label: year, icon: <span className="w-6 text-center text-xs font-semibold">{year.slice(-2)}</span> }}
                        isSubItem 
                      />
                    ))}
                  </ul>
                )}
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-border-color">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-yellow-50 hover:text-text-primary"
          >
            <LogoutIcon />
            <span>Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;