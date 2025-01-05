'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent } from '@/components/ui/dialog';

import { User, CreditCard, Trash2 } from 'lucide-react';
import UserEditorProfile from './UserEditorProfile';
import UserEditorBilling from './UserEditorBilling';

export default function UserEditor({ getTotalUsers, user, onClose, refetchUsers }) {
    const [activeSection, setActiveSection] = useState('profile');

    const menuItems = [
        { icon: User, label: 'User Profile', key: 'profile' },
        { icon: CreditCard, label: 'Billing', key: 'billing' },
        { icon: Trash2, label: 'Delete Account', key: 'delete-account' },
    ];

    const handleUpdateSuccess = () => {
        getTotalUsers();
        refetchUsers();
        onClose();
    };

    return (
        <DialogContent className="min-w-[1000px] max-h-[900px] p-0 overflow-hidden">
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                <aside className="w-64 bg-white p-4 shadow-md">
                    <nav>
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.key}>
                                    <Button 
                                        variant="ghost" 
                                        className={`w-full justify-start text-sm ${activeSection === item.key ? 'bg-gray-100' : ''} ${item.key === 'delete-account' ? 'text-red-500' : ''}`} 
                                        onClick={() => setActiveSection(item.key)}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main className="flex-1 p-8 overflow-y-auto">
                    {activeSection === 'profile' && (
                        <UserEditorProfile 
                            getTotalUsers={getTotalUsers} 
                            user={user} 
                            onUpdateSuccess={handleUpdateSuccess}
                        />
                    )}
                    {activeSection === 'billing' && (
                        <UserEditorBilling 
                            getTotalUsers={getTotalUsers} 
                            user={user} 
                            onUpdateSuccess={handleUpdateSuccess}
                        />
                    )}
                    {activeSection === 'delete-account' && <div>Delete Account</div>}
                </main>
            </div>
        </DialogContent>
    );
}
