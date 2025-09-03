/**
 * Validate Hiboutik print API response
 */
export function validatePrintResult(printResult: any): { success: boolean; error?: string } {
  // Check if response exists
  if (!printResult) {
    return { success: false, error: "No response from printer API" };
  }

  // Check for explicit success indicators
  if (printResult.document_printed === 1) {
    return { success: true };
  }

  // Check for error messages first
  if (printResult.error) {
    return { success: false, error: `Printer API error: ${printResult.error}` };
  }

  // Check for specific printer status indicators (before generic document_printed check)
  if (printResult.printer_status === "offline") {
    return { success: false, error: "Printer is offline" };
  }

  if (printResult.printer_status === "no_paper") {
    return { success: false, error: "Printer out of paper" };
  }

  // Check for known failure patterns
  if (printResult.document_printed === 0) {
    return { success: false, error: "Printer failed to print document (document_printed: 0)" };
  }

  // Check for network/connection issues
  if (printResult.connection_failed || printResult.timeout) {
    return { success: false, error: "Printer connection failed or timeout" };
  }

  // If document_printed field is missing but no errors, warn but allow
  if (printResult.document_printed === undefined) {
    console.warn("Print result missing document_printed field:", printResult);
    return { success: true }; // Assume success if no explicit failure
  }

  // Any other falsy document_printed value
  if (!printResult.document_printed) {
    return { success: false, error: `Print failed: document_printed = ${printResult.document_printed}` };
  }

  return { success: true };
}