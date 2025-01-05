'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MoreVertical, Trash2, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

const isValidImageUrl = async (url) => {
    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        return contentType.startsWith('image/');
    } catch (error) {
        return false;
    }
};

const SortablePopup = ({ popup, path, website, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: popup.id,
        data: {
            type: 'popup',
            popup,
            path,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        touchAction: 'none',
    };

    const [showIconMenu, setShowIconMenu] = useState(false);
    const [newIconUrl, setNewIconUrl] = useState(popup.icon);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setNewIconUrl(popup.icon);
    }, [popup.icon]);

    const handleImageError = () => {
        setImageError(true);
        toast({
            title: t('popupManager.popup.errors.imageLoad'),
            description: t('popupManager.popup.errors.imageLoad'),
            variant: 'destructive',
        });
    };

    const getPopupTypeLabel = (type) => {
        switch (type) {
            case 'advertising':
                return t('popupManager.popup.types.ad');
            case 'email_collector':
                return t('popupManager.popup.types.email');
            default:
                return t('popupManager.popup.types.message');
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-4 bg-accent hover:bg-accent/80 rounded-xl transition-colors group ${isDragging ? 'opacity-50' : ''}`}
            data-popup-id={popup.id}>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden group">
                    <Image
                        src={popup.icon}
                        alt="Popup Icon"
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => {
                            setNewIconUrl(popup.icon);
                            setShowIconMenu(true);
                        }}
                        onError={handleImageError}
                        unoptimized
                    />
                    {imageError && (
                        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-xs text-center p-2">{t('popupManager.popup.errors.invalidImage')}</div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <button
                            className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                                setNewIconUrl(popup.icon);
                                setShowIconMenu(true);
                            }}>
                            {t('popupManager.popup.edit')}
                        </button>
                    </div>
                </div>

                <Dialog
                    open={showIconMenu}
                    onOpenChange={(open) => {
                        if (!open) {
                            setNewIconUrl(popup.icon);
                            setImageError(false);
                        }
                        setShowIconMenu(open);
                    }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('popupManager.popup.editIcon')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="newIconUrl">{t('popupManager.popup.iconUrl')}</Label>
                                <div className="flex gap-2">
                                    <Input id="newIconUrl" placeholder="https://example.com/image.jpg" value={newIconUrl} onChange={(e) => setNewIconUrl(e.target.value)} />
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            if (newIconUrl) {
                                                const isValid = await isValidImageUrl(newIconUrl);
                                                if (!isValid) {
                                                    toast({
                                                        title: t('popupManager.popup.errors.invalidUrl'),
                                                        description: t('popupManager.popup.errors.invalidUrl'),
                                                        variant: 'destructive',
                                                    });
                                                } else {
                                                    window.open(newIconUrl, '_blank');
                                                }
                                            }
                                        }}>
                                        {t('popupManager.popup.preview')}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setNewIconUrl(popup.icon);
                                        setShowIconMenu(false);
                                    }}>
                                    {t('popupManager.popup.cancel')}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const isValid = await isValidImageUrl(newIconUrl);
                                        if (!isValid) {
                                            toast({
                                                title: t('popupManager.popup.errors.invalidUrl'),
                                                description: t('popupManager.popup.errors.provideValidUrl'),
                                                variant: 'destructive',
                                            });
                                            return;
                                        }
                                        onEdit(website.id, path.id, popup.id, 'icon', newIconUrl);
                                        setShowIconMenu(false);
                                        setImageError(false);
                                    }}>
                                    {t('popupManager.popup.save')}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs px-2 py-1 rounded-full ${
                                popup.type === 'advertising' ? 'bg-blue-500/10 text-blue-500' : popup.type === 'email_collector' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                            }`}>
                            {getPopupTypeLabel(popup.type)}
                        </span>
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            className="text-sm font-medium text-foreground focus:outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded-md focus:ring-1 focus:ring-border"
                            onBlur={(e) => onEdit(website.id, path.id, popup.id, 'title', e.target.textContent)}
                            role="textbox"
                            tabIndex={0}>
                            {popup.title}
                        </div>
                    </div>
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm text-muted-foreground focus:outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded-md focus:ring-1 focus:ring-border"
                        onBlur={(e) => onEdit(website.id, path.id, popup.id, 'message', e.target.textContent)}
                        role="textbox"
                        tabIndex={0}>
                        {popup.message}
                    </div>
                    {popup.link && <div className="text-xs text-primary hover:text-primary/90 truncate">{popup.link}</div>}
                </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
                <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-xs font-medium text-muted-foreground focus:outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded-md focus:ring-1 focus:ring-border"
                    onBlur={(e) => onEdit(website.id, path.id, popup.id, 'timestamp', e.target.textContent)}
                    role="textbox"
                    tabIndex={0}>
                    {popup.timestamp}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(website.id, path.id, popup.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> {t('popupManager.popup.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default SortablePopup;
