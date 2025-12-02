"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	isAvailable: boolean;
	stock: number;
	displayOrder: number;
	categoryId: string;
	allergens?: string;
	availableForPickup: boolean;
	ingredients?: string;
	longDescription?: string;
	preparationTime?: number;
	storage?: string;
	sizeOptions?: any;
	category?: {
		id: string;
		name: string;
		slug: string;
	};
}

interface ProductCategory {
	id: string;
	name: string;
	slug: string;
	isPrincipal: boolean;
}

export default function AdminProductsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: 0,
		image: "",
		isAvailable: true,
		stock: 0,
		displayOrder: 0,
		categoryId: "",
		allergens: "",
		availableForPickup: true,
		ingredients: "",
		longDescription: "",
		preparationTime: 0,
		storage: "",
		sizeOptions: "",
		relatedProductIds: "",
	});

	useEffect(() => {
		if (status === "loading") return;

		if (!session || session.user?.role !== "admin") {
			router.push("/admin/login");
		}
	}, [session, status, router]);

	useEffect(() => {
		if (session && session.user?.role === "admin") {
			fetchProducts();
			fetchCategories();
		}
	}, [session]);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/products?all=true");
			const data = await response.json();
			if (data.products) {
				setProducts(data.products);
			}
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const response = await fetch("/api/categories");
			const data = await response.json();
			if (data.categories) {
				setCategories(data.categories);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	const openCreateModal = () => {
		setEditingProduct(null);
		setFormData({
			name: "",
			description: "",
			price: 0,
			image: "",
			isAvailable: true,
			stock: 0,
			displayOrder: 0,
			categoryId: categories[0]?.id || "",
			allergens: "",
			availableForPickup: true,
			ingredients: "",
			longDescription: "",
			preparationTime: 0,
			storage: "",
			sizeOptions: "",
			relatedProductIds: "",
		});
		setShowModal(true);
	};

	const openEditModal = (product: Product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			description: product.description,
			price: product.price,
			image: product.image,
			isAvailable: product.isAvailable,
			stock: product.stock,
			displayOrder: product.displayOrder,
			categoryId: product.categoryId,
			allergens: product.allergens || "",
			availableForPickup: product.availableForPickup,
			ingredients: product.ingredients || "",
			longDescription: product.longDescription || "",
			preparationTime: product.preparationTime || 0,
			storage: product.storage || "",
			sizeOptions: product.sizeOptions ? JSON.stringify(product.sizeOptions) : "",
			relatedProductIds: product.relatedProductIds ? JSON.stringify(product.relatedProductIds) : "",
		});
		setShowModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Parse sizeOptions if provided
			let sizeOptionsJson = null;
			if (formData.sizeOptions.trim()) {
				try {
					sizeOptionsJson = JSON.parse(formData.sizeOptions);
				} catch {
					alert("Format JSON invalide pour les options de taille");
					return;
				}
			}

			// Parse relatedProductIds if provided
			let relatedProductIdsJson = null;
			if (formData.relatedProductIds.trim()) {
				try {
					relatedProductIdsJson = JSON.parse(formData.relatedProductIds);
				} catch {
					alert("Format JSON invalide pour les produits associés");
					return;
				}
			}

			const payload = {
				...formData,
				price: Number(formData.price),
				stock: Number(formData.stock),
				displayOrder: Number(formData.displayOrder),
				preparationTime: Number(formData.preparationTime),
				sizeOptions: sizeOptionsJson,
				relatedProductIds: relatedProductIdsJson,
			};

			const url = editingProduct
				? `/api/products/${editingProduct.id}`
				: "/api/products";

			const method = editingProduct ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				setShowModal(false);
				fetchProducts();
			} else {
				const data = await response.json();
				alert(data.error || "Erreur lors de la sauvegarde");
			}
		} catch (error) {
			console.error("Error saving product:", error);
			alert("Erreur lors de la sauvegarde");
		}
	};

	const handleDelete = async (productId: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
			return;
		}

		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchProducts();
			} else {
				alert("Erreur lors de la suppression");
			}
		} catch (error) {
			console.error("Error deleting product:", error);
			alert("Erreur lors de la suppression");
		}
	};

	if (status === "loading" || loading) {
		return <div className="p-8">Chargement...</div>;
	}

	if (!session || session.user?.role !== "admin") {
		return null;
	}

	const filteredProducts =
		selectedCategory === "all"
			? products
			: products.filter((p) => p.categoryId === selectedCategory);

	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Gestion des Produits
							</h1>
							<p className="text-gray-600">
								Ajoutez, modifiez ou supprimez des produits
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<Link
								href="/admin/dashboard"
								className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
							>
								← Retour au tableau de bord
							</Link>
							<button
								onClick={openCreateModal}
								className="px-4 py-2 bg-patisserie-coral hover:bg-patisserie-yellow text-white rounded-lg transition-colors"
							>
								+ Nouveau Produit
							</button>
						</div>
					</div>

					{/* Category Filter */}
					<div className="flex items-center space-x-4">
						<span className="font-medium text-gray-700">Catégorie:</span>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
						>
							<option value="all">Toutes les catégories</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
						<span className="text-sm text-gray-500">
							{filteredProducts.length} produit(s)
						</span>
					</div>
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredProducts.map((product) => (
						<div
							key={product.id}
							className="bg-white rounded-lg shadow overflow-hidden"
						>
							<div className="relative w-full aspect-square bg-gray-200">
								{product.image && (
									<Image
										src={product.image}
										alt={product.name}
										fill
										className="object-cover"
									/>
								)}
								{!product.isAvailable && (
									<div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
										Non disponible
									</div>
								)}
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-lg mb-1">{product.name}</h3>
								<p className="text-sm text-gray-600 mb-2 line-clamp-2">
									{product.description}
								</p>
								<div className="flex items-center justify-between mb-3">
									<span className="font-bold text-patisserie-coral">
										{product.price.toFixed(2)}€
									</span>
									<span className="text-sm text-gray-500">
										Stock: {product.stock}
									</span>
								</div>
								<div className="text-xs text-gray-500 mb-3">
									{product.category?.name}
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => openEditModal(product)}
										className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
									>
										Modifier
									</button>
									<button
										onClick={() => handleDelete(product.id)}
										className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
									>
										Supprimer
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{filteredProducts.length === 0 && (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500">Aucun produit trouvé</p>
					</div>
				)}

				{/* Modal */}
				{showModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
						<div className="bg-white rounded-lg max-w-3xl w-full my-8">
							<div className="p-6 border-b">
								<h2 className="text-2xl font-bold">
									{editingProduct ? "Modifier le produit" : "Nouveau produit"}
								</h2>
							</div>
							<form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
								{/* Basic Info */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											Nom du produit *
										</label>
										<input
											type="text"
											required
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Catégorie *
										</label>
										<select
											required
											value={formData.categoryId}
											onChange={(e) =>
												setFormData({ ...formData, categoryId: e.target.value })
											}
											className="w-full px-3 py-2 border rounded-lg"
										>
											<option value="">Sélectionner...</option>
											{categories.map((cat) => (
												<option key={cat.id} value={cat.id}>
													{cat.name}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										Description courte *
									</label>
									<textarea
										required
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										rows={2}
										className="w-full px-3 py-2 border rounded-lg"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										Description longue
									</label>
									<textarea
										value={formData.longDescription}
										onChange={(e) =>
											setFormData({ ...formData, longDescription: e.target.value })
										}
										rows={4}
										className="w-full px-3 py-2 border rounded-lg"
									/>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											Prix (€) *
										</label>
										<input
											type="number"
											step="0.01"
											required
											value={formData.price}
											onChange={(e) =>
												setFormData({ ...formData, price: parseFloat(e.target.value) })
											}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Stock</label>
										<input
											type="number"
											value={formData.stock}
											onChange={(e) =>
												setFormData({ ...formData, stock: parseInt(e.target.value) })
											}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Ordre d'affichage
										</label>
										<input
											type="number"
											value={formData.displayOrder}
											onChange={(e) =>
												setFormData({
													...formData,
													displayOrder: parseInt(e.target.value),
												})
											}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										URL de l'image *
									</label>
									<input
										type="text"
										required
										placeholder="/images/products/..."
										value={formData.image}
										onChange={(e) =>
											setFormData({ ...formData, image: e.target.value })
										}
										className="w-full px-3 py-2 border rounded-lg"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Placez l'image dans /public/images/products/ et entrez le chemin
										relatif
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											Ingrédients
										</label>
										<textarea
											value={formData.ingredients}
											onChange={(e) =>
												setFormData({ ...formData, ingredients: e.target.value })
											}
											rows={2}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Allergènes
										</label>
										<textarea
											value={formData.allergens}
											onChange={(e) =>
												setFormData({ ...formData, allergens: e.target.value })
											}
											rows={2}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											Conservation
										</label>
										<input
											type="text"
											placeholder="ex: 3 jours au réfrigérateur"
											value={formData.storage}
											onChange={(e) =>
												setFormData({ ...formData, storage: e.target.value })
											}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Temps de préparation (heures)
										</label>
										<input
											type="number"
											value={formData.preparationTime}
											onChange={(e) =>
												setFormData({
													...formData,
													preparationTime: parseInt(e.target.value),
												})
											}
											className="w-full px-3 py-2 border rounded-lg"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										Options de taille (JSON)
									</label>
									<textarea
										value={formData.sizeOptions}
										onChange={(e) =>
											setFormData({ ...formData, sizeOptions: e.target.value })
										}
										rows={3}
										placeholder='["6 parts", "8 parts", "10 parts"]'
										className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Format JSON. Ex: ["6 parts", "8 parts", "10 parts"]
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										Produits associés (JSON)
									</label>
									<textarea
										value={formData.relatedProductIds}
										onChange={(e) =>
											setFormData({ ...formData, relatedProductIds: e.target.value })
										}
										rows={3}
										placeholder='["cmip260pd00030ztfiatult06", "cmip2816z00050ztfw0h59vpg"]'
										className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Format JSON. Liste des IDs de produits associés. Ex: ["id1", "id2", "id3"]
									</p>
								</div>

								<div className="flex items-center space-x-6">
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={formData.isAvailable}
											onChange={(e) =>
												setFormData({ ...formData, isAvailable: e.target.checked })
											}
											className="mr-2"
										/>
										<span className="text-sm">Disponible à la vente</span>
									</label>
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={formData.availableForPickup}
											onChange={(e) =>
												setFormData({
													...formData,
													availableForPickup: e.target.checked,
												})
											}
											className="mr-2"
										/>
										<span className="text-sm">Disponible pour retrait</span>
									</label>
								</div>

								<div className="flex justify-end space-x-3 pt-4 border-t">
									<button
										type="button"
										onClick={() => setShowModal(false)}
										className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
									>
										Annuler
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-patisserie-coral hover:bg-patisserie-yellow text-white rounded-lg transition-colors"
									>
										{editingProduct ? "Mettre à jour" : "Créer"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
