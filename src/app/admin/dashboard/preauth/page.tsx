"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface PreAuthOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalAmount: number;
  preAuthAmount: number;
  preAuthStatus: string;
  preAuthExpiresAt: string;
  pickupDate: string;
  pickupTime: string;
  createdAt: string;
}

export default function PreAuthManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<PreAuthOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchPreAuthOrders();
  }, [session, status, router]);

  const fetchPreAuthOrders = async () => {
    try {
      const response = await fetch('/api/admin/preauth');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching pre-auth orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: 'capture' | 'release') => {
    setActionLoading(orderId);

    try {
      const endpoint = action === 'capture' ? '/api/preauth/capture' : '/api/preauth/release';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        // Refresh the orders list
        await fetchPreAuthOrders();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'captured': return 'text-blue-600 bg-blue-100';
      case 'released': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'authorized': return 'Autorisé';
      case 'pending': return 'En attente';
      case 'captured': return 'Capturé';
      case 'released': return 'Libéré';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Pré-Autorisations
              </h1>
              <p className="text-gray-600">
                Gérez les pré-autorisations bancaires des nouveaux clients
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Aucune pré-autorisation en attente</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retrait
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail}
                          </div>
                          {order.customerPhone && (
                            <div className="text-sm text-gray-500">
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(order.pickupDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.pickupTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.preAuthAmount.toFixed(2)}€
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.preAuthStatus)}`}>
                          {getStatusText(order.preAuthStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.preAuthStatus === 'authorized' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(order.id, 'release')}
                              disabled={actionLoading === order.id}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading === order.id ? '...' : 'Libérer'}
                            </button>
                            <button
                              onClick={() => handleAction(order.id, 'capture')}
                              disabled={actionLoading === order.id}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              {actionLoading === order.id ? '...' : 'Capturer'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li><strong>Libérer</strong>: Le client est venu et a payé (peu importe le moyen) → Annule la pré-autorisation</li>
            <li><strong>Capturer</strong>: Le client ne s'est pas présenté → Charge le montant pré-autorisé comme compensation</li>
            <li>Les pré-autorisations expirent automatiquement après 7 jours si aucune action n'est prise</li>
          </ul>
        </div>

        <div className="mt-6">
          <a
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  );
}