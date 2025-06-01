import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../../store/slices/cartSlice';
import { pharmacyAPI } from '../../services/api';
import { cartAPI } from '../../services/api';

const PharmacyMedicinesScreen = ({ route, navigation }) => {
  const { pharmacy } = route.params;
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPharmacyMedicines();
  }, []);

  const fetchPharmacyMedicines = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getPharmacyMedicines(pharmacy._id);
      setMedicines(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (medicine) => {
    try {
      // Ensure we have the pharmacy ID
      const pharmacyId = pharmacy._id;
      if (!pharmacyId) {
        throw new Error('Pharmacy ID is missing');
      }

      // Get current cart items
      const currentCart = await cartAPI.getCart();
      
      const cartItems = currentCart.items || [];

      // Check if cart is empty or if medicine is from the same pharmacy
      if (cartItems.length === 0) {
        // Cart is empty, add the item
        const response = await cartAPI.addToCart(medicine._id, 1, pharmacyId);
        Alert.alert('Success', 'Medicine added to cart');
      } else {
        // Get the pharmacy ID of the first item in cart
        const existingPharmacyId = cartItems[0].pharmacyId._id || cartItems[0].pharmacyId;
        
        if (existingPharmacyId === pharmacyId) {
          // Same pharmacy, add the item
          const response = await cartAPI.addToCart(medicine._id, 1, pharmacyId);
          Alert.alert('Success', 'Medicine added to cart');
        } else {
          // Different pharmacy, show confirmation
          Alert.alert(
            'Different Pharmacy',
            'This medicine is from a different pharmacy. Adding it will clear your current cart. Do you want to continue?',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Clear Cart & Add',
                onPress: async () => {
                  // Clearing cart and adding new item
                  await cartAPI.clearCart();
                  const response = await cartAPI.addToCart(medicine._id, 1, pharmacyId);
                  Alert.alert('Success', 'Medicine added to cart');
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add medicine to cart');
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMedicineItem = ({ item }) => (
    <TouchableOpacity
      style={styles.medicineCard}
      onPress={() => navigation.navigate('Product', { medicine: item })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.medicineImage}
        resizeMode="cover"
      />
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <Text style={styles.medicineDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.medicinePrice}>EGP {item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>EGP {item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.stockRow}>
          <Text style={[
            styles.stockStatus,
            { color: item.stock > 0 ? '#1B794B' : '#E53935' }
          ]}>
            {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Text>
          {item.stock > 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B794B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPharmacyMedicines}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pharmacy.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineItem}
        keyExtractor={(item) => `medicine-${item._id}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No medicines found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1B794B',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F5E9',
  },
  backButton: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B794B',
    textAlign: 'center',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    margin: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  medicineCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  medicineImage: {
    width: 120,
    height: 120,
  },
  medicineInfo: {
    flex: 1,
    padding: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B794B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#1B794B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default PharmacyMedicinesScreen; 