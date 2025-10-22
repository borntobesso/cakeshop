"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
	const [formData, setFormData ] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: ""
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	
	const router = useRouter();
	
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}))
	}
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		
		// Confirm password
		if (formData.password !== formData.confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			setIsLoading(false);
			return;
		}
		
		// Basic validation
		if (!formData.firstName || !formData.lastName || !formData.password) {
			setError("Le prénom, nom et mot de passe sont obligatoires");
			setIsLoading(false);
			return;
		}

		// Email OR phone validation
		if (!formData.email && !formData.phone) {
			setError("Veuillez fournir au moins un email ou un numéro de téléphone");
			setIsLoading(false);
			return;
		}
		
		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					phone: formData.phone,
					password: formData.password
				}),
			});
			
			if (response.ok) {
				console.log(response);
				router.push("/login?message=Compte créé avec succès");
			} else {
				const data = await response.json();
				setError(data.error || "Une erreur est survenue");
			}
		} catch {
			setError("Une erreur est survenue lors de la création du compte");
		} finally {
			setIsLoading(false);
		}
	}
	
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Créer votre compte en 30 secondes
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Ou{" "}
						<Link href="/login" className="font-medium text-patisserie-coral hover:text-patisserie-yellow">
							connectez-vous à votre compte existant
						</Link>
					</p>
				</div>
				
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-md bg-red-50 p-4">
							<div className="text-sm text-red-700">{error}</div>
						</div>
					)}
					
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
									Prénom *
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									required
									className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
									placeholder="Votre prénom"
									value={formData.firstName}
									onChange={handleChange}
								/>
							</div>
							<div>
								<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
									Nom *
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									required
									className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
									placeholder="Votre nom"
									value={formData.lastName}
									onChange={handleChange}
								/>
							</div>
						</div>
						
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Adresse email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
								placeholder="votre@email.com"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
								Numéro de téléphone
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
								placeholder="06 12 34 56 78"
								value={formData.phone}
								onChange={handleChange}
							/>
						</div>

						<p className="text-xs text-gray-500">
							* Veuillez fournir au moins un email ou un numéro de téléphone
						</p>
						
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Mot de passe *
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
								placeholder="Mot de passe"
								value={formData.password}
								onChange={handleChange}
							/>	
						</div>
						
						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
								Confirmer le mot de passe *
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
								placeholder="Confirmer le mot de passe"
								value={formData.confirmPassword}
								onChange={handleChange}
							/>
						</div>
					</div>
					
					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Création en cours..." : "Créer mon compte"}
						</button>
					</div>
				</form>
			</div>
		</div>	
	);
}