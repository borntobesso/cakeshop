"use client";

import { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";

interface CustomAlertDialogProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
	type?: "success" | "error" | "info"
}

export default function CustomAlertDialog({ isOpen, onClose, title, message, type = "info" }: CustomAlertDialogProps) {
	const getColors = (type: "success" | "error" | "info") => {
		switch (type) {
			case "success":
				return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
			case "error":
				return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
			case "info":
			default:
				return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" };
		}
	};
	
	const colors = getColors(type);
	
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-[9999]" onClose={onClose}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-40" />
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
							<DialogPanel className={`w-full max-w-sm transform overflow-hidden rounded-2xl ${colors.bg} p-6 text-left align-middle shadow-xl transition-all border ${colors.border}`}>
								<DialogTitle as="h3" className={`text-lg font-medium leading-6 ${colors.text}`}>
									{title}
								</DialogTitle>
								<div className="mt-2">
									<p className={`text-sm ${colors.text}`}>
										{message}
									</p>
								</div>
								
								<div className="mt-4 flex justify-end">
									<button
										type="button"
										className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
											${type === "success" ? "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500" : ""}
											${type === "error" ? "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500" : ""}
											${type === "info" ? "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500" : ""}
										`}
										onClick={onClose}
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
	);
}