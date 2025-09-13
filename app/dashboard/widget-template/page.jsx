'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/app/provider';
import { Plus, Trash2, GripVertical, MessageCircle, Save, Loader2, Globe, CheckCircle2, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Simple drag and drop implementation
const DragDropProvider = ({ children, onReorder }) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedOver, setDraggedOver] = useState(null);

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '';
        setDraggedItem(null);
        setDraggedOver(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e, item) => {
        setDraggedOver(item);
    };

    const handleDrop = (e, targetItem) => {
        e.preventDefault();
        if (draggedItem && targetItem && draggedItem.id !== targetItem.id) {
            onReorder(draggedItem, targetItem);
        }
    };

    return (
        <div>
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    onDragStart: handleDragStart,
                    onDragEnd: handleDragEnd,
                    onDragOver: handleDragOver,
                    onDragEnter: handleDragEnter,
                    onDrop: handleDrop,
                    draggedOver: draggedOver,
                })
            )}
        </div>
    );
};

const DraggableQuestionItem = ({ 
    question, 
    onDelete, 
    onDragStart, 
    onDragEnd, 
    onDragOver, 
    onDragEnter, 
    onDrop, 
    draggedOver 
}) => {
    const isDraggedOver = draggedOver && draggedOver.id === question.id;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, question)}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, question)}
            onDrop={(e) => onDrop(e, question)}
            className={`group mt-3 flex items-center gap-3 p-4 bg-card border rounded-lg cursor-move transition-all hover:shadow-md ${
                isDraggedOver ? 'border-primary bg-primary/5' : 'border-border'
            }`}
        >
            <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground">
                <GripVertical size={16} />
            </div>
            <div className="flex-1 text-foreground font-medium">
                {question.question}
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(question.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 size={16} />
            </Button>
        </div>
    );
};

const WidgetTemplatePage = () => {
    const { dbUser } = useUserContext();
    const { toast } = useToast();
    
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [websites, setWebsites] = useState([]);
    const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
    const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);

    // Load user websites on component mount
    useEffect(() => {
        const fetchWebsites = async () => {
            if (!dbUser?.id) {
                setIsLoadingWebsites(false);
                return;
            }
            
            setIsLoadingWebsites(true);
            try {
                const response = await fetch(`/api/user/get-project?userId=${dbUser.id}`);
                if (response.ok) {
                    const websitesData = await response.json();
                    setWebsites(websitesData);
                    
                    // Auto-select the first website if available
                    if (websitesData.length > 0 && !selectedWebsiteId) {
                        setSelectedWebsiteId(websitesData[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching websites:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load websites',
                    variant: 'destructive',
                });
            } finally {
                setIsLoadingWebsites(false);
            }
        };

        fetchWebsites();
    }, [dbUser?.id, toast, selectedWebsiteId]);

    // Load questions when website is selected
    useEffect(() => {
        const loadQuestions = async () => {
            if (!selectedWebsiteId) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/widget/questions?websiteId=${selectedWebsiteId}&_t=${Date.now()}`,
                    {
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setQuestions(data.questions || []);
                    }
                } else {
                    throw new Error('Failed to load questions');
                }
            } catch (error) {
                console.error('Error loading questions:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load widget questions',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadQuestions();
    }, [selectedWebsiteId, toast]);

    const handleAddQuestion = async () => {
        if (!newQuestion.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a question',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedWebsiteId) {
            toast({
                title: 'Error',
                description: 'Please select a website',
                variant: 'destructive',
            });
            return;
        }

        setIsAdding(true);
        try {
            const response = await fetch('/api/widget/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websiteId: selectedWebsiteId,
                    question: newQuestion.trim(),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setQuestions(prev => [...prev, data.question]);
                    setNewQuestion('');
                    toast({
                        title: 'Success',
                        description: 'Question added successfully',
                        variant: 'success',
                    });
                }
            } else {
                throw new Error('Failed to add question');
            }
        } catch (error) {
            console.error('Error adding question:', error);
            toast({
                title: 'Error',
                description: 'Failed to add question',
                variant: 'destructive',
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!selectedWebsiteId) return;
        
        try {
            const response = await fetch(
                `/api/widget/questions?questionId=${questionId}&websiteId=${selectedWebsiteId}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                setQuestions(prev => prev.filter(q => q.id !== questionId));
                toast({
                    title: 'Success',
                    description: 'Question deleted successfully',
                    variant: 'success',
                });
            } else {
                throw new Error('Failed to delete question');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete question',
                variant: 'destructive',
            });
        }
    };

    const handleReorder = (draggedItem, targetItem) => {
        const newQuestions = [...questions];
        const draggedIndex = newQuestions.findIndex(q => q.id === draggedItem.id);
        const targetIndex = newQuestions.findIndex(q => q.id === targetItem.id);
        
        // Remove dragged item
        const [removed] = newQuestions.splice(draggedIndex, 1);
        // Insert at target position
        newQuestions.splice(targetIndex, 0, removed);
        
        setQuestions(newQuestions);
    };

    const handleSaveOrder = async () => {
        if (!selectedWebsiteId) return;
        
        setIsSaving(true);
        try {
            const response = await fetch('/api/widget/questions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websiteId: selectedWebsiteId,
                    questions: questions,
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Question order saved successfully',
                    variant: 'success',
                });
            } else {
                throw new Error('Failed to save order');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            toast({
                title: 'Error',
                description: 'Failed to save question order',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state while fetching websites
    if (isLoadingWebsites) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <div className="space-y-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-64"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-96"></div>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm border">
                        <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
                        <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm border">
                        <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-16 bg-muted rounded animate-pulse"></div>
                            <div className="h-16 bg-muted rounded animate-pulse"></div>
                            <div className="h-16 bg-muted rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state while fetching questions for selected website
    if (isLoading && selectedWebsiteId) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <div className="space-y-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-64"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-96"></div>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm border">
                        <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
                        <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm border">
                        <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-16 bg-muted rounded animate-pulse"></div>
                            <div className="h-16 bg-muted rounded animate-pulse"></div>
                            <div className="h-16 bg-muted rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!websites.length) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Alert>
                        <MessageCircle className="h-4 w-4" />
                        <AlertDescription>
                            You need to create a website first before managing widget questions.{' '}
                            <a href="/dashboard" className="text-primary hover:underline">
                                Go to Dashboard
                            </a>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Widget Template</h1>
                    <p className="text-muted-foreground">
                        Customize the questions that appear in your chat widget. Users will see these as quick-start options.
                    </p>
                </div>

                {/* Website Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Select Website
                        </CardTitle>
                        <CardDescription>Choose which website you want to configure questions for</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {websites.map((website) => (
                                <div
                                    key={website.id}
                                    onClick={() => setSelectedWebsiteId(website.id)}
                                    className={`group relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                        selectedWebsiteId === website.id
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-border/40 bg-card hover:border-primary/30'
                                    }`}
                                >
                                    {selectedWebsiteId === website.id && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${website.color || 'bg-primary'} rounded-lg flex items-center justify-center text-primary-foreground font-semibold shadow-sm`}>
                                            {website.favicon || website.domain[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate text-foreground">{website.name || website.domain}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{website.domain}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {websites.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">No websites found</p>
                                <p>Create a website in your dashboard first.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedWebsiteId && (
                    <>
                        {/* Add New Question */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Question</CardTitle>
                                <CardDescription>Enter a question that users can click to start a conversation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="e.g., How can I track my order?"
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddQuestion();
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleAddQuestion} disabled={isAdding}>
                                        {isAdding ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        Add Question
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Questions List */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Widget Questions ({questions.length})</CardTitle>
                                    <CardDescription>
                                        Drag and drop to reorder. These questions will appear in your chat widget.
                                    </CardDescription>
                                </div>
                                {questions.length > 0 && (
                                    <Button onClick={handleSaveOrder} disabled={isSaving} variant="outline">
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save Order
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {questions.length > 0 ? (
                                    <div className="space-y-6">
                                        <DragDropProvider  onReorder={handleReorder}>
                                            {questions.map((question) => (
                                                <DraggableQuestionItem
                                                    key={question.id}
                                                    question={question}
                                                    onDelete={handleDeleteQuestion}
                                                />
                                            ))}
                                        </DragDropProvider>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">No questions yet</p>
                                        <p>Add your first question to get started with your widget template.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {questions.length > 0 && (
                            <Alert>
                                <MessageCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Preview:</strong> These questions will appear as clickable buttons in your chat widget, 
                                    making it easy for visitors to start conversations on your website.
                                </AlertDescription>
                            </Alert>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WidgetTemplatePage;
