'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import ResizableImage from 'tiptap-extension-resize-image';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Heading as HeadingIcon,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Save,
    ChevronDown,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Table as TableIcon,
    Plus,
    Trash,
    Loader2,
    Trash2,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const PageBuilder = () => {
    const { t } = useTranslation();
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);
    const [newPageName, setNewPageName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph.configure({
                HTMLAttributes: {
                    class: 'text-foreground text-base leading-relaxed mb-4',
                },
            }),
            Heading.configure({
                levels: [1, 2, 3, 4, 5],
                HTMLAttributes: {
                    class: ({ level }) => {
                        const classes = {
                            1: 'text-foreground text-4xl font-bold mt-8 mb-6',
                            2: 'text-foreground text-3xl font-bold mt-6 mb-4',
                            3: 'text-foreground text-2xl font-bold mt-5 mb-3',
                            4: 'text-foreground text-xl font-bold mt-4 mb-2',
                            5: 'text-foreground text-lg font-bold mt-3 mb-2',
                        };
                        return classes[level];
                    },
                },
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: 'list-disc list-outside ml-4 space-y-2 mb-4',
                },
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: 'list-decimal list-outside ml-4 space-y-2 mb-4',
                },
            }),
            ListItem.configure({
                HTMLAttributes: {
                    class: 'pl-1',
                },
            }),
            ResizableImage.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Table.configure({
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border-b border-gray-200',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-200 p-2',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2 bg-muted font-semibold',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            Paragraph,
            Text,
            Bold,
            Italic,
            StarterKit.configure({
                document: false,
                paragraph: false,
                text: false,
                bold: false,
                italic: false,
                heading: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
        ],
        content: t('pageBuilder.editor.defaultContent'),
        editorProps: {
            attributes: {
                class: 'min-h-[300px] px-6 py-4 focus:outline-none bg-background text-foreground',
            },
        },
        onUpdate: ({ editor }) => {
            if (currentPage) {
                const htmlContent = editor.getHTML();
                setPages(pages.map((page) => (page.id === currentPage.id ? { ...page, content: htmlContent } : page)));
            }
        },
    });

    // Update editor content when switching pages
    useEffect(() => {
        if (editor && currentPage) {
            editor.commands.setContent(currentPage.content || '<p>Start typing your content here...</p>');
        }
    }, [currentPage, editor]);

    // fetch pages

    const fetchPages = async () => {
        const response = await fetch('/api/public/get-pages');
        const data = await response.json();
        setPages(data.pages);
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleCreatePage = async () => {
        if (!newPageName.trim()) return;

        try {
            const response = await fetch('/api/admin/create-page', {
                method: 'POST',
                body: JSON.stringify({
                    name: newPageName,
                    content: t('pageBuilder.editor.defaultContent'),
                }),
            });

            if (!response.ok) throw new Error('Failed to create page');

            const { page } = await response.json();
            setPages([...pages, page]);
            setCurrentPage(page);
            setNewPageName('');
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Page created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create page',
                variant: 'destructive',
            });
        }
    };

    const handleSavePage = async () => {
        if (!currentPage || !editor) return;

        setIsSaving(true);
        try {
            const htmlContent = editor.getHTML();
            const response = await fetch('/api/admin/create-page', {
                method: 'POST',
                body: JSON.stringify({ name: currentPage.name, content: htmlContent }),
            });

            if (!response.ok) throw new Error('Failed to save page');

            const data = await response.json();
            toast({
                variant: 'success',
                title: 'Success',
                description: t('pageBuilder.messages.success.save'),
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: t('pageBuilder.messages.error.save'),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePageSelect = (page) => {
        setCurrentPage(page);
        if (editor) {
            editor.commands.setContent(page.content || '<p>Start typing your content here...</p>');
        }
    };

    const addImage = () => {
        const url = window.prompt(t('pageBuilder.editor.toolbar.addImage'));
        if (url && editor) {
            editor
                .chain()
                .focus()
                .setImage({
                    src: url,
                    width: 300,
                    height: 'auto',
                })
                .run();
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

        // Use setTimeout to ensure the table is fully rendered before focusing
        setTimeout(() => {
            editor.chain().focus().run();
        }, 0);
    };

    const addColumnBefore = () => {
        editor.chain().focus().addColumnBefore().run();
    };

    const addColumnAfter = () => {
        editor.chain().focus().addColumnAfter().run();
    };

    const deleteColumn = () => {
        editor.chain().focus().deleteColumn().run();
    };

    const addRowBefore = () => {
        editor.chain().focus().addRowBefore().run();
    };

    const addRowAfter = () => {
        editor.chain().focus().addRowAfter().run();
    };

    const deleteRow = () => {
        editor.chain().focus().deleteRow().run();
    };

    const deleteTable = () => {
        editor.chain().focus().deleteTable().run();
    };

    const handleDeletePage = async (pageId) => {
        try {
            const response = await fetch(`/api/admin/delete-page`, {
                method: 'DELETE',
                body: JSON.stringify({ id: pageId }),
            });

            if (!response.ok) throw new Error('Failed to delete page');

            // Remove page from state
            setPages(pages.filter((page) => page.id !== pageId));
            if (currentPage?.id === pageId) {
                setCurrentPage(null);
                if (editor) {
                    editor.commands.setContent('');
                }
            }

            toast({
                variant: 'success',
                title: 'Success',
                description: 'Page deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete page',
                variant: 'destructive',
            });
        }
    };

    const MenuBar = ({ editor }) => {
        if (!editor) {
            return null;
        }

        return (
            <div className="border-b border-gray-200 p-2 flex gap-2 flex-wrap items-center justify-between bg-white">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`${editor.isActive('bold') ? 'bg-accent' : ''} hover:bg-accent`}>
                        <BoldIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${editor.isActive('italic') ? 'bg-accent' : ''}`}>
                        <ItalicIcon className="h-4 w-4" />
                    </Button>
                    {/* New Heading Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className={`${[1, 2, 3, 4, 5].some((level) => editor.isActive('heading', { level })) ? 'bg-accent' : ''}`}>
                                <HeadingIcon className="h-4 w-4 mr-1" />
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <DropdownMenuItem
                                    key={level}
                                    onSelect={() => editor.chain().focus().toggleHeading({ level }).run()}
                                    className={`${editor.isActive('heading', { level }) ? 'bg-accent' : ''}`}>
                                    <span className={`text-base ${editor.isActive('heading', { level }) ? 'font-semibold' : ''}`}>Heading {level}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()} className={`${editor.isActive('paragraph') ? 'bg-accent' : ''}`}>
                                <span className={`text-base ${editor.isActive('paragraph') ? 'font-semibold' : ''}`}>Paragraph</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${editor.isActive('bulletList') ? 'bg-accent' : ''}`}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${editor.isActive('orderedList') ? 'bg-accent' : ''}`}>
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${editor.isActive('blockquote') ? 'bg-accent' : ''}`}>
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
                        <Redo className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={addImage} title="Add image">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-gray-200 mx-2" /> {/* Divider */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
                        title="Align left">
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
                        title="Align center">
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
                        title="Align right">
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={editor.isActive({ textAlign: 'justify' }) ? 'bg-accent' : ''}
                        title="Justify">
                        <AlignJustify className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className={editor.isActive('table') ? 'bg-accent' : ''}>
                                <TableIcon className="h-4 w-4 mr-1" />
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={addTable}>
                                <Plus className="h-4 w-4 mr-2" />
                                Insert Table
                            </DropdownMenuItem>
                            {editor.isActive('table') && (
                                <>
                                    <DropdownMenuItem onSelect={addColumnBefore}>Add Column Before</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={addColumnAfter}>Add Column After</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={deleteColumn}>Delete Column</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={addRowBefore}>Add Row Before</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={addRowAfter}>Add Row After</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={deleteRow}>Delete Row</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={deleteTable} className="text-red-600">
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete Table
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-8 md:ml-72">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pageBuilder.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('pageBuilder.description')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <Card className="lg:col-span-1 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">{t('pageBuilder.pages.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder={t('pageBuilder.pages.newPagePlaceholder')}
                                value={newPageName}
                                onChange={(e) => setNewPageName(e.target.value)}
                                className="bg-background border-border text-foreground"
                            />
                            <Button onClick={handleCreatePage} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {t('pageBuilder.pages.addButton')}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {pages.map((page) => (
                                <div key={page.id} className="flex items-center gap-2">
                                    <Button
                                        variant={currentPage?.id === page.id ? 'default' : 'outline'}
                                        className="w-full justify-start border-border hover:bg-accent"
                                        onClick={() => handlePageSelect(page)}>
                                        {page.name}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeletePage(page.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Editor */}
                <Card className="lg:col-span-3 border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-foreground">{currentPage ? currentPage.name : t('pageBuilder.pages.noPageSelected')}</CardTitle>
                        <Button onClick={handleSavePage} disabled={!currentPage || isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('pageBuilder.pages.savingButton')}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {t('pageBuilder.pages.saveButton')}
                                </>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {currentPage ? (
                            <div className="border rounded-lg overflow-hidden bg-background border-border">
                                <div className="border-b border-border p-2 flex gap-2 flex-wrap items-center justify-between bg-background">
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleBold().run()}
                                            className={`${editor.isActive('bold') ? 'bg-accent' : ''} hover:bg-accent`}>
                                            <BoldIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleItalic().run()}
                                            className={`${editor.isActive('italic') ? 'bg-accent' : ''}`}>
                                            <ItalicIcon className="h-4 w-4" />
                                        </Button>
                                        {/* New Heading Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${[1, 2, 3, 4, 5].some((level) => editor.isActive('heading', { level })) ? 'bg-accent' : ''}`}>
                                                    <HeadingIcon className="h-4 w-4 mr-1" />
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <DropdownMenuItem
                                                        key={level}
                                                        onSelect={() => editor.chain().focus().toggleHeading({ level }).run()}
                                                        className={`${editor.isActive('heading', { level }) ? 'bg-accent' : ''}`}>
                                                        <span className={`text-base ${editor.isActive('heading', { level }) ? 'font-semibold' : ''}`}>Heading {level}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()} className={`${editor.isActive('paragraph') ? 'bg-accent' : ''}`}>
                                                    <span className={`text-base ${editor.isActive('paragraph') ? 'font-semibold' : ''}`}>Paragraph</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                                            className={`${editor.isActive('bulletList') ? 'bg-accent' : ''}`}>
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                            className={`${editor.isActive('orderedList') ? 'bg-accent' : ''}`}>
                                            <ListOrdered className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                            className={`${editor.isActive('blockquote') ? 'bg-accent' : ''}`}>
                                            <Quote className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
                                            <Undo className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
                                            <Redo className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={addImage} title="Add image">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                        <div className="h-4 w-px bg-gray-200 mx-2" /> {/* Divider */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                            className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
                                            title="Align left">
                                            <AlignLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                            className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
                                            title="Align center">
                                            <AlignCenter className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                            className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
                                            title="Align right">
                                            <AlignRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-accent' : ''}
                                            title="Justify">
                                            <AlignJustify className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" variant="ghost" size="sm" className={editor.isActive('table') ? 'bg-accent' : ''}>
                                                    <TableIcon className="h-4 w-4 mr-1" />
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={addTable}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Insert Table
                                                </DropdownMenuItem>
                                                {editor.isActive('table') && (
                                                    <>
                                                        <DropdownMenuItem onSelect={addColumnBefore}>Add Column Before</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={addColumnAfter}>Add Column After</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={deleteColumn}>Delete Column</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={addRowBefore}>Add Row Before</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={addRowAfter}>Add Row After</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={deleteRow}>Delete Row</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={deleteTable} className="text-red-600">
                                                            <Trash className="h-4 w-4 mr-2" />
                                                            Delete Table
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="editor-content">
                                    <EditorContent editor={editor} className="max-w-none" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Create or select a page to start editing.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PageBuilder;
