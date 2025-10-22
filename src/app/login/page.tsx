"use client";

import { Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
	const [formData, setFormData] = useState({
		identifier: "", // Can be email or phone
		password: ""
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	
	const router = useRouter();
	const searchParams = useSearchParams();
	const message = searchParams.get("message");
	
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
		
		try {
			const result = await signIn("credentials", {
				identifier: formData.identifier,
				password: formData.password,
				redirect: false
			});
			
			if (result?.error) {
				setError("Email/téléphone ou mot de passe incorrect")
			} else {
				// Success login : session verification and redirect
				const session = await getSession();
				if (session?.user?.role === "admin") {
					router.push("/admin")
				} else {
					router.push("/")
				}
			}
		} catch {
			setError("Une erreur est survenue lors de la connexion");
		} finally {
			setIsLoading(false);
		}
	}
	
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Connexion
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Ou{" "}
						<Link href="/register" className="font-medium text-patisserie-coral hover:text-patisserie-yellow">
							créez votre compte
						</Link>
					</p>
				</div>
				
				{message && (
					<div className="rounded-md bg-green-50 p-4">
						<div className="text-sm text-green-700">{message}</div>
					</div>
				)}
				
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-md bg-red-50 p-4">
							<div className="text-sm text-red-700">{error}</div>
						</div>
					)}
					
					<div className="space-y-4">
						<div>
							<label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
								Email ou téléphone
							</label>
							<input
								id="identifier"
								name="identifier"
								type="text"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-patisserie-coral focus:border-patisserie-coral focus:z-10 sm:text-sm"
								placeholder="votre@email.com ou 06 12 34 56 78"
								value={formData.identifier}
								onChange={handleChange}
							/>
						</div>
						
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Mot de passe
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
					</div>
					
					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Connexion en cours..." : "Se connecter"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
			<LoginForm />
		</Suspense>
	);
}