import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { prescriptionAPI } from '../../services/api';

const PrescriptionDetailsScreen = ({ route, navigation }) => {
  const { prescriptionId } = route.params;
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptionDetails();
  }, [prescriptionId]);

  const fetchPrescriptionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await prescriptionAPI.getPrescriptionById(prescriptionId);
      setPrescription(response.prescription);
    } catch (err) {
      console.error('Error fetching prescription details:', err);
      setError(err.message || 'Failed to load prescription details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await prescriptionAPI.deletePrescription(prescriptionId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting prescription:', error);
              Alert.alert('Error', 'Failed to delete prescription');
            }
          },
        },
      ]
    );
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchPrescriptionDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Prescription not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPrescriptionDetails}>
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
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription Details</Text>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Prescription Image */}
        <Image
          source={{ uri: prescription.image.secure_url }}
          style={styles.prescriptionImage}
        />

        {/* Prescription Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{prescription.title}</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#666" />
            <Text style={styles.infoText}>Dr. {prescription.doctorName}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="medical-services" size={20} color="#666" />
            <Text style={styles.infoText}>{prescription.doctorSpecialty}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.infoText}>
              Created on {format(new Date(prescription.createDate), 'MMM dd, yyyy')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="event-available" size={20} color="#666" />
            <Text style={styles.infoText}>
              Valid until {format(new Date(prescription.validUntil), 'MMM dd, yyyy')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.infoText}>
              Status: {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
            </Text>
          </View>

          {prescription.status === 'rejected' && prescription.rejectionReason && (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
              <Text style={styles.rejectionText}>{prescription.rejectionReason}</Text>
            </View>
          )}
        </View>

        {prescription.ocrText && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Extracted Text:</Text>
            <Text style={{ color: '#444', marginTop: 4 }}>{prescription.ocrText}</Text>
          </View>
        )}

        {/* Medicines List */}
        <View style={styles.medicinesContainer}>
          <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
          {prescription.medicines.map((medicine, index) => (
            <View key={index} style={styles.medicineItem}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>
                  {medicine.medicineId.name}
                </Text>
                <Text style={styles.medicineGeneric}>
                  {medicine.medicineId.genericName}
                </Text>
                {medicine.dosage && (
                  <View style={styles.dosageContainer}>
                    <Text style={styles.dosageText}>
                      Dosage: {medicine.dosage.amount} {medicine.dosage.unit}
                    </Text>
                    <Text style={styles.dosageText}>
                      Frequency: {medicine.dosage.frequency}
                    </Text>
                    <Text style={styles.dosageText}>
                      Duration: {medicine.dosage.duration}
                    </Text>
                  </View>
                )}
                {medicine.notes && (
                  <Text style={styles.notes}>{medicine.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  prescriptionImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  rejectionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  rejectionText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  medicinesContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  medicineItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineGeneric: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dosageContainer: {
    marginTop: 8,
  },
  dosageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default PrescriptionDetailsScreen; 