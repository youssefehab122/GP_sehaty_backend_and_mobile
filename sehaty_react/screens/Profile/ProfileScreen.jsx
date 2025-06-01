import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser } from "../../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { authAPI } from "../../services/api";
import PrescriptionList from "../../components/PrescriptionList";
import PrescriptionUpload from "../../components/PrescriptionUpload";
import { prescriptionAPI } from "../../services/api";
import Constants from 'expo-constants';

// Get the API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.API_URL || ' https://9e96-197-57-121-35.ngrok-free.app/api';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, prescriptionsData] = await Promise.all([
        authAPI.getProfile(),
        prescriptionAPI.getUserPrescriptions()
      ]);
      setUserData(profileData);
      setPrescriptions(prescriptionsData.prescriptions || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const handlePrescriptionPress = (prescription) => {
    navigation.navigate('PrescriptionDetails', { prescriptionId: prescription._id });
  };

  const handleUploadPress = () => {
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (formData) => {
    try {
      setUploading(true);
      await prescriptionAPI.uploadPrescription(formData);
      setShowUploadModal(false);
      fetchData(); // Refresh the list
      Alert.alert('Success', 'Prescription uploaded successfully');
    } catch (err) {
      console.error('Error uploading prescription:', err);
      Alert.alert('Error', 'Failed to upload prescription');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await authAPI.logout();
              await dispatch(logoutUser());
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const menuItems = [
    {
      id: 'prescriptions',
      icon: <MaterialIcons name="receipt-long" size={24} color="#1B794B" />,
      label: 'My Prescriptions',
      onPress: () => navigation.navigate('PrescriptionList'),
    },
   
    {
      id: 'wishlist',
      icon: <MaterialIcons name="favorite-border" size={24} color="#1B794B" />,
      label: 'Wishlist',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      id: 'addresses',
      icon: <MaterialIcons name="location-on" size={24} color="#1B794B" />,
      label: 'My Addresses',
      onPress: () => navigation.navigate('AddressListScreen'),
    },
    
    {
      id: 'logout',
      icon: <MaterialIcons name="logout" size={24} color="#D32F2F" />,
      label: 'Logout',
      onPress: handleLogout,
      textColor: '#D32F2F',
    },
  ];

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchData}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1B794B']}
            tintColor="#1B794B"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={{ 
                uri: userData?.image 
                  ? `${API_URL}${userData.image}`
                  : 'https://via.placeholder.com/150'
              }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <View style={styles.countryRow}>
                <Image
                  source={{ uri: "https://flagcdn.com/w40/eg.png" }}
                  style={styles.flag}
                />
                <Text style={styles.countryText}>Egypt</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <MaterialIcons name="edit" size={24} color="#1B794B" />
          </TouchableOpacity>
        </View>

        {/* Prescriptions Section */}
        {/* <View style={styles.section}>
          <PrescriptionList
            prescriptions={prescriptions}
            loading={loading}
            onPrescriptionPress={handlePrescriptionPress}
            onUploadPress={handleUploadPress}
          />
        </View> */}

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.iconLabel}>
                {item.icon}
                <Text
                  style={[
                    styles.menuItemText,
                    item.textColor && { color: item.textColor },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Upload Prescription Modal */}
      {/* <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowUploadModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Upload Prescription</Text>
            <View style={{ width: 24 }} />
          </View>
          <PrescriptionUpload
            onSubmit={handleUploadSubmit}
            onCancel={() => setShowUploadModal(false)}
            loading={uploading}
          />
        </SafeAreaView>
      </Modal> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  flag: {
    width: 20,
    height: 14,
    marginRight: 6,
    borderRadius: 2,
  },
  countryText: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#606060",
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginTop: 20,
  },
  menu: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 15,
    marginLeft: 15,
    fontWeight: "normal",
    color: "#000",
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
