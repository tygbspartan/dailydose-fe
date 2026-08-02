import { wishlistApi } from "./features/wishlist/wishlistApi";
import { dashboardApi } from "./features/dashboard/dashboardApi";
import { heroApi } from "./features/hero/heroApi";
import { combineReducers, configureStore, type Action } from "@reduxjs/toolkit";
import { authApi } from "./features/auth/authApi";
import { productsApi } from "./features/products/productsApi";
import { categoriesApi } from "./features/categories/categoriesApi";
import { brandsApi } from "./features/brands/brandsApi";
import { ordersApi } from "./features/orders/ordersApi";
import { discountsApi } from "./features/discounts/discountsApi";
import { reviewsApi } from "./features/reviews/reviewsApi";
import { cartApi } from "./features/cart/cartApi";
import { checkoutApi } from "./features/checkout/checkoutApi";
import { vendorsApi } from "./features/vendors/vendorsApi";
import authReducer from "./features/auth/authSlice";
import uiReducer from "./features/ui/uiSlice";
import guestCartReducer from "./features/cart/guestCartSlice";
import guestWishlistReducer from "./features/wishlist/guestWishlistSlice";

// All RTK Query API slices — reset on logout so a new session never sees the
// previous user's cached data (e.g. another vendor's products/orders).
const apis = [
  authApi,
  productsApi,
  categoriesApi,
  brandsApi,
  ordersApi,
  discountsApi,
  reviewsApi,
  dashboardApi,
  cartApi,
  wishlistApi,
  checkoutApi,
  heroApi,
  vendorsApi,
];

const appReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  guestCart: guestCartReducer,
  guestWishlist: guestWishlistReducer,
  [authApi.reducerPath]: authApi.reducer,
  [productsApi.reducerPath]: productsApi.reducer,
  [categoriesApi.reducerPath]: categoriesApi.reducer,
  [brandsApi.reducerPath]: brandsApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [discountsApi.reducerPath]: discountsApi.reducer,
  [reviewsApi.reducerPath]: reviewsApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [wishlistApi.reducerPath]: wishlistApi.reducer,
  [checkoutApi.reducerPath]: checkoutApi.reducer,
  [heroApi.reducerPath]: heroApi.reducer,
  [vendorsApi.reducerPath]: vendorsApi.reducer,
});

type AppState = ReturnType<typeof appReducer>;

const rootReducer = (
  state: AppState | undefined,
  action: Action,
): AppState => {
  // On logout, drop every cached API slice so the next login starts clean.
  if (action.type === "auth/logout" && state) {
    const cleared = { ...state } as Record<string, unknown>;
    for (const api of apis) {
      delete cleared[api.reducerPath];
    }
    return appReducer(cleared as unknown as AppState, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      categoriesApi.middleware,
      brandsApi.middleware,
      ordersApi.middleware,
      discountsApi.middleware,
      reviewsApi.middleware,
      dashboardApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      checkoutApi.middleware,
      heroApi.middleware,
      vendorsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
