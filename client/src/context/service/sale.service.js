import { api } from "./api";

export const saleApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createSale: builder.mutation({
            query: (body) => ({
                url: "/sale/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Sale"],
        }),

        getSales: builder.query({
            query: () => ({
                url: "/sales",
                method: "GET",
            }),
            providesTags: ["Sale"],
        }),

        payDebt: builder.mutation({
            query: ({ id, body }) => ({
                url: `/sale/payment/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Sale"],
        }),
    }),
});

export const {
    useCreateSaleMutation,
    useGetSalesQuery,
    usePayDebtMutation,
} = saleApi;
