declare module 'expo-cafebazaar-billing' {
  interface ConnectOptions {
    rsaPublicKey: string;
  }

  interface PurchaseResult {
    purchaseToken?: string;
    productId?: string;
    orderId?: string;
    purchaseTime?: number;
  }

  const CafeBazaarBilling: {
    connect: (options: ConnectOptions) => Promise<void>;
    disconnect: () => Promise<void>;
    subscribeProduct: (productId: string) => Promise<PurchaseResult>;
    getPurchasedSubscriptions?: () => Promise<Array<{ productId: string; purchaseToken: string }>>;
  };

  export default CafeBazaarBilling;
}

declare module '@cafebazaar/react-native-poolakey' {
  export function connect(rsaPublicKey: string): Promise<void>;
  export function disconnect(): Promise<void>;
  export function subscribeProduct(productId: string): Promise<{ purchaseToken: string; productId: string }>;
  export function getAllSubscribedProducts(): Promise<Array<{ productId: string; purchaseToken: string }>>;
}
