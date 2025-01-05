import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useUserContext } from '@/app/provider';
import Link from 'next/link';

export function Plans({ open, onOpenChange }) {
    const [plans, setPlans] = useState([]);
    const { user } = useUserContext();
    const [isYearly, setIsYearly] = useState(false);

    useEffect(() => {
        async function fetchPlans() {
            try {
                const response = await fetch('/api/subscriptions');
                if (!response.ok) {
                    throw new Error('Failed to fetch plans');
                }
                const data = await response.json();
                setPlans(data);
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        }

        if (open) {
            fetchPlans();
        }
    }, [open]);

    const getStripeUrl = (plan) => {
        if (user && user.primaryEmailAddress) {
            const email = encodeURIComponent(user.primaryEmailAddress.emailAddress);
            const link = isYearly ? plan.stripeYearlyLink : plan.stripeMonthlyLink;
            return `${link}?prefilled_email=${email}`;
        }
        return isYearly ? plan.stripeYearlyLink : plan.stripeMonthlyLink;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] p-0">
                <div className="p-6 md:p-10">
                    <DialogHeader>
                        <div className="text-center">
                            <p className="text-pink-500 font-medium mb-4">Pricing</p>
                            <DialogTitle className="text-3xl md:text-5xl font-bold mb-4">
                                Flexible plans for every team
                            </DialogTitle>
                            <DialogDescription className="text-base text-gray-600 max-w-2xl mx-auto">
                                Choose the plan that best fits your team's needs. Whether you're just getting started or managing
                                large projects, YowManage offers affordable solutions to help you stay organized and productive
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Billing Toggle */}
                    <div className="flex justify-center items-center space-x-4 my-8">
                        <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#c1e052]"
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                    isYearly ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                        <div className="flex items-center">
                            <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                Annually
                            </span>
                            <span className="ml-2 inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-500">
                                20% off
                            </span>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-2xl p-8 border ${
                                    plan.name === 'Pro' ? 'border-purple-600 shadow-lg' : 'border-gray-200'
                                } flex flex-col`}
                            >
                                <div>
                                    <div className="mb-4">
                                        {plan.name === 'Starter' && <span className="text-2xl">🚀</span>}
                                        {plan.name === 'Pro' && <span className="text-2xl">🛸</span>}
                                        {plan.name === 'Enterprise' && <span className="text-2xl">💼</span>}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-bold">
                                            {plan.name === 'Starter' ? 'FREE' : 
                                             `$${isYearly ? plan.yearlyPrice : plan.price}`}
                                        </span>
                                        {plan.name !== 'Starter' && (
                                            <span className="text-gray-500 ml-1">{isYearly ? '/year' : '/month'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature) => (
                                            <li key={feature.id} className="flex items-start">
                                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-gray-600">{feature.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {user?.subscriptionStatus === 'active' ? (
                                    <Link
                                        href="https://billing.stripe.com/p/login/test_8wMg2ldLmbzk23eaEE"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-3 px-4 rounded-md text-center font-medium transition-colors
                                            ${plan.name === 'Pro' 
                                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                    >
                                        Manage Subscription
                                    </Link>
                                ) : (
                                    <Link
                                        href={getStripeUrl(plan)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-3 px-4 rounded-md text-center font-medium transition-colors
                                            ${plan.name === 'Pro' 
                                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                    >
                                        {plan.name === 'Pro' ? 'Upgrade Now' : plan.name === 'Starter' ? 'Get Started' : 'Contact Us'}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="flex flex-col items-center mt-8">
                        <p className="text-sm text-center text-gray-500 mb-4">
                            All plans include a 30-day money-back guarantee. No long-term contracts. Cancel anytime.
                        </p>

                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
