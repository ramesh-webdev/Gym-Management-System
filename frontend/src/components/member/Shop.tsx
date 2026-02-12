import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Filter, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { getProducts } from '@/api/products';
import { createOrder, verifyPayment, cancelOrder } from '@/api/payments';
import type { Product } from '@/types';
import { openRazorpayCheckout, isRazorpayConfigured, RAZORPAY_CANCELLED_MESSAGE } from '@/utils/razorpay';
import { toast } from 'sonner';

type PayStep = 'confirm' | 'checkout' | 'success';

export function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Payment dialog state (same flow as MemberPayments)
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [step, setStep] = useState<PayStep>('confirm');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderAmountRupees, setOrderAmountRupees] = useState(0);
    const [orderAmountPaise, setOrderAmountPaise] = useState(0);
    const [razorpayKey, setRazorpayKey] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setProductsLoading(false));
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const isActive = product.status === 'active';
        return matchesSearch && matchesCategory && isActive;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter]);

    const resetPayDialog = () => {
        setSelectedProduct(null);
        setStep('confirm');
        setOrderId(null);
        setOrderAmountRupees(0);
        setOrderAmountPaise(0);
        setRazorpayKey('');
        setVerifyError(null);
    };

    const handleOpenPayDialog = (open: boolean) => {
        setPayDialogOpen(open);
        if (!open) resetPayDialog();
    };

    const handleBuyNow = (product: Product) => {
        setSelectedProduct(product);
        setStep('confirm');
        setOrderId(null);
        setOrderAmountRupees(0);
        setOrderAmountPaise(0);
        setRazorpayKey('');
        setVerifyError(null);
        setPayDialogOpen(true);
    };

    const handleProceedToPay = async () => {
        if (!selectedProduct || selectedProduct.price <= 0) return;
        setSubmitting(true);
        setVerifyError(null);
        try {
            const res = await createOrder({ amount: selectedProduct.price, type: 'product', productId: selectedProduct.id });
            setOrderId(res.orderId);
            setOrderAmountRupees(res.amount / 100);
            setOrderAmountPaise(res.amount);
            setRazorpayKey(res.key);
            setStep('checkout');
        } catch (e) {
            setVerifyError(e instanceof Error ? e.message : 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPay = async () => {
        if (!orderId) return;
        setSubmitting(true);
        setVerifyError(null);
        try {
            if (isRazorpayConfigured(razorpayKey)) {
                const result = await openRazorpayCheckout({
                    key: razorpayKey,
                    orderId,
                    amount: orderAmountPaise,
                    name: 'KO Fitness',
                    description: 'Product purchase',
                });
                await verifyPayment({
                    orderId: result.razorpayOrderId,
                    razorpayPaymentId: result.razorpayPaymentId,
                    razorpaySignature: result.razorpaySignature,
                });
            } else {
                await verifyPayment({
                    orderId,
                    razorpayPaymentId: `auto_${orderId}`,
                    razorpaySignature: 'auto_approved',
                });
            }
            setStep('success');
            toast.success('Payment successful!');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Payment failed';
            if (msg === RAZORPAY_CANCELLED_MESSAGE && orderId) {
                try {
                    await cancelOrder(orderId);
                } catch {
                    // ignore cancel API errors
                }
                toast.info('Payment cancelled');
                setVerifyError(null);
            } else {
                setVerifyError(msg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Shop</h1>
                <p className="text-muted-foreground">Browse and purchase gym gear and supplements</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-border text-foreground"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="bg-card/50 border-border text-foreground">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                <SelectValue placeholder="Category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="supplements">Supplements</SelectItem>
                            <SelectItem value="gear">Gear</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Product Grid */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {productsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-card/50 border border-border rounded-xl overflow-hidden flex flex-col space-y-4 p-4">
                                <Skeleton className="aspect-square w-full rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-9 w-24 rounded-md" />
                                </div>
                            </div>
                        ))
                    ) : (
                        paginatedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-card/50 border border-border rounded-xl overflow-hidden hover:border-ko-500/30 transition-all flex flex-col"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-muted relative overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-background/80 backdrop-blur text-foreground border-none">
                                            {product.category}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-display font-bold text-lg text-foreground mb-1">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="font-display text-xl font-bold bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
                                            ₹{product.price}
                                        </span>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
                                            onClick={() => handleBuyNow(product)}
                                            disabled={product.stock === 0}
                                        >
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {!productsLoading && filteredProducts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No products found matching your criteria.
                        </div>
                    )}
                </div>

                {/* Pagination UI */}
                {!productsLoading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-2">
                        <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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

            {/* Payment dialog (same flow as Member Payments) */}
            <Dialog open={payDialogOpen} onOpenChange={handleOpenPayDialog}>
                <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="font-display text-2xl flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            {step === 'confirm' && 'Confirm purchase'}
                            {step === 'checkout' && 'Confirm Payment'}
                            {step === 'success' && 'Payment Successful'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 min-h-0 pr-1">
                        {step === 'confirm' && selectedProduct && (
                            <div className="space-y-4 pt-4">
                                <div className="p-4 rounded-xl bg-muted/50 border border-border flex gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                        <img
                                            src={selectedProduct.image}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground">{selectedProduct.name}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                            {selectedProduct.description}
                                        </p>
                                        <p className="font-display text-xl font-bold text-foreground mt-2">
                                            ₹{selectedProduct.price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {verifyError && (
                                    <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{verifyError}</p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-border text-foreground"
                                        onClick={() => handleOpenPayDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                                        disabled={submitting}
                                        onClick={handleProceedToPay}
                                    >
                                        {submitting ? 'Creating order...' : 'Proceed to Pay'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 'checkout' && (
                            <div className="space-y-4 pt-4">
                                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                    <p className="text-muted-foreground text-sm">
                                        {selectedProduct?.name ?? 'Product'}
                                    </p>
                                    <p className="font-display text-2xl font-bold text-foreground mt-1">
                                        ₹{orderAmountRupees.toLocaleString()}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1">product</p>
                                </div>
                                <p className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Secure payment via Razorpay
                                </p>
                                {verifyError && (
                                    <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{verifyError}</p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-border text-foreground"
                                        onClick={() => setStep('confirm')}
                                        disabled={submitting}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                                        disabled={submitting}
                                        onClick={handleConfirmPay}
                                    >
                                        {submitting ? 'Processing...' : `Pay ₹${orderAmountRupees.toLocaleString()}`}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="space-y-4 pt-4 text-center">
                                <div className="w-14 h-14 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-lime-500" />
                                </div>
                                <p className="text-foreground font-medium">
                                    Your payment of ₹{orderAmountRupees.toLocaleString()} was successful.
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Invoice will appear in your payment history.
                                </p>
                                <Button
                                    className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
                                    onClick={() => handleOpenPayDialog(false)}
                                >
                                    Done
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
