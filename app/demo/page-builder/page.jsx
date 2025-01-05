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

// Mock data for pages
const mockPages = [
    {
        id: 1,
        name: 'Home Page',
        content: '<h1>Welcome to Our Platform</h1><p>This is a demo home page content. Start editing to see how it works!</p>'
    },
    {
        id: 2,
        name: 'About Us',
        content: '<h1>About Our Company</h1><p>Learn more about what we do and our mission.</p>'
    },
    {
        id: 3,
        name: 'Contact',
        content: '<h1>Contact Us</h1><p>Get in touch with our team for support and inquiries.</p>'
    }
];

const PageBuilder = () => {
    const [pages, setPages] = useState(mockPages);
    const [currentPage, setCurrentPage] = useState(null);
    const [newPageName, setNewPageName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph.configure({
                HTMLAttributes: {
                    class: 'text-black text-base leading-relaxed mb-4',
                },
            }),
            Heading.configure({
                levels: [1, 2, 3, 4, 5],
                HTMLAttributes: {
                    class: ({ level }) => {
                        const classes = {
                            1: 'text-black text-4xl font-bold mt-8 mb-6',
                            2: 'text-black text-3xl font-bold mt-6 mb-4',
                            3: 'text-black text-2xl font-bold mt-5 mb-3',
                            4: 'text-black text-xl font-bold mt-4 mb-2',
                            5: 'text-black text-lg font-bold mt-3 mb-2'
                        };
                        return classes[level];
                    }
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
                    class: 'border border-gray-200 p-2 bg-gray-50 font-semibold',
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
        content: '<p>Start typing your content here...</p>',
        editorProps: {
            attributes: {
                class: 'min-h-[300px] px-6 py-4 focus:outline-none',
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

    const handleCreatePage = () => {
        if (!newPageName.trim()) return;

        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would create a new page.",
            variant: "default"
        });

        const newPage = {
            id: Date.now(),
            name: newPageName,
            content: '<p>Start typing your content here...</p>',
        };

        setPages([...pages, newPage]);
        setCurrentPage(newPage);
        setNewPageName('');
    };

    const handleSavePage = () => {
        if (!currentPage || !editor) return;

        setIsSaving(true);
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would save your page content.",
            variant: "default"
        });

        setTimeout(() => {
            setIsSaving(false);
        }, 800); // Simulate save delay
    };

    const handlePageSelect = (page) => {
        setCurrentPage(page);
        if (editor) {
            editor.commands.setContent(page.content || '<p>Start typing your content here...</p>');
        }
    };

    const handleDeletePage = (pageId) => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would delete the page.",
            variant: "default"
        });

        setPages(pages.filter((page) => page.id !== pageId));
        if (currentPage?.id === pageId) {
            setCurrentPage(null);
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter the URL of the image:');
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
                        className={`${editor.isActive('bold') ? 'bg-gray-100' : ''} hover:bg-gray-100`}>
                        <BoldIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${editor.isActive('italic') ? 'bg-gray-200' : ''}`}>
                        <ItalicIcon className="h-4 w-4" />
                    </Button>
                    {/* New Heading Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className={`${[1, 2, 3, 4, 5].some((level) => editor.isActive('heading', { level })) ? 'bg-gray-200' : ''}`}>
                                <HeadingIcon className="h-4 w-4 mr-1" />
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <DropdownMenuItem
                                    key={level}
                                    onSelect={() => editor.chain().focus().toggleHeading({ level }).run()}
                                    className={`${editor.isActive('heading', { level }) ? 'bg-gray-100' : ''}`}>
                                    <span className={`text-base ${editor.isActive('heading', { level }) ? 'font-semibold' : ''}`}>Heading {level}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()} className={`${editor.isActive('paragraph') ? 'bg-gray-100' : ''}`}>
                                <span className={`text-base ${editor.isActive('paragraph') ? 'font-semibold' : ''}`}>Paragraph</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}>
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}>
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
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
                        title="Align left">
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
                        title="Align center">
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
                        title="Align right">
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
                        title="Justify">
                        <AlignJustify className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className={editor.isActive('table') ? 'bg-gray-200' : ''}>
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
                <h1 className="text-2xl font-bold tracking-tight">Page Builder</h1>
                <p className="text-sm text-muted-foreground">Create and manage your pages with a rich text editor.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input placeholder="New page name" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} />
                            <Button onClick={handleCreatePage}>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {pages.map((page) => (
                                <div key={page.id} className="flex items-center gap-2">
                                    <Button variant={currentPage?.id === page.id ? 'default' : 'outline'} className="w-full justify-start" onClick={() => handlePageSelect(page)}>
                                        {page.name}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeletePage(page.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Editor */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{currentPage ? currentPage.name : 'Select a page'}</CardTitle>
                        <Button onClick={handleSavePage} disabled={!currentPage || isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {currentPage ? (
                            <div className="border rounded-lg overflow-hidden bg-white">
                                <MenuBar editor={editor} />
                                <div className="editor-content">
                                    <EditorContent 
                                        editor={editor} 
                                        className="max-w-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Create a new page or select an existing one to start editing
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PageBuilder;
