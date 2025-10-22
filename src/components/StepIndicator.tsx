"use client"

interface Step {
  id: number
  name: string
  description: string
}

interface StepIndicatorProps {
  currentStep: number
  steps: Step[]
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className="relative flex-1 flex flex-col items-center"
            >
              {/* Line connector */}
              {stepIdx !== steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full flex items-center" aria-hidden="true">
                  <div
                    className={`h-0.5 w-full ${
                      step.id < currentStep ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}

              {/* Step circle */}
              <div className="relative flex items-center justify-center z-10">
                {step.id < currentStep ? (
                  // Completed step
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : step.id === currentStep ? (
                  // Current step
                  <div className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-blue-600" />
                  </div>
                ) : (
                  // Future step
                  <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-gray-300" />
                  </div>
                )}

              </div>

              {/* Step label */}
              <div className="mt-3 text-center">
                <div
                  className={`text-xs sm:text-sm font-medium ${
                    step.id <= currentStep ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {step.description}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}