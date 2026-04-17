import { request } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getProfile() {
  const token = await AsyncStorage.getItem('token');
  return request('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function updateProfile(payload) {
  const token = await AsyncStorage.getItem('token');
  return request('/user', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export const userApi = {
  getProfile,
  updateProfile,
};
