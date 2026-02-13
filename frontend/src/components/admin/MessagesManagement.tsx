import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    MoreVertical,
    Mail,
    MailOpen,
    Trash2,
    MessageSquare,
    CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    fetchMessages,
    updateMessageStatus,
    deleteMessage,
    type ContactMessage,
} from '@/api/contact';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

const MESSAGES_PAGE_SIZE = 15;

export function MessagesManagement() {
    const confirmDialog = useConfirmDialog();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const res = await fetchMessages({
                page: currentPage,
                limit: MESSAGES_PAGE_SIZE,
                status: statusFilter,
                search: searchQuery.trim() || undefined,
            });
            setMessages(res.data);
            setTotalMessages(res.total);
            setTotalPages(res.totalPages);
        } catch (error) {
            toast.error('Failed to load messages');
            console.error(error);
            setMessages([]);
            setTotalMessages(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, [currentPage, searchQuery, statusFilter]);

    const handleStatusUpdate = async (id: string, status: ContactMessage['status']) => {
        try {
            const updatedMessage = await updateMessageStatus(id, status);
            setMessages(messages.map((msg) => (msg.id === id ? updatedMessage : msg)));
            toast.success(`Message marked as ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: 'Delete message',
            description: 'Are you sure you want to delete this message?',
            confirmLabel: 'Delete',
            variant: 'destructive',
        });
        if (!confirmed) return;
        try {
            await deleteMessage(id);
            setMessages(messages.filter((msg) => msg.id !== id));
            toast.success('Message deleted successfully');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const paginatedMessages = messages;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'default'; // primary color
            case 'read':
                return 'secondary';
            case 'replied':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-8 h-8" /> Messages
                    </h1>
                    <p className="text-muted-foreground">
                        Manage incoming contact form inquiries
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                        Total: {totalMessages}
                    </Badge>
                    <Badge variant="default" className="text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600">
                        Check New: {messages.filter((m) => m.status === 'new').length}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    {(['all', 'new', 'read', 'replied'] as const).map((filter) => (
                        <Button
                            key={filter}
                            variant={statusFilter === filter ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(filter)}
                            className="capitalize whitespace-nowrap"
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="w-[40%]">Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading messages...
                                </TableCell>
                            </TableRow>
                        ) : messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No messages found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedMessages.map((msg) => (
                                <TableRow key={msg.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell className="whitespace-nowrap font-medium text-muted-foreground">
                                        {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                                        <div className="text-xs">{format(new Date(msg.createdAt), 'h:mm a')}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">{msg.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span>{msg.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="line-clamp-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {msg.message}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(msg.status) as any} className="capitalize shadow-sm">
                                            {msg.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(msg.id, 'new')}>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Mark New
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(msg.id, 'read')}>
                                                    <MailOpen className="mr-2 h-4 w-4" />
                                                    Mark Read
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(msg.id, 'replied')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark Replied
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-muted-foreground text-sm">
                        Showing {(currentPage - 1) * MESSAGES_PAGE_SIZE + 1} to {Math.min(currentPage * MESSAGES_PAGE_SIZE, totalMessages)} of {totalMessages} messages
                    </p>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                                    }}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(page);
                                                }}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (
                                    (page === 2 && currentPage > 3) ||
                                    (page === totalPages - 1 && currentPage < totalPages - 2)
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                    }}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
