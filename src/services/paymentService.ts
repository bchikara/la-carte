// src/services/paymentService.ts
import axios from 'axios';
import { 
    PaymentInitiationPayload, 
    BackendPaymentResponse,
    LayerCheckoutOptions,
    LayerSuccessCallback,
    LayerErrorCallback,
    RazorpayOptions
} from '../types/payment.types'; // Adjust path as needed

// Ensure Layer and Razorpay are declared on window if loaded via script tags
declare global {
  interface Window {
    Layer?: {
      checkout: (
        options: LayerCheckoutOptions,
        successCallback: LayerSuccessCallback,
        errorCallback: LayerErrorCallback
      ) => void;
    };
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; };
  }
}

const PAYMENT_API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'https://us-central1-la-carte-4fa10.cloudfunctions.net/api/payment'; // Default from your code
const LAYER_ACCESS_KEY = process.env.REACT_APP_LAYER_ACCESS_KEY || ""; // Default from your code
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || ""; // Default from your code

/**
 * Loads an external script dynamically.
 * @param src - The URL of the script to load.
 * @returns A promise that resolves to true if loaded successfully, false otherwise.
 */
export const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve(true); // Script already loaded
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        resolve(false);
      };
      document.body.appendChild(script);
    });
};


/**
 * Initiates payment with your backend to get an order ID or token (e.g., for Layer).
 */
export const initiatePaymentOrder = async (
  payload: PaymentInitiationPayload
): Promise<BackendPaymentResponse> => {
  try {
    // Adjust the URL and payload structure as per your backend API
    const response = await axios.post<BackendPaymentResponse>(PAYMENT_API_URL, payload);
    if (!response.data || !response.data.id) {
        throw new Error("Invalid response from payment initiation API.");
    }
    return response.data;
  } catch (error) {
    console.error("Error initiating payment order with backend:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to initiate payment with backend.');
    }
    throw new Error('Failed to initiate payment. Please check your connection or try again later.');
  }
};

/**
 * Loads and invokes the Layer Checkout SDK.
 */
export const processWithLayer = (
  token: string,
  successCallback: LayerSuccessCallback,
  errorCallback: LayerErrorCallback
): void => {
  if (window.Layer) {
    const layerOptions: LayerCheckoutOptions = {
      token: token,
      accesskey: LAYER_ACCESS_KEY, // Use environment variable
      theme: {
        logo: process.env.REACT_APP_THEME_LOGO_URL || "https://witera.tech/wp-content/uploads/2023/07/86x86.png",
        color: process.env.REACT_APP_THEME_COLOR || "#e08f00",
        error_color: "#ff2b2b"
      }
    };
    window.Layer.checkout(layerOptions, successCallback, errorCallback);
  } else {
    console.error("Layer SDK not loaded.");
    errorCallback({ message: "Payment gateway (Layer) not available. Please try again later." });
  }
};


/**
 * Loads and invokes the Razorpay Checkout SDK.
 * This assumes your backend has already created a Razorpay order and you have the order_id.
 */
export const processWithRazorpay = async (
    options: Omit<RazorpayOptions, 'key'> // Key will be added from env
): Promise<void> => {
    const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!sdkLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
    }

    if (!window.Razorpay) {
        throw new Error("Razorpay SDK not available even after attempting to load.");
    }
    
    const razorpayOptions: RazorpayOptions = {
        ...options,
        key: RAZORPAY_KEY_ID, // Use environment variable
    };

    const paymentObject = new window.Razorpay(razorpayOptions);
    paymentObject.open();
};
