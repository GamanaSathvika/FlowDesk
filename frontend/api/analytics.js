import { request } from './client';

export function getAnalytics(range) {
  return request(`/analytics?range=${encodeURIComponent(range)}`);
}
