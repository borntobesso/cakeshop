"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: any[];
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  status: string;
}

interface OrdersByDate {
  [date: string]: Order[];
}

export default function AdminCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersByDate, setOrdersByDate] = useState<OrdersByDate>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
  }, [session, currentDate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get first and last day of current month
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await fetch(
        `/api/admin/orders?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setOrdersByDate(data.ordersByDate);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getOrdersForDate = (date: Date | null) => {
    if (!date) return [];
    const dateKey = date.toISOString().split("T")[0];
    return ordersByDate[dateKey] || [];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Calendrier des Commandes
              </h1>
              <p className="text-gray-600">
                Vue mensuelle des préparations et retraits
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

        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              ← Mois précédent
            </button>

            <h2 className="text-2xl font-semibold capitalize">{monthYear}</h2>

            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Mois suivant →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, index) => {
              const dayOrders = getOrdersForDate(date);
              const orderCount = dayOrders.length;
              const dateKey = date?.toISOString().split("T")[0];

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    date
                      ? "bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      : "bg-gray-50"
                  } ${
                    isToday(date) ? "ring-2 ring-patisserie-coral" : ""
                  } ${
                    selectedDate === dateKey ? "bg-patisserie-mint" : ""
                  }`}
                  onClick={() => date && setSelectedDate(dateKey!)}
                >
                  {date && (
                    <>
                      <div className="text-right text-sm font-semibold mb-1">
                        {date.getDate()}
                      </div>
                      {orderCount > 0 && (
                        <div
                          className={`text-xs font-medium px-2 py-1 rounded-full text-center ${
                            orderCount >= 5
                              ? "bg-red-100 text-red-800"
                              : orderCount >= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {orderCount} commande{orderCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && ordersByDate[selectedDate] && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">
                Commandes du{" "}
                {new Date(selectedDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {ordersByDate[selectedDate]
                .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime))
                .map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {order.customerName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Commande #{order.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-patisserie-coral">
                          {order.pickupTime}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.totalAmount.toFixed(2)}€
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h5 className="font-medium text-sm text-gray-700 mb-2">
                        Articles:
                      </h5>
                      <ul className="space-y-1">
                        {order.items.map((item: any, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex justify-between"
                          >
                            <span>
                              {item.quantity}x {item.name}
                              {item.size ? ` (${item.size})` : ""}
                            </span>
                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t mt-3 pt-3 flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Tél: {order.customerPhone}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.paymentMethod === "online"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.paymentMethod === "online" ? "Payé en ligne" : "Paiement sur place"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
