import { api } from "./api";

export const returnApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createReturn: builder.mutation({
            query: (body) => ({
                url: "/return/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Return"],
        }),

        getReturns: builder.query({
            query: () => ({
                url: "/returns",
                method: "GET",
            }),
            providesTags: ["Return"],
        })
    })
});

export const {
    useCreateReturnMutation,
    useGetReturnsQuery,
} = returnApi;