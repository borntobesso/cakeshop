'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'

interface CheckoutFormProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (orderDetails: OrderDetails) => Promise<boolean>
}

interface OrderDetails {
  customerName: string
  email: string
  phone: string
  pickupDate: string
  pickupTime: string
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

export default function CheckoutForm({ isOpen, onClose, onConfirm }: CheckoutFormProps) {
  useCart()
  const [formData, setFormData] = useState<OrderDetails>({
    customerName: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: ''
  })

  const [errors, setErrors] = useState<Partial<OrderDetails>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Partial<OrderDetails> = {}
    if (!formData.customerName) newErrors.customerName = 'Le nom est requis'
    if (!formData.email) newErrors.email = 'L\'email est requis'
    if (!formData.phone) newErrors.phone = 'Le numéro de téléphone est requis'
    if (!formData.pickupDate) newErrors.pickupDate = 'La date de retrait est requise'
    if (!formData.pickupTime) newErrors.pickupTime = 'L\'heure de retrait est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      const success = await onConfirm(formData)
      setIsSubmitting(false)
      if (success) {
        onClose()
      } else {
        // TODO : display an error message in the modal
      }
    }
  }

  const getMinDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    return date.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date.toISOString().split('T')[0]
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Détails de la commande
                </DialogTitle>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                    )}
                  </div>

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
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
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
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date de retrait
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-patisserie-coral focus:ring-patisserie-coral"
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
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.pickupTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.pickupTime}</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      onClick={onClose}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-patisserie-coral px-4 py-2 text-sm font-medium text-white hover:bg-patisserie-yellow"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span className="ml-2">Traitement...</span>
                        </div>
                      ) : (
                        'Confirmer la commande'
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 