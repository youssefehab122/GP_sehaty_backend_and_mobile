import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { reminderAPI } from '../../services/api';
import { format, addDays } from 'date-fns';

export default function EditReminderModal({ visible, onClose, reminderId, onReminderUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(new Date());
  const [dosage, setDosage] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 7));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [frequency, setFrequency] = useState('daily');

  // Fetch reminder data when modal opens
  useEffect(() => {
    const fetchReminderData = async () => {
      if (visible && reminderId) {
        try {
          setFetching(true);
          console.log('Fetching reminder data for ID:', reminderId);
          const response = await reminderAPI.getReminderById(reminderId);
          console.log('Fetched reminder data:', response);
          
          const reminder = response;
          if (!reminder) {
            throw new Error('No reminder data received');
          }

          setTitle(reminder.title || '');
          setDescription(reminder.description || '');
          setDosage(reminder.dosage || '');
          setMedicineName(reminder.product || '');
          setQuantity(reminder.quantity || '');
          setInstructions(reminder.instructions || '');
          setNotes(reminder.notes || '');
          setFrequency(reminder.frequency || 'daily');
          
          if (reminder.time) {
            const reminderTime = new Date(reminder.time);
            console.log('Setting reminder time:', reminderTime);
            setTime(reminderTime);
          }

          if (reminder.startDate) {
            setStartDate(new Date(reminder.startDate));
          }

          if (reminder.endDate) {
            setEndDate(new Date(reminder.endDate));
          }
        } catch (error) {
          console.error('Error fetching reminder:', error);
          Alert.alert('Error', 'Failed to fetch reminder data');
          onClose();
        } finally {
          setFetching(false);
        }
      }
    };

    fetchReminderData();
  }, [visible, reminderId]);

  const handleDateChange = (event, selectedDate, isStartDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      if (isStartDate) {
        setStartDate(selectedDate);
        // If end date is before new start date, update it
        if (endDate < selectedDate) {
          setEndDate(addDays(selectedDate, 7));
        }
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title || !medicineName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const reminderData = {
        title,
        description,
        time,
        frequency,
        dosage,
        notes,
        product: medicineName,
        startDate,
        endDate,
        notificationPreferences: {
          email: true,
          push: true,
        },
      };

      console.log('Updating reminder:', reminderId);
      console.log('Update data:', reminderData);

      await reminderAPI.updateReminder(reminderId, reminderData);
      Alert.alert('Success', 'Reminder updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            if (onReminderUpdated) {
              onReminderUpdated();
            }
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B794B" />
          <Text style={styles.loadingText}>Loading reminder data...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Reminder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Medicine Name *</Text>
              <TextInput
                style={styles.input}
                value={medicineName}
                onChangeText={setMedicineName}
                placeholder="Enter medicine name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter reminder title"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {format(time, 'h:mm a')}
                </Text>
                <Ionicons name="time-outline" size={24} color="#1B794B" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      setTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {format(startDate, 'MMM dd, yyyy')}
                </Text>
                <Ionicons name="calendar-outline" size={24} color="#1B794B" />
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, true)}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {format(endDate, 'MMM dd, yyyy')}
                </Text>
                <Ionicons name="calendar-outline" size={24} color="#1B794B" />
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, false)}
                  minimumDate={startDate}
                />
              )}
            </View>

            {/* <View style={styles.formGroup}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyContainer}>
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      frequency === freq && styles.selectedFrequency,
                    ]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        frequency === freq && styles.selectedFrequencyText,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View> */}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="Enter dosage (e.g., 1 pill)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter any additional notes"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : 'Update Reminder'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1B794B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: '#1B794B',
    borderColor: '#1B794B',
  },
  frequencyText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFrequencyText: {
    color: '#fff',
  },
}); 