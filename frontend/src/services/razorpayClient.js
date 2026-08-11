let scriptPromise;

export async function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    throw new Error("Checkout is only available in the browser.");
  }

  if (window.Razorpay) {
    return window.Razorpay;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-razorpay-checkout="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Razorpay));
        existing.addEventListener("error", () =>
          reject(new Error("Secure checkout script could not be loaded."))
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpayCheckout = "true";
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () =>
        reject(new Error("Secure checkout script could not be loaded."));
      document.body.appendChild(script);
    }).catch((error) => {
      scriptPromise = null;
      throw error;
    });
  }

  return scriptPromise;
}
