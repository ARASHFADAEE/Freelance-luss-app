export type ProjectStatus =
  | 'negotiating'
  | 'active'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type Currency = 'TOMAN' | 'RIAL' | 'USD' | 'EUR' | 'AED';

export type SubscriptionPlan = 'free' | 'pro';

export type InvoiceTemplate = 'classic' | 'modern' | 'minimal';

export interface InvoiceStyleSettings {
  primaryColor: string;
  accentColor: string;
  footerText: string;
  showSignatures: boolean;
  template: InvoiceTemplate;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  totalAmount: number;
  receivedAmount: number;
  remainingAmount: number;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  paymentDate: string;
  description: string;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  defaultPrice: number;
  description: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string | null;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  logo: string | null;
  address: string;
  website: string;
  currency: Currency;
  taxRate: number;
  invoicePrimaryColor: string;
  invoiceAccentColor: string;
  invoiceFooterText: string;
  invoiceShowSignatures: boolean;
  invoiceTemplate: InvoiceTemplate;
}

export interface AppSettings {
  id: string;
  darkMode: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt: string | null;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface DashboardStats {
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  outstandingReceivables: number;
  activeProjects: number;
  unpaidInvoices: number;
}

export interface MonthlyDataPoint {
  month: string;
  label: string;
  revenue: number;
  expenses: number;
}

export interface ClientReport {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  projectCount: number;
  invoiceCount: number;
}

export interface ServiceReport {
  serviceId: string;
  serviceTitle: string;
  totalRevenue: number;
  usageCount: number;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  profile: Profile | null;
  settings: AppSettings | null;
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  services: Service[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  expenses: Expense[];
}
