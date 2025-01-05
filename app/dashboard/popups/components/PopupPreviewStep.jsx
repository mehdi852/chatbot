import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import PopupPreview from './PopupPreview';

const PopupPreviewStep = ({ popup, onPopupChange }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => onPopupChange({ ...popup, previewDevice: 'desktop' })} className={popup.previewDevice === 'desktop' ? 'bg-accent' : ''}>
                    Desktop
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPopupChange({ ...popup, previewDevice: 'mobile' })} className={popup.previewDevice === 'mobile' ? 'bg-accent' : ''}>
                    Mobile
                </Button>
            </div>

            <div className={`bg-muted rounded-lg border border-border p-4 sm:p-6 ${popup.previewDevice === 'mobile' ? 'max-w-[375px] mx-auto' : ''}`}>
                <PopupPreview popup={popup} />
            </div>

            <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                        <Info className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-foreground">Preview Note</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            This is a preview of how your popup will appear. The actual appearance may vary slightly depending on the user's device and browser.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupPreviewStep;
