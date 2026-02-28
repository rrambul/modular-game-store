// Type declarations for federated remote modules
// These modules are resolved at build time by Zephyr / Module Federation

declare module 'cart/CartWidget' {
  const CartWidget: React.ComponentType<Record<string, unknown>>;
  export default CartWidget;
}

declare module 'cart/CartPage' {
  const CartPage: React.ComponentType<Record<string, unknown>>;
  export default CartPage;
}

declare module 'reviews/ReviewList' {
  const ReviewList: React.ComponentType<{ gameId?: string }>;
  export default ReviewList;
}

declare module 'reviews/ReviewForm' {
  const ReviewForm: React.ComponentType<{ gameId?: string }>;
  export default ReviewForm;
}

declare module 'reviews/ReviewSummary' {
  const ReviewSummary: React.ComponentType<{ gameId?: string }>;
  export default ReviewSummary;
}
