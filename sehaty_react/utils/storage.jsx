import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.error('Saving error:', e);
  }
};

export const getUser = async () => {
  try {
    const json = await AsyncStorage.getItem('user');
    return json != null ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Reading error:', e);
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (e) {
    console.error('Logout error:', e);
  }
};
