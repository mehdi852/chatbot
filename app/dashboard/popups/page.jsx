'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, Loader2, Copy, Code2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/app/provider';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { checkSubscriptionFeature } from '@/utils/subscriptionUtils';
import { useTranslation } from 'react-i18next';
// Import components
import NoWebsiteSelected from './components/NoWebsiteSelected';
import SortablePopup from './components/SortablePopup';
import CreatePopupDialog from './components/CreatePopupDialog';
import Head from 'next/head';
const generateSafeId = () => Math.floor(Math.random() * 999999) + 1;

const DroppableContainer = ({ path, children }) => {
    const { setNodeRef } = useDroppable({
        id: path.id,
        data: {
            type: 'path',
            path,
        },
    });

    return (
        <div ref={setNodeRef} className="p-4 space-y-3">
            {children}
        </div>
    );
};

export default function PopupsPage() {
    const { t } = useTranslation();
    const [selectedWebsite, setSelectedWebsite] = useState(null);
    const [websites, setWebsites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openDialogs, setOpenDialogs] = useState({});
    const [isNewPathDialogOpen, setIsNewPathDialogOpen] = useState(false);
    const [newPath, setNewPath] = useState({ name: '', path: '' });
    const [newPopup, setNewPopup] = useState({
        type: 'message',
        title: '',
        message: '',
        icon: '/images/defaultIcon.png',
        timestamp: 'now',
        link: '',
        button_text: 'Subscribe',
        placeholder_text: 'Enter your email',
        success_message: 'Thanks for subscribing!',
        delay: 0,
        duration: '7000',
        isPreviewMode: false,
        previewDevice: 'desktop',
    });
    const { toast } = useToast();
    const { dbUser } = useUserContext();
    const [subscriptionLimits, setSubscriptionLimits] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [activePath, setActivePath] = useState(null);

    const materialBackgrounds = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!dbUser) return;

            try {
                const [projectResponse, limitsResponse] = await Promise.all([fetch(`/api/user/get-project?userId=${dbUser.id}`), fetch(`/api/user/get-subscription-limits?userId=${dbUser.id}`)]);

                if (!projectResponse.ok || !limitsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const projectData = await projectResponse.json();
                const limitsData = await limitsResponse.json();

                setWebsites(projectData);
                setSubscriptionLimits(limitsData);
            } catch (error) {
                console.error('Fetch error:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load data. Please refresh the page.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dbUser]);



    const handleAddPath = (websiteId) => {
        const website = websites.find((w) => w.id === websiteId);
        const check = checkSubscriptionFeature(subscriptionLimits, 'paths', website?.paths.length || 0);
        if (!check.allowed) {
            toast({
                title: 'Subscription Limit Reached',
                description: check.message,
                variant: 'destructive',
            });
            return;
        }

        if (!newPath.name || !newPath.path) return;

        const newPathId = generateSafeId();

        setWebsites((prev) =>
            prev.map((website) => {
                if (website.id !== websiteId) return website;
                return {
                    ...website,
                    paths: [
                        ...website.paths,
                        {
                            id: newPathId,
                            name: newPath.name,
                            path: newPath.path.startsWith('/') ? newPath.path : `/${newPath.path}`,
                            popups: [],
                        },
                    ],
                };
            })
        );

        setSelectedWebsite((prev) => {
            if (!prev || prev.id !== websiteId) return prev;
            return {
                ...prev,
                paths: [
                    ...prev.paths,
                    {
                        id: newPathId,
                        name: newPath.name,
                        path: newPath.path.startsWith('/') ? newPath.path : `/${newPath.path}`,
                        popups: [],
                    },
                ],
            };
        });

        setNewPath({ name: '', path: '' });
        setIsNewPathDialogOpen(false);
    };

    const handleAddPopup = async (websiteId, pathId, popupData) => {
        const website = websites.find((w) => w.id === websiteId);
        const path = website?.paths.find((p) => p.id === pathId);

        const countCheck = checkSubscriptionFeature(subscriptionLimits, 'popups', path?.popups.length || 0);
        if (!countCheck.allowed) {
            toast({
                title: 'Subscription Limit Reached',
                description: countCheck.message,
                variant: 'destructive',
            });
            return;
        }

        if (popupData.type === 'advertising') {
            const adCheck = checkSubscriptionFeature(subscriptionLimits, 'advertising');
            if (!adCheck.allowed) {
                toast({
                    title: 'Feature Not Available',
                    description: adCheck.message,
                    variant: 'destructive',
                });
                return;
            }
        }

        if (popupData.type === 'email_collector') {
            const emailCheck = checkSubscriptionFeature(subscriptionLimits, 'email_collector');
            if (!emailCheck.allowed) {
                toast({
                    title: 'Feature Not Available',
                    description: emailCheck.message,
                    variant: 'destructive',
                });
                return;
            }
        }

        const newPopupId = generateSafeId();

        setWebsites((prev) =>
            prev.map((website) => {
                if (website.id !== websiteId) return website;
                return {
                    ...website,
                    paths: website.paths.map((path) => {
                        if (path.id !== pathId) return path;
                        return {
                            ...path,
                            popups: [
                                ...path.popups,
                                {
                                    id: newPopupId,
                                    ...popupData,
                                },
                            ],
                        };
                    }),
                };
            })
        );

        setSelectedWebsite((prev) => {
            if (!prev || prev.id !== websiteId) return prev;
            return {
                ...prev,
                paths: prev.paths.map((path) => {
                    if (path.id !== pathId) return path;
                    return {
                        ...path,
                        popups: [
                            ...path.popups,
                            {
                                id: newPopupId,
                                ...popupData,
                            },
                        ],
                    };
                }),
            };
        });

        setOpenDialogs((prev) => ({ ...prev, [pathId]: false }));
    };

    const handleInlineEdit = async (websiteId, pathId, popupId, field, value) => {
        setWebsites((prev) =>
            prev.map((website) => {
                if (website.id !== websiteId) return website;
                return {
                    ...website,
                    paths: website.paths.map((path) => {
                        if (path.id !== pathId) return path;
                        return {
                            ...path,
                            popups: path.popups.map((popup) => (popup.id === popupId ? { ...popup, [field]: value } : popup)),
                        };
                    }),
                };
            })
        );

        setSelectedWebsite((prev) => {
            if (!prev || prev.id !== websiteId) return prev;
            return {
                ...prev,
                paths: prev.paths.map((path) => {
                    if (path.id !== pathId) return path;
                    return {
                        ...path,
                        popups: path.popups.map((popup) => (popup.id === popupId ? { ...popup, [field]: value } : popup)),
                    };
                }),
            };
        });
    };

    const handleDeletePopup = (websiteId, pathId, popupId) => {
        setWebsites((prev) =>
            prev.map((website) => {
                if (website.id !== websiteId) return website;
                return {
                    ...website,
                    paths: website.paths.map((path) => {
                        if (path.id !== pathId) return path;
                        return {
                            ...path,
                            popups: path.popups.filter((popup) => popup.id !== popupId),
                        };
                    }),
                };
            })
        );

        setSelectedWebsite((prev) => {
            if (!prev || prev.id !== websiteId) return prev;
            return {
                ...prev,
                paths: prev.paths.map((path) => {
                    if (path.id !== pathId) return path;
                    return {
                        ...path,
                        popups: path.popups.filter((popup) => popup.id !== popupId),
                    };
                }),
            };
        });
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);

        // Find the path containing the dragged popup
        selectedWebsite.paths.forEach((path) => {
            if (path.popups.some((popup) => popup.id === active.id)) {
                setActivePath(path);
            }
        });
    };

    const handleDragEnd = (event) => {
        setActiveId(null);
        setActivePath(null);

        const { active, over } = event;
        if (!active || !over) return;

        let sourcePath, destinationPath;
        let sourcePopupIndex, destinationPopupIndex;
        let sourcePopup;

        // Find source path and popup
        selectedWebsite.paths.forEach((path) => {
            const sourcePopupIdx = path.popups.findIndex((popup) => popup.id === active.id);
            if (sourcePopupIdx !== -1) {
                sourcePath = path;
                sourcePopupIndex = sourcePopupIdx;
                sourcePopup = path.popups[sourcePopupIdx];
            }
        });

        // Find destination path
        destinationPath = selectedWebsite.paths.find((path) => path.id === over.id);
        if (!destinationPath) {
            // If we didn't find a path directly, check if we're dropping on a popup
            selectedWebsite.paths.forEach((path) => {
                const destPopupIdx = path.popups.findIndex((popup) => popup.id === over.id);
                if (destPopupIdx !== -1) {
                    destinationPath = path;
                    destinationPopupIndex = destPopupIdx;
                }
            });
        } else {
            // If dropping directly on a path, append to the end
            destinationPopupIndex = destinationPath.popups.length;
        }

        if (!sourcePath || !destinationPath) return;

        const updatePaths = (paths) =>
            paths.map((path) => {
                if (path.id === sourcePath.id && path.id === destinationPath.id) {
                    // Same path, just reorder
                    const newPopups = [...path.popups];
                    const [removed] = newPopups.splice(sourcePopupIndex, 1);
                    newPopups.splice(destinationPopupIndex, 0, removed);
                    return { ...path, popups: newPopups };
                }

                if (path.id === sourcePath.id) {
                    // Remove from source path
                    return {
                        ...path,
                        popups: path.popups.filter((_, index) => index !== sourcePopupIndex),
                    };
                }

                if (path.id === destinationPath.id) {
                    // Add to destination path
                    const newPopups = [...path.popups];
                    if (path.popups.length === 0) {
                        return { ...path, popups: [sourcePopup] };
                    }
                    newPopups.splice(destinationPopupIndex, 0, sourcePopup);
                    return { ...path, popups: newPopups };
                }

                return path;
            });

        setWebsites((prev) =>
            prev.map((website) => {
                if (website.id !== selectedWebsite.id) return website;
                return {
                    ...website,
                    paths: updatePaths(website.paths),
                };
            })
        );

        setSelectedWebsite((prev) => ({
            ...prev,
            paths: updatePaths(prev.paths),
        }));
    };

    const handleSave = async () => {
        if (!dbUser) {
            toast({
                title: 'Error',
                description: 'User not authenticated',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/user/save-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    websites,
                    userId: dbUser.id,
                }),
            });

            if (!response.ok) throw new Error('Failed to save');

            toast({
                title: 'Success',
                description: 'Your changes have been saved.',
            });
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save changes. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .fa-popup {
                transform-origin: 0 0;
                position: relative;
                z-index: 1;
            }

            .fa-popup[data-dragging="true"] {
                z-index: 999;
            }

            .path-container {
                overflow: visible !important;
                position: relative;
                z-index: 1;
            }

            [data-dnd-draggable-dragging] {
                z-index: 10000 !important;
                pointer-events: auto !important;
                position: fixed;
                width: var(--dnd-draggable-width);
                transform-origin: 0 0;
                touch-action: none;
                user-select: none;
            }

            .dnd-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    // reset and show toast
    const handleResetProject = async () => {
        const response = await fetch('/api/user/reset-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: dbUser.id }),
        });

        if (response.ok) {
            toast({
                title: 'Success',
                description: 'Your project has been reset.',
            });
        } else {
            toast({
                title: 'Error',
                description: 'Failed to reset project. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">

            <Head>
                <title>Create Popups</title>
                <meta name="description" content="Create, manage, and deploy stunning website popups effortlessly with our  Popup Builder. Centralize your popup campaigns, customize designs, and boost conversions with advanced targeting—all with a single embed code." />
                <meta name="keywords" content="Popup builder SaaS, Website popup creator, Popup management tool, Custom popup designs, Website popups with embed code, Marketing popups software, Popup targeting and triggers, Easy popup integration, Centralized popup manager, Drag-and-drop popup builder, Boost website conversions, Exit intent popups, Popup display rules, SaaS popup solutions, Advanced popup targeting" />
            </Head>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('popupManager.title')}</h1>
                <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto min-w-[100px]">
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('popupManager.saving')}
                        </>
                    ) : (
                        t('popupManager.saveChanges')
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {websites.map((website) => (
                    <div
                        key={website.id}
                        onClick={() => setSelectedWebsite(website)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                            selectedWebsite?.id === website.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border bg-card hover:border-primary dark:bg-card/95'
                        }`}>
                        <div className={`w-10 sm:w-12 h-10 sm:h-12 ${website.color} rounded-xl flex items-center justify-center text-primary-foreground font-semibold shadow-sm`}>
                            {website.favicon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate text-foreground">{website.domain}</h3>
                            <p className="text-sm text-muted-foreground">
                                {website.paths.length} {t('dashboard.websites.paths')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {!selectedWebsite && <NoWebsiteSelected />}

            {selectedWebsite && (
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-1 text-foreground">{t('popupManager.websitePopups.title')}</h2>
                            <p className="text-sm text-muted-foreground">{t('popupManager.websitePopups.description', { domain: selectedWebsite.domain })}</p>
                        </div>
                        <Dialog open={isNewPathDialogOpen} onOpenChange={setIsNewPathDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto inline-flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    {t('popupManager.websitePopups.addPath')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('popupManager.websitePopups.addPathDialog.title')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pathName">{t('popupManager.websitePopups.addPathDialog.pathName')}</Label>
                                        <Input
                                            id="pathName"
                                            placeholder={t('popupManager.websitePopups.addPathDialog.pathNamePlaceholder')}
                                            value={newPath.name}
                                            onChange={(e) => setNewPath((prev) => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pathUrl">{t('popupManager.websitePopups.addPathDialog.pathUrl')}</Label>
                                        <Input
                                            id="pathUrl"
                                            placeholder={t('popupManager.websitePopups.addPathDialog.pathUrlPlaceholder')}
                                            value={newPath.path}
                                            onChange={(e) => setNewPath((prev) => ({ ...prev, path: e.target.value }))}
                                        />
                                    </div>
                                    <Button onClick={() => handleAddPath(selectedWebsite.id)}>{t('popupManager.websitePopups.addPathDialog.addButton')}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {selectedWebsite.paths.map((path) => (
                                <div key={path.id} className="bg-card dark:bg-card/95 rounded-xl border border-border path-container">
                                    <div className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5">{path.name}</div>
                                    <DroppableContainer path={path}>
                                        <CreatePopupDialog
                                            isOpen={openDialogs[path.id]}
                                            onClose={() => setOpenDialogs((prev) => ({ ...prev, [path.id]: false }))}
                                            onCreatePopup={(popupData) => handleAddPopup(selectedWebsite.id, path.id, popupData)}
                                            initialPopup={newPopup}
                                        />
                                        <button
                                            className="w-full p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors dark:hover:border-primary/70 dark:hover:text-primary/90"
                                            onClick={() => setOpenDialogs((prev) => ({ ...prev, [path.id]: true }))}>
                                            {t('popupManager.websitePopups.addPopup')}
                                        </button>

                                        <SortableContext items={path.popups.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                                            {path.popups.map((popup) => (
                                                <SortablePopup
                                                    key={popup.id}
                                                    popup={popup}
                                                    path={path}
                                                    website={selectedWebsite}
                                                    onEdit={handleInlineEdit}
                                                    onDelete={handleDeletePopup}
                                                    isDragging={activeId === popup.id}
                                                />
                                            ))}
                                            {path.popups.length === 0 && (
                                                <div className="min-h-[100px] border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground dark:border-border/50">
                                                    {t('popupManager.websitePopups.dropHere')}
                                                </div>
                                            )}
                                        </SortableContext>
                                    </DroppableContainer>
                                </div>
                            ))}
                        </div>
                        <DragOverlay>
                            {activeId && activePath && (
                                <SortablePopup
                                    popup={activePath.popups.find((p) => p.id === activeId)}
                                    path={activePath}
                                    website={selectedWebsite}
                                    onEdit={handleInlineEdit}
                                    onDelete={handleDeletePopup}
                                    isDragging={true}
                                />
                            )}
                        </DragOverlay>
                    </DndContext>
                </section>
            )}
        </div>
    );
}
