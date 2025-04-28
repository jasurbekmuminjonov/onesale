import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
    }),

    createEmployee: builder.mutation({
      query: (body) => ({
        url: "/employee/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"]
    }),

    createCustomer: builder.mutation({
      query: (body) => ({
        url: "/customer/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"]
    }),

    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/supplier/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"]
    }),

    getStore: builder.query({
      query: () => ({
        url: "/store",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getEmployees: builder.query({
      query: () => ({
        url: "/employees",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getEmployee: builder.query({
      query: () => ({
        url: "/employee",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getCustomers: builder.query({
      query: () => ({
        url: "/customers",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getSuppliers: builder.query({
      query: () => ({
        url: "/suppliers",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useCreateEmployeeMutation,
  useCreateCustomerMutation,
  useCreateSupplierMutation,
  useGetStoreQuery,
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useGetCustomersQuery,
  useGetSuppliersQuery,
} = userApi;
