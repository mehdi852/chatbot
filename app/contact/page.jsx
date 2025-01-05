'use client';

import { useUser } from '@clerk/nextjs';
import ContactForm from '../components/ContactForm';

export default function ContactPage() {
    const { user, isSignedIn } = useUser();

    const handleSubmit = async (formData) => {
        try {
            const endpoint = isSignedIn ? '/api/public/user-send-message' : '/api/public/visitor-send-message';
            const payload = isSignedIn
                ? {
                      name: user.name,
                      email: user.primaryEmailAddress?.emailAddress,
                      body: formData.subject,
                  }
                : {
                      name: formData.name,
                      email: formData.email,
                      body: formData.subject,
                  };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Show success message
            alert('Message sent successfully!');
        } catch (error) {
            console.error(error);
            alert(error.message || 'Failed to send message. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-16">
            {/* Hero Section */}
            <div className="bg-purple-900 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">How Can We Help You Today?</h1>
                        <p className="text-lg md:text-xl text-purple-100 leading-relaxed">
                            Our dedicated support team is here to assist you. Whether you have questions, feedback, or need assistance, we're committed to providing you with exceptional support.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center p-4">
                        <div className="text-3xl font-bold text-purple-600 mb-2">2h</div>
                        <div className="text-gray-600">Average Response Time</div>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                        <div className="text-gray-600">Support Available</div>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                        <div className="text-gray-600">Customer Satisfaction</div>
                    </div>
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <ContactForm onSubmit={handleSubmit} isSignedIn={isSignedIn} initialEmail={user?.primaryEmailAddress?.emailAddress || ''} initialName={user?.name || ''} />
                </div>
            </div>
        </div>
    );
}
