export type ActivityType = 'created' | 'updated' | 'status_changed' | 'completed' | 'deleted';

export interface Activity {
  id: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  actor: string;
  message: string;
  timestamp: string;
}
