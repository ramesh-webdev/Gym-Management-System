import { useState } from 'react';
import { Plus, Edit, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockProducts } from '@/data/mockData';
import type { Product } from '@/types';

export function ProductManagement() {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newProduct: Product = {
            id: `prod-${Date.now()}`,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            category: formData.get('category') as Product['category'],
            image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=1000', // Default image for now
            stock: Number(formData.get('stock')),
            status: 'active',
        };

        setProducts([...products, newProduct]);
        setIsAddDialogOpen(false);
    };

    const handleEditClick = (product: Product) => {
        setCurrentProduct(product);
        setIsEditDialogOpen(true);
    };

    const handleUpdateProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        setProducts(products.map(p =>
            p.id === currentProduct.id
                ? {
                    ...p,
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    price: Number(formData.get('price')),
                    category: formData.get('category') as Product['category'],
                    stock: Number(formData.get('stock')),
                    status: formData.get('status') as Product['status'],
                }
                : p
        ));
        setIsEditDialogOpen(false);
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Products</h1>
                    <p className="text-muted-foreground">Manage gym products and inventory</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl">Add New Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Product Name</label>
                                <Input name="name" required className="bg-muted/50 border-border text-foreground" placeholder="e.g. Whey Protein" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                                    <Select name="category" required>
                                        <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="supplements">Supplements</SelectItem>
                                            <SelectItem value="gear">Gear</SelectItem>
                                            <SelectItem value="clothing">Clothing</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Price (₹)</label>
                                    <Input name="price" type="number" required className="bg-muted/50 border-border text-foreground" placeholder="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Stock</label>
                                    <Input name="stock" type="number" required className="bg-muted/50 border-border text-foreground" placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                                <Textarea name="description" required className="bg-muted/50 border-border text-foreground" placeholder="Product description..." />
                            </div>
                            <Button type="submit" className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                                Create Product
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-border text-foreground"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground">Product</TableHead>
                            <TableHead className="text-muted-foreground">Category</TableHead>
                            <TableHead className="text-muted-foreground">Price</TableHead>
                            <TableHead className="text-muted-foreground">Stock</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{product.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize border-ko-500/30 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent bg-ko-500/10">
                                        {product.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-foreground">₹{product.price}</TableCell>
                                <TableCell className="text-foreground">{product.stock}</TableCell>
                                <TableCell>
                                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}
                                        className={product.status === 'active' ? 'bg-gradient-to-r from-ko-500 to-ko-600 hover:from-ko-600 hover:to-ko-700' : ''}>
                                        {product.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-card border-border">
                                            <DropdownMenuItem onClick={() => handleEditClick(product)} className="text-foreground focus:bg-muted cursor-pointer">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-500 focus:bg-red-500/10 cursor-pointer">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-card border-border text-foreground max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">Edit Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProduct} className="space-y-4 pt-4">
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Product Name</label>
                            <Input name="name" defaultValue={currentProduct.name} required className="bg-muted/50 border-border text-foreground" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                                <Select name="category" defaultValue={currentProduct.category} required>
                                    <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="supplements">Supplements</SelectItem>
                                        <SelectItem value="gear">Gear</SelectItem>
                                        <SelectItem value="clothing">Clothing</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Price (₹)</label>
                                <Input name="price" type="number" defaultValue={currentProduct.price} required className="bg-muted/50 border-border text-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Stock</label>
                                <Input name="stock" type="number" defaultValue={currentProduct.stock} required className="bg-muted/50 border-border text-foreground" />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                                <Select name="status" defaultValue={currentProduct.status} required>
                                    <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                            <Textarea name="description" defaultValue={currentProduct.description} required className="bg-muted/50 border-border text-foreground" />
                        </div>
                        <Button type="submit" className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                            Update Product
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
