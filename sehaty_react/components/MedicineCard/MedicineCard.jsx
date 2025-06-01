import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { HeartIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolidIcon } from 'react-native-heroicons/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { useNavigation } from '@react-navigation/native';

const MedicineCard = ({ medicine }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const wishlist = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.some((item) => item._id === medicine._id);

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(medicine._id)).unwrap();
      } else {
        await dispatch(addToWishlist(medicine._id)).unwrap();
      }
    } catch (error) {
      alert(error.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = () => {
    let addToCartItems = {
      quantity:1,
      medicineId: medicine._id,
      pharmacyId: medicine.pharmacyInfo.pharmacyId
    }
    dispatch(addToCart(addToCartItems));
    Alert.alert('Success', 'Medicine added to cart successfully!', [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ]);
  };

  const handlePress = () => {
    navigation.navigate('Product', { product: medicine });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: medicine.image || 'https://via.placeholder.com/150'
          }} 
          style={styles.image} 
        />
        <TouchableOpacity 
          style={styles.wishlistButton} 
          onPress={handleWishlistToggle}
        >
          {isInWishlist ? (
            <HeartSolidIcon size={20} color="#FF4B4B" />
          ) : (
            <HeartIcon size={20} color="#FF4B4B" />
          )}
        </TouchableOpacity>
        {medicine.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{medicine.discount}% OFF</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>{medicine.name}</Text>
        
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>EGP {medicine.price}</Text>
            {medicine.originalPrice && (
              <Text style={styles.originalPrice}>EGP {medicine.originalPrice}</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B794B',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: '#1B794B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B794B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export default MedicineCard; 