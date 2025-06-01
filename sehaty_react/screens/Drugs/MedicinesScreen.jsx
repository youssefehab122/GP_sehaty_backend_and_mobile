import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { productsAPI } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../store/slices/wishlistSlice";
import { addToCart } from "../../store/slices/cartSlice";

export default function MedicinesScreen({ route, navigation }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  // Get categoryId from route params if available
  const categoryId = route.params?.categoryId;

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
    dispatch(fetchWishlist());
  }, [dispatch, categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.categories || []);
      if (categoryId) {
        const category = response.categories.find(cat => cat._id === categoryId);
        if (category) {
          setSelectedCategory(category);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (categoryId) {
        params.category = categoryId;
      }
      const response = await productsAPI.getProducts(params);
      console.log("API Response ==> ", JSON.stringify(response, null, 2));
     
      if (response?.medicines) {
        const uniqueMedicines = response.medicines.map(medicine => ({
          ...medicine,
          uniqueId: `${medicine._id}-${medicine.pharmacyInfo?.pharmacyId || 'no-pharmacy'}`
        }));
        
        console.log("Processed medicines with unique IDs:", uniqueMedicines.length);
        setMedicines(uniqueMedicines);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchCategories(), fetchMedicines()])
      .finally(() => setRefreshing(false));
  }, []);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    navigation.setParams({ categoryId: category._id });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?._id === item._id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory?._id === item._id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const isInWishlist = (id) => {
    return items.some(item => item._id === id);
  };

  const toggleFavorite = (item) => {
    if (isInWishlist(item._id)) {
      dispatch(removeFromWishlist(item._id));
    } else {
      dispatch(addToWishlist(item));
    }
  };

  const handleAddToCart = (item) => {
    if (!item.pharmacyInfo) {
      alert('This medicine is not available in any pharmacy');
      return;
    }
    // console.log("item ==> ", JSON.stringify(item,null,2));
    // dispatch(addToCart({
    //   ...item,
    //   quantity: 1
    // }));
    let cartItem = {
      medicineId: item._id,
      pharmacyId: item.pharmacyInfo.pharmacyId,
      quantity:1
    }
    dispatch(addToCart({
      ...cartItem,
      quantity: 1
    }));
    navigation.navigate("Cart");
    alert('Medicine added to cart successfully!');
  };

  const renderMedicineItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.medicineCard}
      onPress={() => navigation.navigate("Product", { product: item })}
    >
      <View style={styles.medicineImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.medicineImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.medicineDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.pharmacyInfo}>
          <Ionicons name="business-outline" size={16} color="#1B794B" />
          <Text style={styles.pharmacyName} numberOfLines={1}>
            {item.pharmacyInfo?.pharmacyName || 'Not available in any pharmacy'}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>EGP {item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.oldPrice}>EGP {item.originalPrice}</Text>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => toggleFavorite(item)}
        >
          {/* <Ionicons 
            name={isInWishlist(item._id) ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist(item._id) ? "#E53935" : "#1B794B"} 
          /> */}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={24} color="#1B794B" />
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchMedicines}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#606060" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory ? selectedCategory.name : 'All Medicines'}
        </Text>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        renderItem={renderCategoryItem}
        keyExtractor={item => item._id}
      />

      <FlatList
        data={medicines}
        renderItem={renderMedicineItem}
        keyExtractor={item => item.uniqueId}
        contentContainerStyle={styles.medicinesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1B794B']}
            tintColor="#1B794B"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B794B',
  },
  categoriesList: {
    maxHeight: 50,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryItem: {
    backgroundColor: '#1B794B',
  },
  categoryText: {
    fontSize: 14,
    color: '#606060',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  medicinesList: {
    padding: 16,
  },
  medicineCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  medicineImage: {
    width: '100%',
    height: '100%',
  },
  medicineInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 14,
    color: '#1B794B',
    marginLeft: 4,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B794B',
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  actionButtons: {
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  wishlistButton: {
    padding: 4,
  },
  cartButton: {
    padding: 4,
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
}); 