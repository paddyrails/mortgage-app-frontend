import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Building2, Bed, Bath, Square } from 'lucide-react';
import toast from 'react-hot-toast';

import type { Property, CreatePropertyRequest, PropertyStatus, Column } from '../types';
import { propertyService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button, Modal, Input, Select, TextArea, ConfirmDialog, Badge, LoadingSpinner } from '../components/ui';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2).max(2, 'Use 2-letter state code'),
  zipCode: z.string().min(5, 'ZIP is required'),
  propertyType: z.enum(['SingleFamily', 'Condo', 'Townhouse', 'MultiFamily', 'Land']),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  squareFeet: z.coerce.number().min(1),
  yearBuilt: z.coerce.number().min(1800).max(new Date().getFullYear()),
  estimatedValue: z.coerce.number().min(1),
  listingPrice: z.coerce.number().optional(),
  status: z.enum(['Available', 'UnderContract', 'Sold', 'OffMarket']),
  description: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyTypeOptions = [
  { value: 'SingleFamily', label: 'Single Family' },
  { value: 'Condo', label: 'Condo' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'MultiFamily', label: 'Multi Family' },
  { value: 'Land', label: 'Land' },
];

const statusOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'UnderContract', label: 'Under Contract' },
  { value: 'Sold', label: 'Sold' },
  { value: 'OffMarket', label: 'Off Market' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const getStatusVariant = (status: PropertyStatus): 'success' | 'warning' | 'danger' | 'info' => {
  const map: Record<PropertyStatus, 'success' | 'warning' | 'danger' | 'info'> = {
    Available: 'success', UnderContract: 'warning', Sold: 'info', OffMarket: 'danger'
  };
  return map[status];
};

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property || { propertyType: 'SingleFamily', status: 'Available' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Street Address" error={errors.address?.message} {...register('address')} />
      <div className="grid grid-cols-3 gap-4">
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State" maxLength={2} error={errors.state?.message} {...register('state')} />
        <Input label="ZIP" error={errors.zipCode?.message} {...register('zipCode')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Property Type" options={propertyTypeOptions} error={errors.propertyType?.message} {...register('propertyType')} />
        <Select label="Status" options={statusOptions} error={errors.status?.message} {...register('status')} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Input label="Beds" type="number" min={0} error={errors.bedrooms?.message} {...register('bedrooms')} />
        <Input label="Baths" type="number" min={0} step={0.5} error={errors.bathrooms?.message} {...register('bathrooms')} />
        <Input label="Sq Ft" type="number" min={1} error={errors.squareFeet?.message} {...register('squareFeet')} />
        <Input label="Year Built" type="number" error={errors.yearBuilt?.message} {...register('yearBuilt')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Estimated Value ($)" type="number" min={1} error={errors.estimatedValue?.message} {...register('estimatedValue')} />
        <Input label="Listing Price ($)" type="number" min={0} error={errors.listingPrice?.message} {...register('listingPrice')} />
      </div>
      <TextArea label="Description" rows={3} {...register('description')} />
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{property ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export const PropertiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setIsCreateOpen(false); toast.success('Property created'); },
    onError: () => toast.error('Failed to create property'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePropertyRequest }) => propertyService.update(id, { id, ...data }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setEditingProperty(null); toast.success('Property updated'); },
    onError: () => toast.error('Failed to update property'),
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setDeletingProperty(null); toast.success('Property deleted'); },
    onError: () => toast.error('Failed to delete property'),
  });

  const columns: Column<Property>[] = [
    {
      key: 'address',
      header: 'Property',
      sortable: true,
      render: (p) => (
        <div>
          <p className="font-medium text-white">{p.address}</p>
          <p className="text-xs text-slate-500">{p.city}, {p.state} {p.zipCode}</p>
        </div>
      ),
    },
    {
      key: 'propertyType',
      header: 'Type',
      sortable: true,
      render: (p) => p.propertyType.replace(/([A-Z])/g, ' $1').trim(),
    },
    {
      key: 'details',
      header: 'Details',
      render: (p) => (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{p.bathrooms}</span>
          <span className="flex items-center gap-1"><Square className="w-4 h-4" />{p.squareFeet.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'estimatedValue',
      header: 'Value',
      sortable: true,
      render: (p) => <span className="font-semibold text-emerald-400">{formatCurrency(p.estimatedValue)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => <Badge variant={getStatusVariant(p.status)}>{p.status.replace(/([A-Z])/g, ' $1').trim()}</Badge>,
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-slate-400">Manage property listings</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>Add Property</Button>
      </div>

      <DataTable
        data={properties}
        columns={columns}
        keyExtractor={(p) => p.id}
        onEdit={setEditingProperty}
        onDelete={setDeletingProperty}
        searchPlaceholder="Search properties..."
        emptyTitle="No properties"
        emptyDescription="Add your first property."
        emptyIcon={<Building2 className="w-12 h-12" />}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Property" size="xl">
        <PropertyForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setIsCreateOpen(false)} isLoading={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!editingProperty} onClose={() => setEditingProperty(null)} title="Edit Property" size="xl">
        {editingProperty && (
          <PropertyForm
            property={editingProperty}
            onSubmit={(data) => updateMutation.mutate({ id: editingProperty.id, data })}
            onCancel={() => setEditingProperty(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProperty}
        onClose={() => setDeletingProperty(null)}
        onConfirm={() => deletingProperty && deleteMutation.mutate(deletingProperty.id)}
        title="Delete Property"
        message={`Delete ${deletingProperty?.address}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
