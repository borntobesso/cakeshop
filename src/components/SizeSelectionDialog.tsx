import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'

interface SizeOption {
  size: string
  price: number
}

interface SizeSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (size: string, price: number) => void
  productName: string
  sizeOptions?: SizeOption[]
  showLargeSizesOnly?: boolean
}

export default function SizeSelectionDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName, 
  sizeOptions = [],
  showLargeSizesOnly = false
}: SizeSelectionDialogProps) {
  const [selectedSize, setSelectedSize] = useState('')

  // Default fallback sizes if none provided
  const defaultSizeOptions = [
    { size: '4 parts', price: 22 },
    { size: '6 parts', price: 30 },
    { size: '8 parts', price: 38 },
    { size: '10 parts', price: 45 }
  ]

  // Use provided options or fallback to defaults
  const availableOptions = sizeOptions.length > 0 ? sizeOptions : defaultSizeOptions

  // Filter for large sizes if needed
  const filteredOptions = showLargeSizesOnly 
    ? availableOptions.filter(option => {
        const parts = parseInt(option.size.split(' ')[0])
        return parts >= 10
      })
    : availableOptions

  const handleConfirm = () => {
    const selectedOption = filteredOptions.find(option => option.size === selectedSize)
    if (selectedOption) {
      onConfirm(selectedSize, selectedOption.price)
    }
    onClose()
    setSelectedSize('')
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
                  Choisir la taille pour {productName}
                </DialogTitle>
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {filteredOptions.map((option) => (
                      <button
                        key={option.size}
                        onClick={() => setSelectedSize(option.size)}
                        className={`p-4 rounded-lg border-2 ${
                          selectedSize === option.size
                            ? 'border-patisserie-coral bg-patisserie-cream'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{option.size}</div>
                        <div className="text-sm text-gray-600">{option.price}€</div>
                      </button>
                    ))}
                  </div>
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
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-patisserie-coral px-4 py-2 text-sm font-medium text-white hover:bg-patisserie-yellow"
                    onClick={handleConfirm}
                    disabled={!selectedSize}
                  >
                    Confirmer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 