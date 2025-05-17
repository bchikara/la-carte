// src/types/payment.types.ts

export type PaymentGateway = 'layer' | 'razorpay'; // Add more as needed

export interface PaymentInitiationMetadata {
  email_id: string;
  contact_number: string;
  order_details?: string; 
}

export interface PaymentInitiationPayload {
  amount: number; 
  currency: 'INR'; 
  metadata: PaymentInitiationMetadata;
  receipt?: string; 
}

export interface BackendPaymentResponse {
  id: string; 
}

export interface PaymentSDKResponse {
  status: 'captured' | 'pending' | 'cancelled' | 'failed' | string; 
  payment_id?: string; 
  order_id?: string; 
  signature?: string; 
  message?: string; 
  [key: string]: any;
}

// Details needed by _handlePlaceOrderAfterPayment
export interface OrderPlacementContext {
  restaurantId: string;
  tableId: string | null;
}

export interface PaymentStoreState {
  isProcessingPayment: boolean;
  paymentError: string | null;
  paymentSuccessData: {
    paymentId: string;
    paymentStatus: string;
    orderId?: string; 
    signature?: string; 
  } | null;
  redirectToConfirmationPath: string | null; 
}

export interface PaymentStoreActions {
  initiatePaymentAndCheckout: (
    payload: PaymentInitiationPayload,
    orderPlacementDetails: OrderPlacementContext // Use the defined interface
  ) => Promise<void>; 
  
  // Declare the internal helper method in the actions type
  _handlePlaceOrderAfterPayment: (
    paymentId: string,
    paymentStatus: string,
    context: OrderPlacementContext // Use the defined interface
  ) => Promise<boolean>;
  
  clearPaymentStatus: () => void;
  setRedirectToConfirmationPath: (path: string | null) => void;
}

export type PaymentStore = PaymentStoreState & PaymentStoreActions;

export interface LayerCheckoutOptions {
  token: string;
  accesskey: string;
  theme?: {
    logo?: string;
    color?: string;
    error_color?: string;
  };
}
export type LayerSuccessCallback = (response: PaymentSDKResponse) => void;
export type LayerErrorCallback = (error: any) => void;

export interface RazorpayOptions {
    key: string;
    amount: number; 
    currency: string;
    name: string; 
    description: string;
    image?: string; 
    order_id: string; 
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, any>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}
