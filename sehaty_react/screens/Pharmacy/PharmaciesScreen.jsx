import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { pharmacyAPI } from "../../services/api";
import pharmacyImage from "../../assets/pharmacy.png";

export default function PharmaciesScreen({ navigation }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getPharmacies();
      console.log('Fetched pharmacies:', JSON.stringify(response, null, 2));
      setPharmacies(response.pharmacies || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pharmacies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPharmacies();
  };

  const handlePharmacyPress = (pharmacy) => {
    navigation.navigate('PharmacyMedicines', { pharmacy });
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchPharmacies}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#606060" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacies</Text>
        <TouchableOpacity>
          {/* <Feather name="search" size={24} color="#606060" /> */}
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={pharmacies}
        keyExtractor={(item) => `pharmacy-list-${item._id}`}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            onPress={() => handlePharmacyPress(item)}
          >
            <Image 
              source={{ 
                uri: item.logo || item.image || 'https://via.placeholder.com/150'
              }} 
              style={styles.logo} 
            />

            <View style={styles.infoContainer}>
              {/* Left: Pharmacy Info */}
              <View style={styles.leftColumn}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.street}>{item.address}</Text>
                <Text style={styles.phone}>Phone: {item.phone}</Text>
              </View>

              {/* Right: Time & Nearest */}
              <View style={styles.rightColumn}>
                <View style={styles.timeRow}>
                  <Ionicons name="location-outline" size={16} color="#606060" />
                  <Text style={styles.timeText}>{item.distance + " Km" || 'N/A'}</Text>
                </View>
                {item.isNearest && <Text style={styles.nearest}>Nearest</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1B794B"]}
            tintColor="#1B794B"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  item: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "flex-start",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 15,
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: "flex-start",
    justifyContent: "left",
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#000",
  },
  street: {
    fontSize: 14,
    color: "#606060",
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: "#606060",
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#606060",
    marginLeft: 4,
    fontWeight: "500",
  },
  nearest: {
    color: "#1B794B",
    fontWeight: "bold",
    fontSize: 14,
  },
});