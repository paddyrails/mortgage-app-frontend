// Customer Types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  socialSecurityNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  socialSecurityNumber?: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}

// Property Types
export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  estimatedValue: number;
  listingPrice?: number;
  status: PropertyStatus;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PropertyType = 'SingleFamily' | 'Condo' | 'Townhouse' | 'MultiFamily' | 'Land';
export type PropertyStatus = 'Available' | 'UnderContract' | 'Sold' | 'OffMarket';

export interface CreatePropertyRequest {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  estimatedValue: number;
  listingPrice?: number;
  status: PropertyStatus;
  description?: string;
}

export interface UpdatePropertyRequest extends CreatePropertyRequest {
  id: string;
}

// Loan Application Types
export interface LoanApplication {
  id: string;
  customerId: string;
  propertyId: string;
  loanType: LoanType;
  loanAmount: number;
  downPayment: number;
  interestRate?: number;
  termMonths: number;
  status: LoanStatus;
  applicationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type LoanType = 'Conventional' | 'FHA' | 'VA' | 'USDA' | 'Jumbo';
export type LoanStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Denied' | 'Closed' | 'Funded';

export interface CreateLoanApplicationRequest {
  customerId: string;
  propertyId: string;
  loanType: LoanType;
  loanAmount: number;
  downPayment: number;
  termMonths: number;
  notes?: string;
}

export interface UpdateLoanApplicationRequest extends CreateLoanApplicationRequest {
  id: string;
  status: LoanStatus;
  interestRate?: number;
}

// Table Column Type
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}
