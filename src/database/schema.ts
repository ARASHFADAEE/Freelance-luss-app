export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  fullName TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  companyName TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  clientId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  totalAmount REAL NOT NULL DEFAULT 0,
  receivedAmount REAL NOT NULL DEFAULT 0,
  remainingAmount REAL NOT NULL DEFAULT 0,
  startDate TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'negotiating',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY NOT NULL,
  projectId TEXT NOT NULL,
  amount REAL NOT NULL,
  paymentDate TEXT NOT NULL,
  description TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  defaultPrice REAL NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY NOT NULL,
  invoiceNumber TEXT NOT NULL UNIQUE,
  clientId TEXT NOT NULL,
  projectId TEXT,
  issueDate TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  subtotal REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY NOT NULL,
  invoiceId TEXT NOT NULL,
  serviceId TEXT,
  title TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unitPrice REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY NOT NULL,
  fullName TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  logo TEXT,
  address TEXT DEFAULT '',
  website TEXT DEFAULT '',
  currency TEXT DEFAULT 'TOMAN',
  taxRate REAL DEFAULT 9,
  invoicePrimaryColor TEXT DEFAULT '#1e3a8a',
  invoiceAccentColor TEXT DEFAULT '#10b981',
  invoiceFooterText TEXT DEFAULT '',
  invoiceShowSignatures INTEGER DEFAULT 1,
  invoiceTemplate TEXT DEFAULT 'modern'
);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY NOT NULL,
  darkMode INTEGER DEFAULT 0,
  subscriptionPlan TEXT DEFAULT 'free',
  subscriptionExpiresAt TEXT,
  notificationsEnabled INTEGER DEFAULT 1,
  onboardingCompleted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY NOT NULL
);
`;
