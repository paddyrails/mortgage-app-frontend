import axios from 'axios';
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
} from '../types';

const API_BASE = {
  CUSTOMERS: '/api/customers',
  PROPERTIES: '/api/properties',
  APPLICATIONS: '/api/applications',
};

// Helper function to extract array from response
// Handles both direct array responses and wrapped responses like { data: [...] } or { items: [...] }
function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    
    // Check common wrapper properties
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.value)) return obj.value;  // OData format
    if (Array.isArray(obj.$values)) return obj.$values;  // .NET format sometimes
    
    // Log unexpected format for debugging
    console.warn('API response is not an array:', response);
  }
  
  // Return empty array as fallback to prevent .filter() errors
  return [];
}

// Helper function to extract single item from response
function extractItem<T>(response: unknown): T {
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    
    // Check if it's wrapped
    if (obj.data && typeof obj.data === 'object') return obj.data as T;
    if (obj.item && typeof obj.item === 'object') return obj.item as T;
    if (obj.result && typeof obj.result === 'object') return obj.result as T;
  }
  
  return response as T;
}

// Customer Service
export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await axios.get(API_BASE.CUSTOMERS);
    return extractArray<Customer>(data);
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await axios.get(`${API_BASE.CUSTOMERS}/${id}`);
    return extractItem<Customer>(data);
  },

  create: async (customer: CreateCustomerRequest): Promise<Customer> => {
    const { data } = await axios.post(API_BASE.CUSTOMERS, customer);
    return extractItem<Customer>(data);
  },

  update: async (id: string, customer: UpdateCustomerRequest): Promise<Customer> => {
    const { data } = await axios.put(`${API_BASE.CUSTOMERS}/${id}`, customer);
    return extractItem<Customer>(data);
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE.CUSTOMERS}/${id}`);
  },
};

// Property Service
export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    const { data } = await axios.get(API_BASE.PROPERTIES);
    return extractArray<Property>(data);
  },

  getById: async (id: string): Promise<Property> => {
    const { data } = await axios.get(`${API_BASE.PROPERTIES}/${id}`);
    return extractItem<Property>(data);
  },

  create: async (property: CreatePropertyRequest): Promise<Property> => {
    const { data } = await axios.post(API_BASE.PROPERTIES, property);
    return extractItem<Property>(data);
  },

  update: async (id: string, property: UpdatePropertyRequest): Promise<Property> => {
    const { data } = await axios.put(`${API_BASE.PROPERTIES}/${id}`, property);
    return extractItem<Property>(data);
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE.PROPERTIES}/${id}`);
  },
};

// Loan Application Service
export const loanApplicationService = {
  getAll: async (): Promise<LoanApplication[]> => {
    const { data } = await axios.get(API_BASE.APPLICATIONS);
    return extractArray<LoanApplication>(data);
  },

  getById: async (id: string): Promise<LoanApplication> => {
    const { data } = await axios.get(`${API_BASE.APPLICATIONS}/${id}`);
    return extractItem<LoanApplication>(data);
  },

  create: async (application: CreateLoanApplicationRequest): Promise<LoanApplication> => {
    const { data } = await axios.post(API_BASE.APPLICATIONS, application);
    return extractItem<LoanApplication>(data);
  },

  update: async (id: string, application: UpdateLoanApplicationRequest): Promise<LoanApplication> => {
    const { data } = await axios.put(`${API_BASE.APPLICATIONS}/${id}`, application);
    return extractItem<LoanApplication>(data);
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE.APPLICATIONS}/${id}`);
  },
};
