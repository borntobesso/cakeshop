interface OrderDetails {
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  totalPrice: number;
}

export async function sendOrderConfirmation(orderDetails: OrderDetails) {
  try {
    console.log("Sending order confirmation with data:", orderDetails);

    // Use the full URL path
    const url = `${window.location.origin}/api/notifications`;
    console.log("Making request to:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to send notifications");
    }

    return true;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return false;
  }
}
