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
            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInput}
                            className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
                            placeholder="Your full name"
                            disabled={isSignedIn || isSubmitting}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInput}
                            className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
                            placeholder="your@email.com"
                            disabled={isSignedIn || isSubmitting}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-foreground">
                        Message *
                    </label>
                    <textarea
                        name="message"
                        id="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleInput}
                        className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none"
                        placeholder="Tell us how we can help you. Be as detailed as possible so we can provide the best assistance."
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending Message...
                        </>
                    ) : (
                        <>
                            <span>Send Message</span>
                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
