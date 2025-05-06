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
        createDailySale: builder.mutation({
            query: () => ({
                url: "/sale/daily/create",
                method: "POST",
                body: {},
            }),
            invalidatesTags: ["Sale"],
        }),
        endDailySale: builder.mutation({
            query: () => ({
                url: "/sale/daily/end",
                method: "PUT",
                body: {},
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
        getDailySale: builder.query({
            query: () => ({
                url: "/sale/daily",
                method: "GET",
            }),
            providesTags: ["Sale"],
        }),
        getDailySales: builder.query({
            query: () => ({
                url: "/sale/daily/all",
                method: "GET",
            }),
            providesTags: ["Sale"],
        }),
        getSalesByDate: builder.query({
            query: ({ start, end }) => ({
                url: `/sales/date?start=${start}&end=${end}`,
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
    useLazyGetSalesByDateQuery,
    useCreateDailySaleMutation,
    useEndDailySaleMutation,
    useGetDailySaleQuery,
    useGetDailySalesQuery
} = saleApi;
