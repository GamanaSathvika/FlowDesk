import { request } from './client';

function getTasks() {
  return request('/tasks');
}

function getArchivedTasks() {
  return request('/tasks/archive');
}

function create(payload) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function updateTask(id, payload) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export const tasksApi = {
  getTasks,
  getArchivedTasks,
  create,
  updateTask,
  deleteTask,
};
