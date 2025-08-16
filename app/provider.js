'use client';

import { useUser } from '@clerk/nextjs';
import React, { useEffect, createContext, useContext, useState } from 'react';
import { ChatProvider } from './contexts/ChatContext';

// Create a context for the user
const UserContext = createContext(null);

// Custom hook to use the user context
export const useUserContext = () => useContext(UserContext);

function Provider({ children }) {
    const { user } = useUser();
    const [dbUser, setDbUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isNewUser = async () => {
        if (!user) return;
        const response = await fetch('/api/public/is-new-user', {
            method: 'POST',
            body: JSON.stringify({ email: user.primaryEmailAddress?.emailAddress }),
        });
        const data = await response.json();
        setDbUser(data.user);
    };

    useEffect(() => {
        user && isNewUser();
    }, [user]);

    return (
        <UserContext.Provider value={{ user, dbUser }}>
            <ChatProvider>{children}</ChatProvider>
        </UserContext.Provider>
    );
}

export default Provider;
