import { TaskState } from './TaskState.js';

/**
 * Represents the state where a task is newly created and requires project creator approval.
 * Transitions: approve -> 'To Do'
 */
export class PendingApprovalState extends TaskState {
  /**
   * Approves the task, typically moving it to the 'To Do' status.
   * @param {Object} user - The user attempting the action.
   */
  approve(user) {
    if (!this.isProjectCreator(user)) {
      throw new Error(
        'Not authorized: Only the project creator can approve tasks.'
      );
    }
    this.task.status = 'To Do';
  }
}
