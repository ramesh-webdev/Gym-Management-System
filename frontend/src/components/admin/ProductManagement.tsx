import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/products";
import { uploadImage } from "@/api/upload";
import type { Product } from "@/types";
import { toast } from "sonner";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";

const CATEGORIES = ["supplements", "gear", "clothing", "other"] as const;
const STATUSES = ["active", "inactive"] as const;

function ProductRowSkeleton() {
  return (
    <TableRow className="border-border hover:bg-transparent">
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
    </TableRow>
  );
}

export function ProductManagement() {
  const confirmDialog = useConfirmDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [newProductCategory, setNewProductCategory] =
    useState<Product["category"]>("supplements");
  const [editCategory, setEditCategory] =
    useState<Product["category"]>("supplements");
  const [editStatus, setEditStatus] = useState<Product["status"]>("active");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => {
        toast.error("Failed to load products");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock")) || 0;

    setSaving(true);
    try {
      let imageUrl = "";
      let cloudinaryId = "";
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(selectedFile);
        imageUrl = uploadResult.url;
        cloudinaryId = uploadResult.public_id;
        setIsUploading(false);
      }

      await createProduct({
        name,
        description,
        price,
        category: newProductCategory,
        image: imageUrl || undefined,
        cloudinaryId: cloudinaryId || undefined,
        stock,
        status: "active",
      });
      toast.success("Product created successfully!");
      setIsAddDialogOpen(false);
      setNewProductCategory("supplements");
      setSelectedFile(null);
      form.reset();
      loadProducts();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not create product. Please try again.",
      );
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setEditCategory(product.category);
    setEditStatus(product.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.id) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock")) || 0;

    setSaving(true);
    try {
      let imageUrl = currentProduct.image;
      let cloudinaryId = currentProduct.cloudinaryId;
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(selectedFile);
        imageUrl = uploadResult.url;
        cloudinaryId = uploadResult.public_id;
        setIsUploading(false);
      }

      await updateProduct(currentProduct.id, {
        name,
        description,
        price,
        category: editCategory,
        image: imageUrl || undefined,
        cloudinaryId: cloudinaryId || undefined,
        stock,
        status: editStatus,
      });
      toast.success("Product updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedFile(null);
      loadProducts();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not update product. Please try again.",
      );
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete product',
      description: 'Are you sure you want to delete this product?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully.");
      loadProducts();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete product.",
      );
    }
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage gym products and inventory
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-lg w-full max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle className="font-display text-2xl">
                Add New Product
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0 pr-1">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Product Name
                </label>
                <Input
                  name="name"
                  required
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="e.g. Whey Protein"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <Select
                    value={newProductCategory}
                    onValueChange={(v) =>
                      setNewProductCategory(v as Product["category"])
                    }
                    required
                  >
                    <SelectTrigger className="bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Price (₹)
                  </label>
                  <Input
                    name="price"
                    type="number"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Stock
                  </label>
                  <Input
                    name="stock"
                    type="number"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Product Image (Max 2MB)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="bg-muted/50 border-border text-foreground file:bg-ko-500 file:text-white file:border-none file:mr-4 file:px-2 file:rounded-sm hover:file:bg-ko-600 cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-xs text-lime-500 mt-1 truncate w-full max-w-full">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  name="description"
                  required
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="Product description..."
                />
              </div>
              <Button
                type="submit"
                disabled={saving || isUploading}
                className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
              >
                {isUploading
                  ? "Uploading Image..."
                  : saving
                    ? "Creating..."
                    : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">Product</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Stock</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                        <img
                          src={product.image || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize border-ko-500/30 bg-ko-500/10 text-foreground"
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    ₹{product.price}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {product.stock}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                      className={
                        product.status === "active"
                          ? "bg-lime-500/20 text-lime-600"
                          : ""
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-card border-border"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditClick(product)}
                          className="text-foreground focus:bg-muted cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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

      {filteredProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          {products.length === 0
            ? "No products yet. Add one to get started."
            : "No products match your search."}
        </p>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg w-full max-h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-display text-2xl">
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0 pr-1">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Product Name
              </label>
              <Input
                name="name"
                defaultValue={currentProduct.name}
                required
                className="bg-muted/50 border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Category
                </label>
                <Select
                  value={editCategory}
                  onValueChange={(v) =>
                    setEditCategory(v as Product["category"])
                  }
                  required
                >
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Price (₹)
                </label>
                <Input
                  name="price"
                  type="number"
                  defaultValue={currentProduct.price}
                  required
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Stock
                </label>
                <Input
                  name="stock"
                  type="number"
                  defaultValue={currentProduct.stock}
                  required
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Status
                </label>
                <Select
                  value={editStatus}
                  onValueChange={(v) => setEditStatus(v as Product["status"])}
                  required
                >
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Product Image (Max 2MB)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="bg-muted/50 border-border text-foreground file:bg-ko-500 file:text-white file:border-none file:mr-4 file:px-2 file:rounded-sm hover:file:bg-ko-600 cursor-pointer"
              />
              {selectedFile ? (
                <p className="text-xs text-lime-500 mt-1 truncate w-full max-w-full">
                  Selected: {selectedFile.name}
                </p>
              ) : currentProduct.image ? (
                <div className="mt-2 flex items-center gap-3 overflow-hidden">
                  <img
                    src={currentProduct.image}
                    alt="Current product"
                    className="h-12 w-12 rounded object-cover border border-border"
                  />
                  <p className="text-xs text-muted-foreground  break-all">
                    Current: {currentProduct.image}
                  </p>
                </div>
              ) : null}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Description
              </label>
              <Textarea
                name="description"
                defaultValue={currentProduct.description}
                required
                className="bg-muted/50 border-border text-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={saving || isUploading}
              className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
            >
              {isUploading
                ? "Uploading Image..."
                : saving
                  ? "Updating..."
                  : "Update Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
