import { useState } from 'react';
import { Search, ShoppingBag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockProducts } from '@/data/mockData';
import type { Product } from '@/types';

export function Shop() {
    const [products] = useState<Product[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const isActive = product.status === 'active';
        return matchesSearch && matchesCategory && isActive;
    });

    const handleBuyNow = (_product: Product) => {
        // In a real app, this would add to cart or checkout
        alert('Thank you for your purchase! This is a mock transaction.');
    };

    return (
        <div className="space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
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
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No products found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
