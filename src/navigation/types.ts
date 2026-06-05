import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string; expiresIn: number; debugCode?: string };
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientForm: { clientId?: string };
  ClientDetail: { clientId: string };
};

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectForm: { projectId?: string; clientId?: string };
  ProjectDetail: { projectId: string };
  PaymentForm: { projectId: string };
};

export type InvoicesStackParamList = {
  InvoicesList: undefined;
  InvoiceForm: { invoiceId?: string; clientId?: string; projectId?: string };
  InvoiceDetail: { invoiceId: string };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Expenses: undefined;
  ExpenseForm: { expenseId?: string };
  Services: undefined;
  ServiceForm: { serviceId?: string };
  Reports: undefined;
  Calculator: undefined;
  Notifications: undefined;
  Backup: undefined;
  Profile: undefined;
  Settings: undefined;
  InvoiceStyle: undefined;
  Subscription: undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Clients: NavigatorScreenParams<ClientsStackParamList>;
  Projects: NavigatorScreenParams<ProjectsStackParamList>;
  Invoices: NavigatorScreenParams<InvoicesStackParamList>;
  Reports: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

export type ClientsStackScreenProps<T extends keyof ClientsStackParamList> =
  NativeStackScreenProps<ClientsStackParamList, T>;

export type ProjectsStackScreenProps<T extends keyof ProjectsStackParamList> =
  NativeStackScreenProps<ProjectsStackParamList, T>;

export type InvoicesStackScreenProps<T extends keyof InvoicesStackParamList> =
  NativeStackScreenProps<InvoicesStackParamList, T>;

export type MoreStackScreenProps<T extends keyof MoreStackParamList> =
  NativeStackScreenProps<MoreStackParamList, T>;
