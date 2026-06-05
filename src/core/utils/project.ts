import type { Project } from '@/core/types';

export function isProjectSettled(project: Project): boolean {
  return project.totalAmount > 0 && project.remainingAmount <= 0;
}
