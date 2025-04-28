import { api } from "./api";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/product/create",
        method: "POST",
        body,
      }),
    }),

    getProductByBarcode: builder.query({
      query: (barcode) => ({
        url: `/product/${barcode}`,
        method: "GET",
      }),
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/product/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetProductByBarcodeQuery,
  useUpdateProductMutation,
} = productApi;
