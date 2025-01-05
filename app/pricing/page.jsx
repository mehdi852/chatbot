'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Pricing from '../components/Pricing';
import { useEffect } from 'react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-background">
            {/* Pricing Table */}
            <section className="py-12 px-4 md:px-6 ">
                <div className="max-w-7xl mx-auto">
                    <Pricing />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 md:px-6 bg-white dark:bg-background">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 dark:text-foreground">Frequently Asked Questions</h2>
                    <div className="space-y-8">
                        {[
                            {
                                question: 'Can I change my plan later?',
                                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
                            },
                            {
                                question: 'What payment methods do you accept?',
                                answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
                            },
                            {
                                question: 'Is there a free trial available?',
                                answer: 'Yes, all plans come with a 14-day free trial. No credit card required.',
                            },
                            {
                                question: 'What happens after my trial ends?',
                                answer: 'After your trial ends, youll be prompted to choose a plan that best fits your needs. Your data will be preserved.',
                            },
                        ].map((faq) => (
                            <div key={faq.question} className="border-b border-gray-200 dark:border-gray-700 pb-8">
                                <h3 className="text-xl font-semibold mb-4 dark:text-foreground">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 md:px-6 bg-pink-500 dark:bg-pink-600">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
                    <p className="mb-8 text-lg">Join thousands of teams already using YowManage to improve their productivity</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="bg-white text-pink-500 dark:bg-gray-900 dark:text-pink-400 py-3 px-8 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Start Free Trial
                        </Link>
                        <Link
                            href="/contact"
                            className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-lg font-medium hover:bg-white hover:text-pink-500 dark:hover:bg-gray-900 dark:hover:text-pink-400 transition-colors">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
