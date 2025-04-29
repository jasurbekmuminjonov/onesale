import { api } from "./api";

export const importApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createImport: builder.mutation({
            query: (body) => ({
                url: "/import/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Import"],
        }),

        getImports: builder.query({
            query: () => ({
                url: "/imports",
                method: "GET",
            }),
            providesTags: ["Import"],
        }),

        completeImport: builder.mutation({
            query: ({ id }) => ({
                url: `/import/complete/${id}`,
                method: "PUT"
            }),
            invalidatesTags: ["Import"],
        }),

        cancelImport: builder.mutation({
            query: ({ id }) => ({
                url: `/import/cancel/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Import"],
        }),

        payImportDebt: builder.mutation({
            query: ({ id, body }) => ({
                url: `/import/payment/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Import"],
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
