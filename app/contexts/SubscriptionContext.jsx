'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for development/preview purposes
  const mockSubscriptions = [
    {
      id: 'free-plan',
      name: 'Free',
      description: 'Perfect for getting started with popup management',
      price: 0,
      yearlyPrice: 0,
      features: [
        'Up to 1,000 monthly views',
        '3 popup templates',
        'Basic analytics',
        'Email support',
        'Mobile responsive popups'
      ],
      stripeMonthlyLink: '#',
      stripeYearlyLink: '#'
    },
    {
      id: 'pro-plan',
      name: 'Pro',
      description: 'Best for growing businesses and marketing teams',
      price: 29,
      yearlyPrice: 290,
      features: [
        'Up to 50,000 monthly views',
        'Unlimited popup templates',
        'Advanced targeting & triggers',
        'A/B testing capabilities',
        'Real-time analytics dashboard',
        'Priority email support',
        'Custom CSS & JavaScript',
        'Exit-intent technology',
        'Mobile & desktop optimization'
      ],
      stripeMonthlyLink: '#',
      stripeYearlyLink: '#'
    },
    {
      id: 'enterprise-plan',
      name: 'Enterprise',
      description: 'Advanced features for large teams and enterprises',
      price: 99,
      yearlyPrice: 990,
      features: [
        'Unlimited monthly views',
        'White-label solution',
        'Advanced integrations (Salesforce, HubSpot)',
        'Custom webhook support',
        'Multi-user team management',
        'Advanced reporting & exports',
        'Dedicated account manager',
        '24/7 phone & chat support',
        'Custom onboarding & training',
        'SLA guarantee',
        'API access'
      ],
      stripeMonthlyLink: '#',
      stripeYearlyLink: '#'
    }
  ];

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/subscriptions');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Successfully loaded real pricing data from database:', data);
          setSubscriptions(data);
        } else {
          console.log('API returned empty data, using mock data as fallback');
          setSubscriptions(mockSubscriptions);
        }
        setError(null);
      } catch (error) {
        console.log('API unavailable, using mock data as fallback:', error.message);
        // Use mock data when API fails instead of showing error
        setSubscriptions(mockSubscriptions);
        setError(null); // Clear error since we're showing mock data
      } finally {
        setLoading(false);
      }
    };

    // Try real API first, fallback to mock data if needed
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