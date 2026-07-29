import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../baseQuery";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Vendor,
  VendorDetail,
  CreateVendorDto,
  UpdateVendorDto,
  VendorFilters,
  VendorsApiResponse,
  SingleVendorApiResponse,
} from "@/types/vendor.types";

// All endpoints here are superadmin-only (backend returns 403 otherwise).
export const vendorsApi = createApi({
  reducerPath: "vendorsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Vendors", "Vendor"],
  endpoints: (builder) => ({
    // List vendors (?isActive, ?search)
    getVendors: builder.query<Vendor[], VendorFilters | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params && params.isActive !== undefined)
          searchParams.append("isActive", String(params.isActive));
        if (params && params.search) searchParams.append("search", params.search);
        const qs = searchParams.toString();
        return `${API_ENDPOINTS.VENDORS}${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: VendorsApiResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((v) => ({ type: "Vendor" as const, id: v.id })),
              { type: "Vendors" as const, id: "LIST" },
            ]
          : [{ type: "Vendors" as const, id: "LIST" }],
    }),

    // Get one vendor (+ owned counts and brands)
    getVendor: builder.query<VendorDetail, number>({
      query: (id) => API_ENDPOINTS.VENDOR_BY_ID(id),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Vendor", id }],
    }),

    // Create a vendor (auto email-verified, active)
    createVendor: builder.mutation<VendorDetail, CreateVendorDto>({
      query: (body) => ({
        url: API_ENDPOINTS.VENDORS,
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: [{ type: "Vendors", id: "LIST" }],
    }),

    // Update profile (company name, contact name, phone)
    updateVendor: builder.mutation<
      VendorDetail,
      { id: number; data: UpdateVendorDto }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.VENDOR_BY_ID(id),
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    // Activate / deactivate (deactivate = instant access revocation + products hidden)
    setVendorStatus: builder.mutation<
      VendorDetail,
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: API_ENDPOINTS.VENDOR_STATUS(id),
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (response: SingleVendorApiResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    // Assign which brands this vendor owns
    setVendorBrands: builder.mutation<
      { vendorId: number; brandIds: number[] },
      { id: number; brandIds: number[] }
    >({
      query: ({ id, brandIds }) => ({
        url: API_ENDPOINTS.VENDOR_BRANDS(id),
        method: "PUT",
        body: { brandIds },
      }),
      transformResponse: (response: { data: { vendorId: number; brandIds: number[] } }) =>
        response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useSetVendorStatusMutation,
  useSetVendorBrandsMutation,
} = vendorsApi;
