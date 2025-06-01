import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
  primary: '#007BFF',
  background: '#fff',
  text: '#333',
  error: '#ff4d4d',
  inputBorder: '#ccc',
};

export const GLOBAL = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    width: width,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  error: {
    color: COLORS.error,
    marginBottom: 8,
    fontSize: 14,
  },
  link: {
    color: COLORS.primary,
    marginTop: 10,
    textAlign: 'center',
  },
});
