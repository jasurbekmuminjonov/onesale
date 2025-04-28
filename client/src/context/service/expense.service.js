import { api } from "./api";

export const expenseApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createExpense: builder.mutation({
            query: (body) => ({
                url: "/expense/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Expense"],
        }),

        getExpenses: builder.query({
            query: () => ({
                url: "/expenses",
                method: "GET",
            }),
            providesTags: ["Expense"],
        })
    })
});

export const {
    useCreateExpenseMutation,
    useGetExpensesQuery,
} = expenseApi;