"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  firstName?: string;
  lastName?: string;
  items: any[];
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

type SortField = "orderNumber" | "customerName" | "pickupTime" | "totalAmount" | "pickupDate";
type SortDirection = "asc" | "desc";

export default function AdminOrdersTablePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("pickupDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Available products for filter (extracted from orders)
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "admin") {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session && session.user?.role === "admin") {
      fetchOrders();
    }
  }, [session]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [orders, startDate, endDate, searchCustomer, selectedProduct, selectedStatus, sortField, sortDirection]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);

        // Extract unique product names
        const productSet = new Set<string>();
        data.orders.forEach((order: Order) => {
          const items = order.items as any[];
          items.forEach((item) => {
            if (item.name) {
              productSet.add(item.name);
            }
          });
        });
        setAvailableProducts(Array.from(productSet).sort());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...orders];

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (order) => new Date(order.pickupDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (order) => new Date(order.pickupDate) <= endDateTime
      );
    }

    // Customer name filter
    if (searchCustomer) {
      const search = searchCustomer.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(search) ||
          order.firstName?.toLowerCase().includes(search) ||
          order.lastName?.toLowerCase().includes(search)
      );
    }

    // Product name filter
    if (selectedProduct) {
      filtered = filtered.filter((order) => {
        const items = order.items as any[];
        return items.some((item) => item.name === selectedProduct);
      });
    }

    // Status filter
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "orderNumber":
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case "customerName":
          aValue = a.customerName || `${a.firstName} ${a.lastName}`;
          bValue = b.customerName || `${b.firstName} ${b.lastName}`;
          break;
        case "pickupTime":
          aValue = a.pickupTime;
          bValue = b.pickupTime;
          break;
        case "pickupDate":
          aValue = new Date(a.pickupDate).getTime();
          bValue = new Date(b.pickupDate).getTime();
          break;
        case "totalAmount":
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredOrders(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToExcel = async () => {
    try {
      // Dynamically import xlsx
      const XLSX = await import("xlsx");

      // Prepare data for export
      const exportData = filteredOrders.map((order) => ({
        "Numéro de commande": order.orderNumber,
        "Client": order.customerName || `${order.firstName} ${order.lastName}`,
        "Email": order.customerEmail,
        "Téléphone": order.customerPhone,
        "Date de retrait": new Date(order.pickupDate).toLocaleDateString("fr-FR"),
        "Heure de retrait": order.pickupTime,
        "Articles": (order.items as any[])
          .map((item) => `${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ""}`)
          .join(", "),
        "Montant total": `${order.totalAmount.toFixed(2)}€`,
        "Paiement": order.paymentMethod === "online" ? "En ligne" : "Sur place",
        "Statut": order.status,
        "Date de création": new Date(order.createdAt).toLocaleDateString("fr-FR"),
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Commandes");

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.min(
          Math.max(
            key.length,
            ...exportData.map((row) => String(row[key as keyof typeof row]).length)
          ),
          maxWidth
        ),
      }));
      ws["!cols"] = colWidths;

      // Generate filename with date range
      const filename = `commandes${startDate ? `_${startDate}` : ""}${
        endDate ? `_${endDate}` : ""
      }_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Export
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Erreur lors de l'export. Veuillez réessayer.");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchCustomer("");
    setSelectedProduct("");
    setSelectedStatus("all");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 text-patisserie-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-patisserie-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau des Commandes
          </h1>
          <p className="text-gray-600">
            Filtrez, triez et exportez vos commandes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
              />
            </div>

            {/* Customer Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche client
              </label>
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Nom du client..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
              />
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produit
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
              >
                <option value="">Tous les produits</option>
                {availableProducts.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="completed">Complété</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Effacer les filtres
            </button>

            <div className="flex space-x-3">
              <div className="text-sm text-gray-600">
                {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}
              </div>
              <button
                onClick={exportToExcel}
                disabled={filteredOrders.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exporter Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("orderNumber")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>N° Commande</span>
                      <SortIcon field="orderNumber" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Client</span>
                      <SortIcon field="customerName" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("pickupDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date retrait</span>
                      <SortIcon field="pickupDate" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("pickupTime")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Heure</span>
                      <SortIcon field="pickupTime" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("totalAmount")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Montant</span>
                      <SortIcon field="totalAmount" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName || `${order.firstName} ${order.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.pickupDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.pickupTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {(order.items as any[]).map((item, idx) => (
                            <div key={idx} className="text-xs">
                              {item.quantity}x {item.name}
                              {item.size ? ` (${item.size})` : ""}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.totalAmount.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.paymentMethod === "online"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.paymentMethod === "online" ? "Payé" : "Sur place"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
