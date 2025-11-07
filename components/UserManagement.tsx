
import React from 'react';

const users = [
    { name: 'velu.s@ap-kovil.org', role: 'President' },
    { name: 'sivakumar.p@ap-kovil.org', role: 'Treasurer' }
];

const UserManagement: React.FC = () => {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Committee Members</h1>
            <p className="text-text-secondary mb-8">Manage access for temple committee members</p>
            <div className="bg-card rounded-lg shadow-md border border-border-color max-w-4xl">
                 <h2 className="text-xl font-bold text-text-primary p-6 border-b border-border-color">All Members</h2>
                 <p className="text-text-secondary px-6 pb-6 text-sm">Manage administrative roles and permissions</p>
                 <div className="p-6 space-y-4">
                     {users.map(user => (
                         <div key={user.name} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-yellow-50 p-4 rounded-md border border-border-color gap-4">
                             <div>
                                 <p className="font-semibold text-text-primary">{user.name}</p>
                                 <p className="text-sm text-text-secondary">{user.role}</p>
                             </div>
                             <button className="bg-danger text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-800 transition-colors self-start sm:self-center">
                                 Revoke Access
                             </button>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default UserManagement;