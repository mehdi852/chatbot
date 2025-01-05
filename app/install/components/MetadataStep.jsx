import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Building2, Mail, Tag, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function MetadataStep({ onNext, onBack }) {
    const [formData, setFormData] = useState({
        'site-name': '',
        'site-description': '',
        'site-keywords': '',
        'admin-email': '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        // Clear error when user starts typing
        if (errors[id]) {
            setErrors((prev) => ({ ...prev, [id]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData['site-name'].trim()) {
            newErrors['site-name'] = 'Website name is required';
        }
        if (!formData['site-description'].trim()) {
            newErrors['site-description'] = 'Website description is required';
        }
        if (!formData['admin-email'].trim()) {
            newErrors['admin-email'] = 'Admin email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['admin-email'])) {
            newErrors['admin-email'] = 'Please enter a valid email address';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/install/save-metadata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to save metadata');
                }

                onNext();
            } catch (error) {
                console.error('Error saving metadata:', error);
                setErrors((prev) => ({
                    ...prev,
                    submit: error.message,
                }));
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Website Settings</h2>
                <p className="text-gray-500 mt-2">Configure your website's basic information</p>
            </div>

            <Card className="p-8 shadow-lg border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-5 w-5 text-gray-500" />
                                <Label htmlFor="site-name" className="text-base font-medium">
                                    Website Name
                                </Label>
                            </div>
                            <Input
                                id="site-name"
                                value={formData['site-name']}
                                onChange={handleChange}
                                placeholder="My Awesome Website"
                                className={cn('h-11 transition-shadow focus:ring-2 focus:ring-blue-100', errors['site-name'] && 'border-red-500 focus:ring-red-100')}
                            />
                            {errors['site-name'] && <p className="text-sm text-red-500 mt-1">{errors['site-name']}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                <Label htmlFor="site-description" className="text-base font-medium">
                                    Website Description
                                </Label>
                            </div>
                            <Textarea
                                id="site-description"
                                value={formData['site-description']}
                                onChange={handleChange}
                                placeholder="Enter a brief description of your website"
                                className={cn('min-h-[100px] resize-none transition-shadow focus:ring-2 focus:ring-blue-100', errors['site-description'] && 'border-red-500 focus:ring-red-100')}
                            />
                            {errors['site-description'] && <p className="text-sm text-red-500 mt-1">{errors['site-description']}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="h-5 w-5 text-gray-500" />
                                <Label htmlFor="site-keywords" className="text-base font-medium">
                                    Keywords
                                </Label>
                            </div>
                            <Input
                                id="site-keywords"
                                value={formData['site-keywords']}
                                onChange={handleChange}
                                placeholder="website, saas, business (comma separated)"
                                className="h-11 transition-shadow focus:ring-2 focus:ring-blue-100"
                            />
                            <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <Label htmlFor="admin-email" className="text-base font-medium">
                                    Admin Email
                                </Label>
                            </div>
                            <Input
                                id="admin-email"
                                type="email"
                                value={formData['admin-email']}
                                onChange={handleChange}
                                placeholder="admin@example.com"
                                className={cn('h-11 transition-shadow focus:ring-2 focus:ring-blue-100', errors['admin-email'] && 'border-red-500 focus:ring-red-100')}
                            />
                            {errors['admin-email'] && <p className="text-sm text-red-500 mt-1">{errors['admin-email']}</p>}
                        </div>
                    </div>

                    {errors.submit && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{errors.submit}</div>}

                    <div className="flex justify-between items-center pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="hover:bg-gray-100 transition-colors">
                            Back
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700 transition-colors">
                            {isSubmitting ? 'Saving...' : 'Continue'}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
