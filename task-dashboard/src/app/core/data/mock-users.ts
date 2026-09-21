import type { Assignee } from '../models';

/**
 * The team roster backing the assignee picker and the Team page. Kept in
 * sync with the assignees embedded in `data-fetching/generate-data.js` so
 * IDs line up with the seeded tasks.
 */
export const MOCK_USERS: Assignee[] = [
  { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
  { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah.smith@company.com' },
  { id: 'user-003', name: 'Mike Johnson', avatar: 'MJ', email: 'mike.johnson@company.com' },
  { id: 'user-004', name: 'Emily Davis', avatar: 'ED', email: 'emily.davis@company.com' },
];
