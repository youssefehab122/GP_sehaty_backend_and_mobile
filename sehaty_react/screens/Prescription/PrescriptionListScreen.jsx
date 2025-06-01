import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { prescriptionAPI } from '../../services/api';
import PrescriptionUpload from '../../components/PrescriptionUpload';

const PrescriptionListScreen = ({ navigation }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await prescriptionAPI.getUserPrescriptions();
      setPrescriptions(response.prescriptions || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPrescriptions().finally(() => setRefreshing(false));
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
      fetchPrescriptions(); // Refresh the list
      Alert.alert('Success', 'Prescription uploaded successfully');
    } catch (err) {
      console.error('Error uploading prescription:', err);
      Alert.alert('Error', 'Failed to upload prescription');
    } finally {
      setUploading(false);
    }
  };

  const renderPrescriptionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.prescriptionCard}
      onPress={() => handlePrescriptionPress(item)}
    >
      <Image
        source={{ uri: item.image.secure_url }}
        style={styles.prescriptionImage}
      />
      <View style={styles.prescriptionInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
        <Text style={styles.specialty}>{item.doctorSpecialty}</Text>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.date}>
            {format(new Date(item.createDate), 'MMM dd, yyyy')}
          </Text>
        </View>
        <View style={[styles.statusBadge, styles[`${item.status}Badge`]]}>
          <Text style={[styles.statusText, styles[`${item.status}Text`]]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        {item.ocrText && (
          <Text numberOfLines={2} style={{ color: '#888', marginTop: 4 }}>
            {item.ocrText}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B794B" />
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
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadPress}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPrescriptions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt-long" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No prescriptions yet</Text>
          <Text style={styles.emptySubText}>
            Upload your first prescription to get started
          </Text>
          <TouchableOpacity
            style={styles.uploadEmptyButton}
            onPress={handleUploadPress}
          >
            <Text style={styles.uploadEmptyButtonText}>Upload Prescription</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderPrescriptionItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1B794B']}
            />
          }
        />
      )}

      <Modal
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
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Upload Prescription</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalContent}>
            <PrescriptionUpload
              onSubmit={handleUploadSubmit}
              onCancel={() => setShowUploadModal(false)}
              loading={uploading}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  uploadButton: {
    backgroundColor: '#1B794B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1B794B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadEmptyButton: {
    backgroundColor: '#1B794B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  uploadEmptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  prescriptionInfo: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  approvedBadge: {
    backgroundColor: '#E8F5E9',
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: '#F57C00',
  },
  approvedText: {
    color: '#1B794B',
  },
  rejectedText: {
    color: '#D32F2F',
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
    backgroundColor: '#fff',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PrescriptionListScreen; 