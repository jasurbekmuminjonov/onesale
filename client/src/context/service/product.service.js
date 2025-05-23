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
  query: ({ barcode, page = 1, limit = 10 }) => ({
    url: `/product/barcode?barcode=${encodeURIComponent(barcode)}&page=${page}&limit=${limit}`,
    method: "GET",
  }),
  providesTags: ["Product"],
}),

    getProductByPage: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/product?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    getProductByName: builder.query({
      query: ({ name, page = 1, limit = 10 }) => ({
        url: `/product/name?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`,
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
  useLazyGetProductByPageQuery
} = productApi;
