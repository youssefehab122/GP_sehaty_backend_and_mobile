import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
  Animated,
  RefreshControl,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Swipeable from "react-native-gesture-handler/Swipeable";
import DateTimePicker from "@react-native-community/datetimepicker";
import { reminderAPI } from "../../services/api";
import { format, startOfDay, endOfDay } from "date-fns";
import EditReminderModal from "./EditReminderModal";

import drug1 from "../../assets/drug3.png";

// Sample drug data with dates
const reminders = [
  {
    id: "1",
    title: "Duspatalin retard",
    dosage: "200gm",
    quantity: "1 Pill, once per day",
    time: "9:00 AM",
    date: "2024-12-28",
    image: drug1,
  },
  {
    id: "2",
    title: "Enterogermina",
    dosage: "150gm",
    quantity: "3 Pills, once per meal",
    time: "8:00 AM",
    date: "2024-12-28",
    image: drug1,
  },
  {
    id: "3",
    title: "AMPK Metabolic Activator",
    dosage: "",
    quantity: "2 Pills, once per day",
    time: "4:00 PM",
    date: "2025-01-15",
    image: drug1,
  },
];

export default function ReminderScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [days, setDays] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const swipeableRefs = useRef({});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={50} color="#1B794B" />;
      case 'missed':
        return <Ionicons name="close-circle" size={50} color="#DD3A3A" />;
      default: // active
        return <Ionicons name="time" size={50} color="#606060" />;
    }
  };

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
    const utcDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
    const formattedDate = format(utcDate, 'yyyy-MM-dd');
    const response = await reminderAPI.getRemindersByDate(formattedDate);
    setReminders(response);
  } catch (error) {
    Alert.alert('Error', 'Failed to fetch reminders');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [selectedDate]);

useEffect(() => {
  fetchReminders();
}, [fetchReminders, selectedDate]);

useEffect(() => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  const daysArray = [];

  for (let i = 1; i <= numDays; i++) {
    const date = new Date(year, month, i);
    daysArray.push({
      label: `${i} ${date.toLocaleDateString("en-US", {
        weekday: "short",
      })}`,
      date,
    });
  }

  setDays(daysArray);

  if (
    selectedDay.getMonth() !== selectedDate.getMonth() ||
    selectedDay.getFullYear() !== selectedDate.getFullYear()
  ) {
    setSelectedDay(new Date());
  }
}, [selectedDate]);

const onRefresh = useCallback(() => {
  setRefreshing(true);
  fetchReminders();
}, [fetchReminders]);

const handleMarkAsTaken = async (id, newStatus) => {
  try {
    if (swipeableRefs.current[id]) {
      swipeableRefs.current[id].close();
    }

    const utcDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
    const formattedDate = format(utcDate, 'yyyy-MM-dd');
    
    await reminderAPI.markReminderAsTaken(id, formattedDate, newStatus);
    
    await fetchReminders();
    
  } catch (error) {
    Alert.alert('Error', 'Failed to mark reminder as taken');
  }
};

const handleDeleteReminder = async (id) => {
  try {
    await reminderAPI.deleteReminder(id);
    fetchReminders();
  } catch (error) {
    Alert.alert('Error', 'Failed to delete reminder');
  }
};

const renderLeftActions = (progress, dragX, item) => {
  const trans = dragX.interpolate({
    inputRange: [0, 50, 100, 101],
    outputRange: [-20, 0, 0, 1],
  });
  return (
    <View style={styles.leftActionContainer}>
      <Animated.View style={[styles.leftAction, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity 
          style={styles.leftActionContent}
          onPress={() => {
            handleMarkAsTaken(item._id, 'missed');
          }}
        >
          <MaterialCommunityIcons name="close-circle-multiple-outline" size={50} color="#DD3A3A" style={styles.actionIcon} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const renderRightActions = (progress, dragX, item) => {
  const trans = dragX.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [20, 0, 0],
    extrapolate: 'clamp',
  });
  return (
    <View style={styles.rightActionContainer}>
      <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity 
          style={styles.rightActionContent}
          onPress={() => {
            handleMarkAsTaken(item._id, 'completed');
          }}
        >
          <Feather name="check-circle" size={50} color="#dedede" style={styles.actionIcon} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const renderReminder = ({ item }) => {
  const status = item.currentStatus?.status || 'active';
  const isTaken = item.currentStatus?.isTaken || false;

  return (
    <View style={styles.swipeContainer}>
      <Swipeable
        friction={2}
        leftThreshold={40}
        rightThreshold={40}
        overshootRight={false}
        overshootLeft={false}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
        containerStyle={styles.swipeableContainer}
        onSwipeableOpen={(direction) => {
          if (direction === 'left') {
            handleMarkAsTaken(item._id, 'missed');
          } else if (direction === 'right') {
            handleMarkAsTaken(item._id, 'completed');
          }
        }}
        onSwipeableWillOpen={(direction) => {
        }}
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item._id] = ref;
          }
        }}
      >
        <TouchableOpacity 
          onPress={() => {
            if (!item._id) {
              Alert.alert('Error', 'Invalid reminder data');
              return;
            }
            setEditingReminderId(item._id);
          }}
          activeOpacity={0.7}
        >
          <View style={[
            styles.card,
            status === 'completed' && styles.cardCompleted,
            status === 'missed' && styles.cardMissed
          ]}>
            <View style={styles.cardRow}>
              <View style={styles.statusContainer}>
                {getStatusIcon(status)}
              </View>
              <View style={styles.cardText}>
                <View style={styles.titleRow}>
                  <Text style={[
                    styles.title,
                    status === 'completed' && styles.titleCompleted,
                    status === 'missed' && styles.titleMissed
                  ]}>
                    {item.title} {item.dosage && `- ${item.dosage}`}
                  </Text>
                </View>
                <Text style={[
                  styles.subtext,
                  status === 'completed' && styles.subtextCompleted,
                  status === 'missed' && styles.subtextMissed
                ]}>
                  {item.description}
                </Text>
                <View style={styles.timeRow}>
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={status === 'completed' ? "#1B794B" : status === 'missed' ? "#DD3A3A" : "#606060"} 
                  />
                  <Text style={[
                    styles.timeText,
                    status === 'completed' && styles.timeTextCompleted,
                    status === 'missed' && styles.timeTextMissed
                  ]}>
                    {format(new Date(item.time), 'h:mm a')}
                  </Text>
                  <Feather 
                    name="bell" 
                    size={16} 
                    color={status === 'completed' ? "#1B794B" : status === 'missed' ? "#DD3A3A" : "#606060"} 
                    style={{ marginLeft: 10 }} 
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
};

return (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.headerCenter}
      >
        <Text style={styles.headerText}>
          {selectedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AddReminder', { onReminderAdded: fetchReminders })}>
        <Feather name="plus" size={24} color="#000" />
      </TouchableOpacity>
    </View>

    {showPicker && (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(event, date) => {
          setShowPicker(false);
          if (date) {
            setSelectedDate(date);
            setSelectedDay(date);
          }
        }}
      />
    )}

    <View style={styles.daysRowWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((day, idx) => {
          const isSelected =
            day.date.getDate() === selectedDay.getDate() &&
            day.date.getMonth() === selectedDay.getMonth() &&
            day.date.getFullYear() === selectedDay.getFullYear();

          return (
            <TouchableOpacity
              key={idx}
              style={isSelected ? styles.activeDay : styles.day}
              onPress={() => {
                setSelectedDay(day.date);
                setSelectedDate(day.date);
              }}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected ? { color: "#fff" } : { color: "#000" },
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>

    <View style={styles.reminderBox}>
      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 30 }}>
            No reminders for this day.
          </Text>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        extraData={reminders}
      />
    </View>

    <EditReminderModal
      visible={!!editingReminderId}
      reminderId={editingReminderId}
      onClose={() => setEditingReminderId(null)}
      onReminderUpdated={() => {
        setEditingReminderId(null);
        fetchReminders();
      }}
    />
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 5,
  },
  daysRowWrapper: {
    height: 50,
    marginBottom: 5,
  },
  day: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 5,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  activeDay: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#1B794B",
    marginHorizontal: 5,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  reminderBox: {
    backgroundColor: "#1B794B",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 0,
  },
  cardCompleted: {
    backgroundColor: "#f0f9f0",
  },
  cardMissed: {
    backgroundColor: "#fef0f0",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  titleCompleted: {
    color: "#1B794B",
  },
  titleMissed: {
    color: "#DD3A3A",
  },
  subtext: {
    color: "#606060",
    marginVertical: 4,
  },
  subtextCompleted: {
    color: "#1B794B",
  },
  subtextMissed: {
    color: "#DD3A3A",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    color: "#606060",
    marginLeft: 4,
  },
  timeTextCompleted: {
    color: "#1B794B",
  },
  timeTextMissed: {
    color: "#DD3A3A",
  },
  swipeContainer: {
    marginBottom: 10,
  },
  swipeableContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  rightActionContainer: {
    width: 75,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  leftActionContainer: {
    width: 75,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  rightAction: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  leftAction: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rightActionContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  leftActionContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  actionIcon: {
    opacity: 1,
  },
});
