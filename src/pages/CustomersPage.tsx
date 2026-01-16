import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import type { Customer, CreateCustomerRequest, Column } from '../types';
import { customerService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button, Modal, Input, ConfirmDialog, LoadingSpinner } from '../components/ui';

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  socialSecurityNumber: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      dateOfBirth: customer.dateOfBirth.split('T')[0],
      socialSecurityNumber: customer.socialSecurityNumber || '',
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
      </div>
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
        <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
      </div>
      <Input label="SSN (Optional)" error={errors.socialSecurityNumber?.message} {...register('socialSecurityNumber')} />
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{customer ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export const CustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsCreateOpen(false);
      toast.success('Customer created');
    },
    onError: () => toast.error('Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCustomerRequest }) =>
      customerService.update(id, { id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingCustomer(null);
      toast.success('Customer updated');
    },
    onError: () => toast.error('Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeletingCustomer(null);
      toast.success('Customer deleted');
    },
    onError: () => toast.error('Failed to delete customer'),
  });

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {c.firstName[0]}{c.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-white">{c.firstName} {c.lastName}</p>
            <p className="text-xs text-slate-500">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', sortable: true },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      sortable: true,
      render: (c) => format(new Date(c.dateOfBirth), 'MMM d, yyyy'),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (c) => format(new Date(c.createdAt), 'MMM d, yyyy'),
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400">Manage your customer database</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
          Add Customer
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        keyExtractor={(c) => c.id}
        onEdit={setEditingCustomer}
        onDelete={setDeletingCustomer}
        searchPlaceholder="Search customers..."
        emptyTitle="No customers"
        emptyDescription="Add your first customer to get started."
        emptyIcon={<Users className="w-12 h-12" />}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Customer" size="lg">
        <CustomerForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setIsCreateOpen(false)} isLoading={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="Edit Customer" size="lg">
        {editingCustomer && (
          <CustomerForm
            customer={editingCustomer}
            onSubmit={(data) => updateMutation.mutate({ id: editingCustomer.id, data })}
            onCancel={() => setEditingCustomer(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={() => deletingCustomer && deleteMutation.mutate(deletingCustomer.id)}
        title="Delete Customer"
        message={`Delete ${deletingCustomer?.firstName} ${deletingCustomer?.lastName}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
