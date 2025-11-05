"use client";

import { useState } from "react";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
	const [formData, setFormData] = useState({
		identifier: "",
		password: ""
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	
	const router = useRouter();
	
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
	};
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		
		try {
			const result = await signIn("credentials", {
				identifier: formData.identifier,
				password: formData.password,
				redirect: false
			});
			
			if (result?.error) {
				setError("Identifiant ou mot de passe incorrect");
			} else {
				// Successful login - admin role verification
				const session = await getSession(); 
				if (session?.user?.role === "admin") {
					router.push("/admin/dashboard")
				} else {
					setError("Accès administrateur requis");
					await signOut({ redirect: false });
				}
			}
		} catch {
			setError("Une erreur est survenue lors de la connexion");
		} finally {
			setIsLoading(false);
		}
	};
	
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-x-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-white">
						Administration
					</h2>
					<p className="mt-2 text-center text-sm text-gray-400">
						Accès réservé aux administrateurs
					</p>
				</div>
				
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-md bg-red-50 p-4">
							<div className="text-sm text-red-700">{error}</div>
						</div>
					)}
					
					<div className="space-y-4">
						<div>
							<label htmlFor="identifier" className="block text-sm font-medium text-white">
								Email ou téléphone administrateur
							</label>
							<input
								id="identifier"
								name="identifier"
								type="text"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
								placeholder="admin@fupatisserie.com ou 06 12 34 56 78"
								value={formData.identifier}
								onChange={handleChange}
							/>
						</div>
						
						<div>
							<label htmlFor="password" className="block test-sm font-medium text-white">
								Mot de passe
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
								placeholder="Mot de passe administrateur"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
					</div>
					
					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Connexion en cours..." : "Accès Administration"}
						</button>
					</div>
					
					<div className="text-center">
						<Link href="/login" className="text-sm text-gray-400 hover:text-white">
							← Retour à la connexion normale
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}