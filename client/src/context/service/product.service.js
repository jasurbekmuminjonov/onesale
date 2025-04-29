import { api } from "./api";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/product/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    getProductByBarcode: builder.query({
      query: (barcode) => ({
        url: `/product/barcode?barcode=${barcode}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    getProductByName: builder.query({
      query: (name) => ({
        url: `/product/name?name=${encodeURIComponent(name)}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/product/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],

    }),
    updateProductStock: builder.mutation({
      query: (body) => ({
        url: `/product/stock`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],

    }),
  }),
});

export const {
  useCreateProductMutation,
  useLazyGetProductByBarcodeQuery,
  useLazyGetProductByNameQuery,
  useUpdateProductMutation,
  useUpdateProductStockMutation,
} = productApi;
