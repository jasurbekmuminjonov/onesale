import { api } from "./api";

export const saleApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createSale: builder.mutation({
            query: (body) => ({
                url: "/sale/create",
                method: "POST",
                body,
            }),
        }),

        getSales: builder.query({
            query: () => ({
                url: "/sales",
                method: "GET",
            }),
        }),

        payDebt: builder.mutation({
            query: ({ id, body }) => ({
                url: `/sale/payment/${id}`,
                method: "PUT",
                body,
            }),
        }),
    }),
});

export const {
    useCreateSaleMutation,
    useGetSalesQuery,
    usePayDebtMutation,
} = saleApi;
