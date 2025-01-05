'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/subscriptions');
    
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSubscriptions(data);
        } else {
          console.error('Unexpected data format:', data);
          setError('Received invalid data format');
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscriptions, 
        loading, 
        error,
        billingCycle, 
        setBillingCycle 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscriptions = () => useContext(SubscriptionContext); 