import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import type { LoanApplication, CreateLoanApplicationRequest, LoanStatus, Customer, Property, Column } from '../types';
import { loanApplicationService, customerService, propertyService } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button, Modal, Input, Select, TextArea, ConfirmDialog, Badge, Card, LoadingSpinner } from '../components/ui';

const loanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  propertyId: z.string().min(1, 'Property is required'),
  loanType: z.enum(['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo']),
  loanAmount: z.coerce.number().min(1, 'Loan amount is required'),
  downPayment: z.coerce.number().min(0),
  termMonths: z.coerce.number().min(12),
  interestRate: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(['Draft', 'Submitted', 'UnderReview', 'Approved', 'Denied', 'Closed', 'Funded']).optional(),
  notes: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

const loanTypeOptions = [
  { value: 'Conventional', label: 'Conventional' },
  { value: 'FHA', label: 'FHA' },
  { value: 'VA', label: 'VA' },
  { value: 'USDA', label: 'USDA' },
  { value: 'Jumbo', label: 'Jumbo' },
];

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'UnderReview', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Denied', label: 'Denied' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Funded', label: 'Funded' },
];

const termOptions = [
  { value: '180', label: '15 Years' },
  { value: '240', label: '20 Years' },
  { value: '360', label: '30 Years' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const getStatusVariant = (status: LoanStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  const map: Record<LoanStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    Draft: 'default', Submitted: 'info', UnderReview: 'warning', Approved: 'success', Denied: 'danger', Closed: 'success', Funded: 'success'
  };
  return map[status];
};

interface LoanFormProps {
  application?: LoanApplication;
  customers: Customer[];
  properties: Property[];
  onSubmit: (data: LoanFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({ application, customers, properties, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: application || { loanType: 'Conventional', termMonths: 360, status: 'Draft' },
  });

  const loanAmount = watch('loanAmount') || 0;
  const downPayment = watch('downPayment') || 0;
  const interestRate = watch('interestRate') || 6.5;
  const termMonths = watch('termMonths') || 360;

  const calculatePayment = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    return isNaN(payment) ? 0 : payment;
  };

  const customerOptions = [{ value: '', label: 'Select customer...' }, ...customers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))];
  const propertyOptions = [{ value: '', label: 'Select property...' }, ...properties.map((p) => ({ value: p.id, label: `${p.address}, ${p.city}` }))];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select label="Customer" options={customerOptions} error={errors.customerId?.message} {...register('customerId')} />
        <Select label="Property" options={propertyOptions} error={errors.propertyId?.message} {...register('propertyId')} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Select label="Loan Type" options={loanTypeOptions} error={errors.loanType?.message} {...register('loanType')} />
        <Select label="Term" options={termOptions} error={errors.termMonths?.message} {...register('termMonths')} />
        {application && <Select label="Status" options={statusOptions} error={errors.status?.message} {...register('status')} />}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Loan Amount ($)" type="number" min={1} error={errors.loanAmount?.message} {...register('loanAmount')} />
        <Input label="Down Payment ($)" type="number" min={0} error={errors.downPayment?.message} {...register('downPayment')} />
        <Input label="Interest Rate (%)" type="number" step={0.125} min={0} max={100} error={errors.interestRate?.message} {...register('interestRate')} />
      </div>

      <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Est. Monthly Payment</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(calculatePayment())}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Loan Principal</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(loanAmount - downPayment)}</p>
          </div>
        </div>
      </Card>

      <TextArea label="Notes" rows={3} {...register('notes')} />
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{application ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export const LoanApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<LoanApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<LoanApplication | null>(null);

  const { data: applications = [], isLoading: loadingApps } = useQuery({ queryKey: ['loanApplications'], queryFn: loanApplicationService.getAll });
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({ queryKey: ['customers'], queryFn: customerService.getAll });
  const { data: properties = [], isLoading: loadingProperties } = useQuery({ queryKey: ['properties'], queryFn: propertyService.getAll });

  const isLoading = loadingApps || loadingCustomers || loadingProperties;

  const createMutation = useMutation({
    mutationFn: loanApplicationService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loanApplications'] }); setIsCreateOpen(false); toast.success('Application created'); },
    onError: () => toast.error('Failed to create application'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => loanApplicationService.update(id, { id, ...data }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loanApplications'] }); setEditingApp(null); toast.success('Application updated'); },
    onError: () => toast.error('Failed to update application'),
  });

  const deleteMutation = useMutation({
    mutationFn: loanApplicationService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loanApplications'] }); setDeletingApp(null); toast.success('Application deleted'); },
    onError: () => toast.error('Failed to delete application'),
  });

  const getCustomerName = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  };

  const getPropertyAddress = (id: string) => {
    const p = properties.find((x) => x.id === id);
    return p ? p.address : 'Unknown';
  };

  const columns: Column<LoanApplication>[] = [
    {
      key: 'id',
      header: 'Application',
      render: (a) => (
        <div>
          <p className="font-medium text-white">#{a.id.slice(0, 8)}</p>
          <p className="text-xs text-slate-500">{format(new Date(a.createdAt), 'MMM d, yyyy')}</p>
        </div>
      ),
    },
    { key: 'customerId', header: 'Customer', sortable: true, render: (a) => getCustomerName(a.customerId) },
    { key: 'propertyId', header: 'Property', render: (a) => <span className="text-slate-400 text-sm">{getPropertyAddress(a.propertyId)}</span> },
    { key: 'loanType', header: 'Type', sortable: true },
    { key: 'loanAmount', header: 'Amount', sortable: true, render: (a) => <span className="font-semibold text-emerald-400">{formatCurrency(a.loanAmount)}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (a) => <Badge variant={getStatusVariant(a.status)}>{a.status.replace(/([A-Z])/g, ' $1').trim()}</Badge> },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Loan Applications</h1>
          <p className="text-slate-400">Manage loan applications</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>New Application</Button>
      </div>

      <DataTable
        data={applications}
        columns={columns}
        keyExtractor={(a) => a.id}
        onEdit={setEditingApp}
        onDelete={setDeletingApp}
        searchPlaceholder="Search applications..."
        emptyTitle="No applications"
        emptyDescription="Create your first loan application."
        emptyIcon={<FileText className="w-12 h-12" />}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Application" size="xl">
        <LoanForm customers={customers} properties={properties} onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setIsCreateOpen(false)} isLoading={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!editingApp} onClose={() => setEditingApp(null)} title="Edit Application" size="xl">
        {editingApp && (
          <LoanForm
            application={editingApp}
            customers={customers}
            properties={properties}
            onSubmit={(data) => updateMutation.mutate({ id: editingApp.id, data })}
            onCancel={() => setEditingApp(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        onConfirm={() => deletingApp && deleteMutation.mutate(deletingApp.id)}
        title="Delete Application"
        message="Delete this loan application? This cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
