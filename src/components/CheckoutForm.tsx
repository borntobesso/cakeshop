"use client"

import { useState, useCallback, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { Fragment } from "react"
import PaymentOptions from "./PaymentOptions";
import { stripePromise } from "@/lib/stripe-client";
import CustomAlertDialog from "./CustomAlertDialog";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"


interface CheckoutFormProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderDetails: OrderDetails) => Promise<{ success: boolean; orderId?: string }>
}

interface OrderDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  pickupDate: string
  pickupTime: string
  paymentMethod: "online" | "onsite"
  specialCode?: string
}

type OrderErrors = {
  [K in keyof OrderDetails]?: string
}

// Time slots based on day type
const getTimeSlots = (isWeekend: boolean) => {
  const startHour = isWeekend ? 9.5 : 8.5; // 9:30 for weekend, 8:30 for weekday
  const slots = [];

  for (let hour = startHour; hour <= 19; hour += 2) {
    const wholeHour = Math.floor(hour);
    const minutes = (hour % 1) * 60;
    const timeString = `${wholeHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    slots.push(timeString);
  }

  return slots;
};

export default function CheckoutForm({ isOpen, onClose, onConfirm }: CheckoutFormProps) {
  const { items, getTotalPrice } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  // Calculate the maximum preparation time needed for all items in cart
  const getMaxPreparationTime = () => {
    let maxPrepTime = 24; // Default minimum 24 hours

    items.forEach(item => {
      // Each cart item should have preparationTime from the product
      const itemPrepTime = (item as any).preparationTime || 24;
      console.log("item: ", item);
      if (itemPrepTime > maxPrepTime) {
        maxPrepTime = itemPrepTime;
      }
    });
    console.log("Max Preparation Time: ", maxPrepTime);
    return maxPrepTime;
  };

  const [formData, setFormData] = useState<OrderDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    paymentMethod: "online"
  });

  const [errors, setErrors] = useState<OrderErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    specialCode: "",
    isCodeValid: false,
    isFirstTimeUser: false
  });
  
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
    shouldCloseMainForm: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    shouldCloseMainForm: false
  });

  // Get time slots based on selected pickup date
  const getAvailableTimeSlots = () => {
    if (!formData.pickupDate) return [];

    const selectedDate = new Date(formData.pickupDate);
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6; // Sunday = 0, Saturday = 6

    return getTimeSlots(isWeekend);
  };

  // Helper function to convert date string to local Date object (avoiding timezone issues)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // Helper function to format Date object to YYYY-MM-DD string in local timezone
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter function to disable Mondays and dates before minimum prep time
  const isDateAvailable = (date: Date) => {
    // Disable Mondays (1 = Monday)
    if (date.getDay() === 1) {
      return false;
    }

    // Disable dates before minimum preparation time
    const minDate = parseLocalDate(getMinDate());
    minDate.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate >= minDate;
  };

  // Handle pickup date change and reset time if needed
  const handlePickupDateChange = (date: Date | null) => {
    if (!date) {
      setFormData(prev => ({
        ...prev,
        pickupDate: "",
        pickupTime: ""
      }));
      return;
    }

    // Clear any previous error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.pickupDate;
      return newErrors;
    });

    // Format date as YYYY-MM-DD using local timezone (no UTC conversion)
    const formattedDate = formatLocalDate(date);

    setFormData(prev => ({
      ...prev,
      pickupDate: formattedDate,
      pickupTime: "" // Reset time when date changes
    }));
  };
  
  useEffect(() => {
    if (isOpen) {
        setShowValidationErrors(false);
        setErrors({});

        // Pre-fill form with user data if available
        setFormData({
            firstName: (session?.user as any)?.firstName || "",
            lastName: (session?.user as any)?.lastName || "",
            email: (session?.user as any)?.email || "",
            phone: (session?.user as any)?.phone || "",
            pickupDate: "",
            pickupTime: "",
            paymentMethod: "online"
        });

        setPaymentData({
            specialCode: "",
            isCodeValid: false,
            isFirstTimeUser: false
        });
        setAlertState({
            isOpen: false,
            title: "",
            message: "",
            type: "info",
            shouldCloseMainForm: false
        });
    }
  }, [isOpen, session]);

  const validateForm = () => {
    const newErrors: OrderErrors = {};

    if (!formData.firstName) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName) newErrors.lastName = "Le nom est requis";
    if (!formData.email) newErrors.email = "L\'email est requis";
    if (!formData.phone) newErrors.phone = "Le numéro de téléphone est requis";
    if (!formData.pickupDate) newErrors.pickupDate = "La date de retrait est requise";
    if (!formData.pickupTime) newErrors.pickupTime = "L\'heure de retrait est requise";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Le mode de paiement est requis";

    setErrors(newErrors);
    return (Object.keys(newErrors).length === 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm();
    
    if (!isValid) {
        setShowValidationErrors(true);
        return;
    }
    
    setShowValidationErrors(false);
    setIsSubmitting(true);
    
    try {
      if (formData.paymentMethod === "online") {
        await handleStripePayment();
      } else {
        // Onsite payment logic
        if (paymentData.isFirstTimeUser) {
          // For first-time users, go to pre-authorization
          await handlePreAuthorizationDirect();
        } else {
          // Regular onsite payment - create order normally
          const orderDetails = {
            ...formData,
            specialCode: paymentData.isCodeValid ? paymentData.specialCode : undefined
          };

          const result = await onConfirm(orderDetails);

          if (result.success) {
            setAlertState({
              isOpen: true,
              title: "Commande créée!",
              message: "Votre commande a été créée avec succès. Retour à l'accueil dans 15 secondes...",
              type: "success",
              shouldCloseMainForm: true
            });

            // Redirect to home after 5 seconds
            setTimeout(() => {
              router.push("/");
            }, 15000);
          } else {
            setAlertState({
              isOpen: true,
              title: "Erreur",
              message: "Une erreur est survenue lors de la création de la commande.",
              type: "error",
              shouldCloseMainForm: false
            });
          }
        }
      }
    } catch (error) {
      console.error("Payment error: ", error);
      setAlertState({
        isOpen: true,
        title: "Erreur de paiement",
        message: "Une erreur est survenue lors du traitement du paiement.",
        type: "error",
        shouldCloseMainForm: false
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleStripePayment = async () => {
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size
          })),
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            pickupDate: formData.pickupDate,
            pickupTime: formData.pickupTime
          },
          specialCode: paymentData.isCodeValid ? paymentData.specialCode : undefined,
          paymentMethod: formData.paymentMethod
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      
      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        // Or use Stripe.js
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({ sessionId });
        
        if (error) {
          throw error;
        }
      }
    } catch (error) {
        setAlertState({
            isOpen: true,
            title: "Erreur Stripe",
            message: "Une erreur est survenue lors de la redirection vers Stripe Checkout.",
            type: "error",
            shouldCloseMainForm: false
          });
        throw error;
    }
  }

  const handlePreAuthorizationDirect = async () => {
    try {
      // Create pre-authorization checkout session directly with order data (no order creation yet)
      const response = await fetch('/api/preauth/create-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Order details for later creation
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            pickupDate: formData.pickupDate,
            pickupTime: formData.pickupTime
          },
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size
          })),
          amount: getTotalPrice(),
          specialCode: paymentData.isCodeValid ? paymentData.specialCode : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Redirect to Stripe Checkout for pre-authorization
        if (data.url) {
          window.location.href = data.url
        } else {
          setAlertState({
            isOpen: true,
            title: "Erreur de redirection",
            message: "URL de redirection manquante pour la pré-autorisation.",
            type: "error",
            shouldCloseMainForm: false
          });
        }
      } else {
        const errorData = await response.json()
        setAlertState({
          isOpen: true,
          title: "Erreur de pré-autorisation",
          message: errorData.error || "Erreur lors de la création de la pré-autorisation",
          type: "error",
          shouldCloseMainForm: false
        });
      }
    } catch (error) {
      console.error("Pre-authorization direct error: ", error);
      setAlertState({
        isOpen: true,
        title: "Erreur de connexion",
        message: "Erreur de connexion lors de la création de la pré-autorisation",
        type: "error",
        shouldCloseMainForm: false
      });
    }
  }

  const handelPaymentMethodChange = (method: "online" | "onsite") => {
    setFormData({ ...formData, paymentMethod: method });
  }
  
  // Receive special code info from PaymentOptions component
    const handlePaymentDataChange = useCallback((data: { specialCode: string; isCodeValid: boolean; isFirstTimeUser: boolean; }) => {
        setPaymentData(data);
    }, []);
    
    const showCustomAlertFromChild = useCallback((title: string, message: string, type: "success" | "error" | "info", closeMainForm: boolean = false) => {
        setAlertState({ isOpen: true, title, message, type, shouldCloseMainForm: closeMainForm });
    }, []);

  const getMinDate = () => {
    const maxPrepTime = getMaxPreparationTime();
    const now = new Date();

    // Calculate minimum date by adding preparation time
    // We need to round up to the next full day if there's any time component
    const minDateTime = new Date(now.getTime() + (maxPrepTime * 60 * 60 * 1000));

    // Round up to the start of the next day if we're not at midnight
    // This ensures that if it's 2PM and we need 48 hours, we can't pick the day after tomorrow
    // (which would only be 34 hours away at 2PM)
    const minDate = new Date(minDateTime);
    if (minDateTime.getHours() > 0 || minDateTime.getMinutes() > 0 || minDateTime.getSeconds() > 0) {
      // Round up to next day
      minDate.setDate(minDate.getDate() + 1);
    }
    minDate.setHours(0, 0, 0, 0);

    // Skip Mondays (1 = Monday)
    while (minDate.getDay() === 1) {
      minDate.setDate(minDate.getDate() + 1);
    }

    return minDate.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3); // 3 months from now
    return date.toISOString().split("T")[0];
  }
  
  const handleClose = () => {
    setShowValidationErrors(false);
    setErrors({});
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      pickupDate: "",
      pickupTime: "",
      paymentMethod: "online"
    });
    setPaymentData({
      specialCode: "",
      isCodeValid: false,
      isFirstTimeUser: false
    });
    setAlertState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
        shouldCloseMainForm: false
    });
    onClose();
  }
  
  const handleCloseAlert = () => {
    const shouldAlsoCloseMainForm = alertState.shouldCloseMainForm;
    setAlertState(() => ({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
        shouldCloseMainForm: false
    }));
    if (shouldAlsoCloseMainForm)
        handleClose();
  }
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Détails de la commande
                </DialogTitle>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <PaymentOptions
                    totalAmount={getTotalPrice()}
                    selectedMethod={formData.paymentMethod}
                    onPaymentMethodChange={handelPaymentMethodChange}
                    onPaymentDataChange={handlePaymentDataChange}
                    showCustomAlert={showCustomAlertFromChild}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
                      />
                      {showValidationErrors && errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
                      />
                      {showValidationErrors && errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
                      />
                      {showValidationErrors && errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
                    />
                    {showValidationErrors && errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date de retrait
                      </label>
                      <DatePicker
                        selected={formData.pickupDate ? parseLocalDate(formData.pickupDate) : null}
                        onChange={handlePickupDateChange}
                        filterDate={isDateAvailable}
                        minDate={parseLocalDate(getMinDate())}
                        maxDate={parseLocalDate(getMaxDate())}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Sélectionnez une date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral px-3 py-2 border"
                        wrapperClassName="w-full"
                        calendarClassName="patisserie-calendar"
                      />
                      {errors.pickupDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.pickupDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Heure de retrait
                      </label>
                      <select
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
                      >
                        <option value="">Sélectionnez une heure</option>
                        {getAvailableTimeSlots().map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {showValidationErrors && errors.pickupTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.pickupTime}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      onClick={handleClose}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span className="ml-2">Traitement...</span>
                        </div>
                      ) : (
                        formData.paymentMethod === "online"
                          ? "Procéder au paiement"
                          : "Confirmer la commande"
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
      
      <CustomAlertDialog
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={handleCloseAlert}
      />
    </Transition>
  )
} 