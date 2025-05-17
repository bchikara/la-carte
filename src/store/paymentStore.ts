// src/store/paymentStore.ts
import { create } from 'zustand';
import {
  PaymentStore, // This type now includes _handlePlaceOrderAfterPayment
  PaymentInitiationPayload,
  PaymentSDKResponse,
  OrderPlacementContext, // Make sure this is imported or defined
} from '../types/payment.types'; // Adjust path
import * as paymentService from '../services/paymentService'; // Adjust path
import { useUserStore } from './userStore';         // Adjust path
import { useCartStore } from './cartStore';         // Adjust path
import { useRestaurantStore } from './restaurantStore'; // Adjust path
import restaurantService from '../services/restaurantService'; // For direct calls if needed

// OrderPlacementContext should be defined in payment.types.ts, ensure it's imported
// If not, define it here or in a shared types file:
// interface OrderPlacementContext {
//   restaurantId: string;
//   tableId: string | null;
// }

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  isProcessingPayment: false,
  paymentError: null,
  paymentSuccessData: null,
  redirectToConfirmationPath: null,

  initiatePaymentAndCheckout: async (payload, orderPlacementContext) => {
    set({ isProcessingPayment: true, paymentError: null, paymentSuccessData: null, redirectToConfirmationPath: null });

    try {
      const backendResponse = await paymentService.initiatePaymentOrder(payload);
      
      paymentService.processWithLayer(
        backendResponse.id, 
        async (sdkResponse: PaymentSDKResponse) => { 
          console.log("Layer SDK Success:", sdkResponse);
          set({ paymentSuccessData: {
              paymentId: sdkResponse.payment_id || 'N/A',
              paymentStatus: sdkResponse.status,
          }});

          if (sdkResponse.status === "captured" || sdkResponse.status === "pending") {
            // Call the correctly typed _handlePlaceOrderAfterPayment
            const orderPlaced = await get()._handlePlaceOrderAfterPayment(
              sdkResponse.payment_id || `layer_${Date.now()}`, 
              sdkResponse.status,
              orderPlacementContext
            );
            if (orderPlaced) {
                set({ 
                    isProcessingPayment: false, 
                    redirectToConfirmationPath: orderPlacementContext.tableId
                        ? `/confirm/${orderPlacementContext.restaurantId}?table=${orderPlacementContext.tableId}`
                        : `/confirm/${orderPlacementContext.restaurantId}`
                });
            } else {
                 set({ isProcessingPayment: false, paymentError: "Order placement failed after payment." });
            }
          } else {
            set({ 
                isProcessingPayment: false, 
                paymentError: `Payment ${sdkResponse.status}: ${sdkResponse.message || 'Please try again.'}` 
            });
          }
        },
        (sdkError: any) => { 
          console.error("Layer SDK Error:", sdkError);
          set({ 
              isProcessingPayment: false, 
              paymentError: sdkError.message || "Payment failed via Layer. Please try again." 
          });
        }
      );
    } catch (error: any) {
      console.error("Error in payment checkout process:", error);
      set({ isProcessingPayment: false, paymentError: error.message || "An unexpected error occurred during payment." });
    }
  },

  // Implementation of _handlePlaceOrderAfterPayment
  _handlePlaceOrderAfterPayment: async (
    paymentId: string,
    paymentStatus: string,
    context: OrderPlacementContext // Type imported from payment.types.ts
  ): Promise<boolean> => {
    const { currentUser } = useUserStore.getState();
    const { cart, clearCart, getCartTotalAmount } = useCartStore.getState();
    const { currentRestaurant } = useRestaurantStore.getState();

    if (!currentUser || !context.restaurantId || Object.keys(cart).length === 0) {
      console.error("Missing data for order placement:", { currentUser, context, cart });
      return false;
    }

    const cartListForOrder = Object.values(cart);
    // Assuming getCartTotalAmount() and registered logic are correct from cartStore and restaurantStore
    const baseTotalAmount = getCartTotalAmount();
    const gst = currentRestaurant?.registered ? baseTotalAmount * 0.05 : 0;
    const finalOrderAmount = baseTotalAmount + gst;


    const orderProducts: Record<string, { name: string; quantity: number; price: number; }> = {};
    cartListForOrder.forEach(item => {
        orderProducts[item.productKey] = { // Ensure productKey is the correct identifier
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        };
    });

    const orderPayload = {
        products: orderProducts,
        time: Date.now(),
        totalPrice: parseFloat(finalOrderAmount.toFixed(2)),
        user: currentUser.key, // Assuming currentUser.key is the UID
        status: paymentStatus === 'captured' ? 'confirmed' : 'pending_payment', 
        paymentId: paymentId,
        paymentStatus: paymentStatus,
        restaurantId: context.restaurantId,
        restaurantName: currentRestaurant?.name || "N/A",
        table: context.tableId || 'Takeaway/Delivery'
    };

    try {
      // Ensure addUserOrder in userStore expects the correct payload structure
      await useUserStore.getState().addUserOrder(currentUser.key, orderPayload as any); 
      
      if (context.tableId && currentRestaurant) {
        // Ensure addOrderToTable in restaurantService expects the correct payload
        await restaurantService.addOrderToTable({id: currentRestaurant.id, tableId: context.tableId}, orderPayload as any);
      } else if (currentRestaurant) {
        // Ensure addOrderToRestaurant in restaurantService expects the correct payload
        await restaurantService.addOrderToRestaurant({id: currentRestaurant.id}, orderPayload as any);
      }
      
      clearCart();
      return true;
    } catch (orderError) {
      console.error("Error placing order in database:", orderError);
      return false;
    }
  },

  clearPaymentStatus: () => {
    set({ paymentError: null, paymentSuccessData: null, redirectToConfirmationPath: null, isProcessingPayment: false });
  },
  setRedirectToConfirmationPath: (path: string | null) => { // Ensure path can be null
    set({ redirectToConfirmationPath: path });
  }
}));
