import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

const PrescriptionList = ({ prescriptions, loading, onPrescriptionPress, onUploadPress }) => {
  const renderPrescriptionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.prescriptionCard}
      onPress={() => onPrescriptionPress(item)}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={onUploadPress}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload New</Text>
        </TouchableOpacity>
      </View>
      
      {prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt-long" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No prescriptions yet</Text>
          <Text style={styles.emptySubText}>
            Upload your first prescription to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderPrescriptionItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B794B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  prescriptionCard: {
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
  prescriptionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  prescriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PrescriptionList; 