'use client';

import { Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Pricing from '../components/Pricing';
import { useEffect, useState } from 'react';

export default function PricingPage() {
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-background">
            {/* Pricing Table */}
            <section className="py-12 px-4 md:px-6 ">
                <div className="max-w-7xl mx-auto">
                    <Pricing />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 md:px-6 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-foreground">Frequently Asked Questions</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">Get answers to common questions about our pricing and features</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                question: 'Can I change my plan later?',
                                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. We make it easy to scale with your business needs.',
                            },
                            {
                                question: 'What payment methods do you accept?',
                                answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.',
                            },
                            {
                                question: 'How secure is my data?',
                                answer: 'We take data security very seriously. All data is encrypted in transit and at rest, with regular backups and enterprise-grade security measures to protect your information.',
                            },
                            {
                                question: 'What kind of support do you offer?',
                                answer: 'We provide comprehensive support including email support, detailed documentation, video tutorials, and priority support for higher-tier plans.',
                            },
                            {
                                question: 'Can I cancel my subscription anytime?',
                                answer: 'Absolutely! You can cancel your subscription at any time from your account settings. You will continue to have access until the end of your current billing period.',
                            },
                            {
                                question: 'Do you offer custom enterprise solutions?',
                                answer: 'Yes, we offer custom enterprise solutions with dedicated support, custom integrations, and tailored features. Contact our sales team to discuss your specific requirements.',
                            },
                        ].map((faq, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">{faq.question}</h3>
                                    <ChevronDown 
                                        className={`flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                                            openFAQ === index ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="px-6 pb-5">
                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Still have questions?</p>
                        <Link 
                            href="/contact" 
                            className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            Contact Support
                        </Link>
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
                            href="/dashboard"
                            className="bg-white text-pink-500 dark:bg-gray-900 dark:text-pink-400 py-3 px-8 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Start Now
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
