"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GateauxEvenementielsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "",
    guestCount: "",
    message: "",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Limit to 5 images
    if (files.length + selectedImages.length > 5) {
      alert("Vous ne pouvez télécharger que 5 images maximum");
      return;
    }

    // Check file sizes (max 5MB per image)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Chaque image ne doit pas dépasser 5 MB");
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const convertImageToBase64 = (file: File): Promise<{
    filename: string;
    content: string;
    contentType: string;
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          filename: file.name,
          content: reader.result as string,
          contentType: file.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Convert images to base64
      const images = await Promise.all(
        selectedImages.map((file) => convertImageToBase64(file))
      );

      const response = await fetch("/api/contact/event-cakes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message:
            "Votre demande a été envoyée avec succès ! Nous vous contacterons dans les plus brefs délais.",
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          eventDate: "",
          eventType: "",
          guestCount: "",
          message: "",
        });
        setSelectedImages([]);
        setImagePreviews([]);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitStatus({
          type: "error",
          message:
            "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Gâteaux Événementiels
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Créations sur mesure pour vos événements spéciaux : mariages,
            anniversaires, baptêmes, entreprises... Nous donnons vie à vos rêves
            les plus gourmands.
          </p>
        </div>

        {/* Success/Error Message */}
        {submitStatus.type && (
          <div
            className={`mb-8 p-4 rounded-lg ${
              submitStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className="font-medium">{submitStatus.message}</p>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            Formulaire de Contact
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                />
              </div>
            </div>

            {/* Event Information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Informations sur l&apos;Événement
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date de l&apos;événement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={minDate}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="eventType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Type d&apos;événement <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Mariage">Mariage</option>
                    <option value="Anniversaire">Anniversaire</option>
                    <option value="Baptême">Baptême</option>
                    <option value="Événement d'entreprise">
                      Événement d&apos;entreprise
                    </option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="guestCount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre d&apos;invités <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    placeholder="Ex: 50"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Décrivez votre projet <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Parlez-nous de votre projet de gâteau : thème, couleurs, saveurs préférées, design souhaité, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images de référence (optionnel)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Vous pouvez joindre jusqu&apos;à 5 images (5 MB max par image)
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={selectedImages.length >= 5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-patisserie-coral focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-patisserie-mint file:text-gray-700 hover:file:bg-patisserie-yellow"
              />

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-patisserie-yellow rounded-lg p-6 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Délais de Commande
                  </h3>
                  <p className="text-sm text-gray-700">
                    Merci de nous contacter{" "}
                    <strong>au moins 2 semaines à l&apos;avance</strong> pour vos
                    commandes événementielles afin de garantir la disponibilité
                    et la qualité de nos créations sur mesure.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-patisserie-coral hover:bg-patisserie-yellow transition-colors duration-300 text-gray-900 font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  "Envoyer ma demande"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-patisserie-mint rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Autres Moyens de Contact
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="font-medium text-gray-700 mb-2">Par Téléphone</p>
              <a
                href="tel:+33140210455"
                className="text-lg font-semibold text-gray-900 hover:text-patisserie-coral transition-colors"
              >
                01 40 21 04 55
              </a>
              <p className="text-sm text-gray-600 mt-1">
                Mardi - Vendredi: 8h30 - 19h00
              </p>
              <p className="text-sm text-gray-600">
                Samedi - Dimanche: 9h30 - 19h00
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">Par Email</p>
              <a
                href="mailto:fupatisserie@gmail.com"
                className="text-lg font-semibold text-gray-900 hover:text-patisserie-coral transition-colors"
              >
                fupatisserie@gmail.com
              </a>
              <p className="text-sm text-gray-600 mt-1">
                Réponse sous 24h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
