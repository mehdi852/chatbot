'use client';

import { useState } from 'react';
import { PhoneCall, Clock, MapPin, Loader2 } from 'lucide-react';

export default function ContactForm({ onSubmit, isSignedIn, initialEmail = '', initialName = '' }) {
    const [formData, setFormData] = useState({
        name: initialName,
        email: initialEmail,
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                subject: formData.message,
            });
            // Clear form on success
            if (!isSignedIn) {
                setFormData((prev) => ({
                    ...prev,
                    name: '',
                    email: '',
                    message: '',
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    message: '',
                }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <PhoneCall className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 ml-3">Contact Details</h3>
                    </div>
                    <p className="text-gray-600">
                        Phone: +1 (555) 123-4567
                        <br />
                        Email: support@example.com
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 ml-3">Business Hours</h3>
                    </div>
                    <p className="text-gray-600">
                        Monday - Friday: 9AM - 6PM
                        <br />
                        Weekend: 10AM - 4PM
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 ml-3">Office Location</h3>
                    </div>
                    <p className="text-gray-600">
                        123 Business Street
                        <br />
                        San Francisco, CA 94105
                    </p>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInput}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                placeholder="Your name"
                                disabled={isSignedIn || isSubmitting}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInput}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                placeholder="you@example.com"
                                disabled={isSignedIn || isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Message *
                        </label>
                        <textarea
                            name="message"
                            id="message"
                            rows="6"
                            value={formData.message}
                            onChange={handleInput}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="How can we help you? Please provide as much detail as possible."
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Message'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
