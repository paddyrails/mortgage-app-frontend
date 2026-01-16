import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, FileText, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { customerService, propertyService, loanApplicationService } from '../services/api';
import { Card, Badge, LoadingSpinner } from '../components/ui';
import type { LoanApplication, Customer } from '../types';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

export const DashboardPage: React.FC = () => {
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  });

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getAll,
  });

  const { data: applications = [], isLoading: loadingApplications } = useQuery({
    queryKey: ['loanApplications'],
    queryFn: loanApplicationService.getAll,
  });

  const isLoading = loadingCustomers || loadingProperties || loadingApplications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalLoanValue = applications.reduce((sum, a) => sum + a.loanAmount, 0);
  const pendingReview = applications.filter((a) => ['Submitted', 'UnderReview'].includes(a.status)).length;

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { name: 'Total Customers', value: customers.length, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/customers' },
    { name: 'Properties', value: properties.length, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/properties' },
    { name: 'Loan Applications', value: applications.length, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/loans' },
    { name: 'Total Loan Value', value: formatCurrency(totalLoanValue), icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/loans' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your mortgage business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card className="p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Alert */}
      {pendingReview > 0 && (
        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{pendingReview} application(s) pending review</p>
              <p className="text-sm text-slate-400">These need your attention</p>
            </div>
            <Link to="/loans" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
              Review Now
            </Link>
          </div>
        </Card>
      )}

      {/* Recent Applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
          <Link to="/loans" className="text-sm text-emerald-400 hover:text-emerald-300">View all →</Link>
        </div>
        <div className="space-y-4">
          {recentApps.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No applications yet</p>
          ) : (
            recentApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{getCustomerName(app.customerId)}</p>
                    <p className="text-sm text-slate-500">{format(new Date(app.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-400">{formatCurrency(app.loanAmount)}</p>
                  <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Denied' ? 'danger' : 'warning'}>
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
