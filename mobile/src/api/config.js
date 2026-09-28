import { Platform } from 'react-native';

// In development, detect appropriate host based on runtime platform
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }
  // iOS simulator or Web browser
  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
