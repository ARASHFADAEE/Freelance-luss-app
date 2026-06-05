import type { Invoice, Project } from '@/core/types';
import { isProjectSettled } from './project';

export function isInvoicePaid(invoice: Invoice, project?: Project | null): boolean {
  if (invoice.status === 'paid') return true;
  if (invoice.status === 'cancelled') return false;
  if (project && isProjectSettled(project)) return true;
  return false;
}
