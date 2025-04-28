import { api } from "./api";

export const importApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createImport: builder.mutation({
            query: (body) => ({
                url: "/import/create",
                method: "POST",
                body,
            }),
        }),

        getImports: builder.query({
            query: () => ({
                url: "/imports",
                method: "GET",
            }),
        }),

        completeImport: builder.mutation({
            query: ({ id, body }) => ({
                url: `/import/complete/${id}`,
                method: "PUT",
                body,
            }),
        }),

        cancelImport: builder.mutation({
            query: ({ id }) => ({
                url: `/import/cancel/${id}`,
                method: "PUT",
            }),
        }),

        payImportDebt: builder.mutation({
            query: ({ id, body }) => ({
                url: `/import/payment/${id}`,
                method: "PUT",
                body,
            }),
        }),
    }),
});

export const {
    useCreateImportMutation,
    useGetImportsQuery,
    useCompleteImportMutation,
    useCancelImportMutation,
    usePayImportDebtMutation,
} = importApi;
