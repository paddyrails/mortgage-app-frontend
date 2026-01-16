import axios from "axios";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  LoanApplication,
  CreateLoanApplicationRequest,
  UpdateLoanApplicationRequest,
} from "../types";

const API_BASE = {
  CUSTOMERS: import.meta.env.VITE_CUSTOMER_SERVICE_URL + "/api/customers",
  PROPERTIES: import.meta.env.VITE_PROPERTY_SERVICE_URL + "/api/properties",
  APPLICATIONS:
    import.meta.env.VITE_APPLICATION_SERVICE_URL + "/api/applications",
};

// Customer Service
export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await axios.get<Customer[]>(API_BASE.CUSTOMERS);
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await axios.get<Customer>(`${API_BASE.CUSTOMERS}/${id}`);
    return data;
  },

  create: async (customer: CreateCustomerRequest): Promise<Customer> => {
    const { data } = await axios.post<Customer>(API_BASE.CUSTOMERS, customer);
    return data;
  },

  update: async (
    id: string,
    customer: UpdateCustomerRequest,
  ): Promise<Customer> => {
    const { data } = await axios.put<Customer>(
      `${API_BASE.CUSTOMERS}/${id}`,
      customer,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE.CUSTOMERS}/${id}`);
  },
};

// Property Service
export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    const { data } = await axios.get<Property[]>(API_BASE.PROPERTIES);
    return data;
  },

  getById: async (id: string): Promise<Property> => {
    const { data } = await axios.get<Property>(`${API_BASE.PROPERTIES}/${id}`);
    return data;
  },

  create: async (property: CreatePropertyRequest): Promise<Property> => {
    const { data } = await axios.post<Property>(API_BASE.PROPERTIES, property);
    return data;
  },

  update: async (
    id: string,
    property: UpdatePropertyRequest,
  ): Promise<Property> => {
    const { data } = await axios.put<Property>(
      `${API_BASE.PROPERTIES}/${id}`,
      property,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE.PROPERTIES}/${id}`);
  },
};

// Loan Application Service
export const loanApplicationService = {
  getAll: async (): Promise<LoanApplication[]> => {
    const { data } = await axios.get<LoanApplication[]>(API_BASE.APPLICATIONS);
    return data;
  },

  getById: async (id: string): Promise<LoanApplication> => {
    const { data } = await axios.get<LoanApplication>(
      `${API_BASE.APPLICATIONS}/${id}`,
    );
    return data;
  },

  create: async (
    application: CreateLoanApplicationRequest,
  ): Promise<LoanApplication> => {
    const { data } = await axios.post<LoanApplication>(
      API_BASE.APPLICATIONS,
      application,
    );
    return data;
  },

  update: async (
    id: string,
    application: UpdateLoanApplicationRequest,
  ): Promise<LoanApplication> => {
    const { data } = await axios.put<LoanApplication>(
      `${API_BASE.APPLICATIONS}/${id}`,
      application,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE.APPLICATIONS}/${id}`);
  },
};
