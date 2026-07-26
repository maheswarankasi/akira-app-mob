import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { normalize } from '../utils/responsive'; // Responsive helper

// --- TIME SLOTS DATA ---
const SCHEDULE_SLOTS = [
  { id: 'm1', label: '5 - 6 AM', startHour: 5, period: 'MORNING' },
  { id: 'm2', label: '6 - 7 AM', startHour: 6, period: 'MORNING' },
  { id: 'm3', label: '7 - 8 AM', startHour: 7, period: 'MORNING' },
  { id: 'm4', label: '8 - 9 AM', startHour: 8, period: 'MORNING' },
  { id: 'm5', label: '9 - 10 AM', startHour: 9, period: 'MORNING' },
  { id: 'm6', label: '10 - 11 AM', startHour: 10, period: 'MORNING' },
  { id: 'm7', label: '11 - 12 AM', startHour: 11, period: 'MORNING' },
  { id: 'a1', label: '12 - 1 PM', startHour: 12, period: 'AFTERNOON' },
  { id: 'a2', label: '1 - 2 PM', startHour: 13, period: 'AFTERNOON' },
  { id: 'a3', label: '2 - 3 PM', startHour: 14, period: 'AFTERNOON' },
  { id: 'a4', label: '3 - 4 PM', startHour: 15, period: 'AFTERNOON' },
  { id: 'a5', label: '4 - 5 PM', startHour: 16, period: 'AFTERNOON' },
  { id: 'e1', label: '5 - 6 PM', startHour: 17, period: 'EVENING' },
  { id: 'e2', label: '6 - 7 PM', startHour: 18, period: 'EVENING' },
  { id: 'e3', label: '7 - 8 PM', startHour: 19, period: 'EVENING' },
  { id: 'e4', label: '8 - 9 PM', startHour: 20, period: 'EVENING' },
  { id: 'e5', label: '9 - 10 PM', startHour: 21, period: 'EVENING' },
  { id: 'e6', label: '10 - 11 PM', startHour: 22, period: 'EVENING' },
];

export default function ScheduleDeliveryModal({ visible, onClose, onSuccess }) {
  const [scheduleDates, setScheduleDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes('ta') ? 'ta' : 'en';

  // அடுத்த 7 நாட்களை உருவாக்கும் லாஜிக் (மொழியோடு இணைந்து)
  useEffect(() => {
    if (visible) {
      const dates = [];
      const today = new Date();
      
      const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayNamesTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const monthNamesTa = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];

      const dayNames = lang === 'ta' ? dayNamesTa : dayNamesEn;
      const monthNames = lang === 'ta' ? monthNamesTa : monthNamesEn;

      for (let i = 0; i < 7; i++) {
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + i);
        
        let dayLabel = dayNames[nextDate.getDay()];
        if (i === 0) dayLabel = t('today');
        else if (i === 1) dayLabel = t('tomorrow');

        dates.push({
          id: i,
          dayLabel,
          // தேதியை "24-Jul" அல்லது "24-ஜூலை" என்ற வடிவத்தில் மாற்றுகிறோம்
          dateString: `${nextDate.getDate()}-${monthNames[nextDate.getMonth()]}`,
          fullDate: nextDate.toISOString()
        });
      }
      setScheduleDates(dates);
      setSelectedDateIndex(0);
      setSelectedTimeSlot(null);
    }
  }, [visible, lang, t]); // மொழி மாறினாலும் அப்டேட் ஆகும்

  // --- Schedule Time Logic ---
  const currentHour = new Date().getHours();
  
  const isSlotEnabled = (startHour) => {
    if (selectedDateIndex !== 0) return true; 
    return startHour > currentHour + 1;
  };

  const handleConfirmSchedule = async () => {
    if (!selectedTimeSlot) {
      Alert.alert(t('action_required'), t('select_time_slot'));
      return;
    }
    
    const selectedDateObj = scheduleDates[selectedDateIndex];

    const scheduleData = {
      date: {
        ...selectedDateObj,
        dayLabel: selectedDateObj.dateString 
      },
      time: selectedTimeSlot
    };
    
    try {
      await AsyncStorage.setItem('deliverySchedule', JSON.stringify(scheduleData));
      if (onSuccess) onSuccess(scheduleData);
      onClose(); 
    } catch (e) {
      console.log("Error saving schedule: ", e);
    }
  };

  const renderTimeSlots = (period) => {
    const slots = SCHEDULE_SLOTS.filter(s => s.period === period);
    return (
      <View style={styles.slotGrid}>
        {slots.map(slot => {
          const enabled = isSlotEnabled(slot.startHour);
          const selected = selectedTimeSlot?.id === slot.id;
          return (
            <TouchableOpacity 
              key={slot.id} 
              style={[
                styles.slotBox, 
                selected && styles.slotBoxSelected,
                !enabled && styles.slotBoxDisabled
              ]}
              onPress={() => enabled && setSelectedTimeSlot(slot)}
              disabled={!enabled}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.slotText,
                  { fontSize: lang === 'ta' ? normalize(10) : normalize(11) }, // தமிழுக்கு ஏற்ப font size
                  selected && styles.slotTextSelected,
                  !enabled && styles.slotTextDisabled
                ]}
                numberOfLines={1}
              >
                {/* நேரத்தை அப்படியே காண்பிக்கிறோம், தேவைப்பட்டால் AM/PM-ஐ t('am') மூலம் மாற்றலாம் */}
                {slot.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <View style={styles.modalHeader}>
            <Text 
              style={[styles.modalTitle, { fontSize: lang === 'ta' ? normalize(16) : normalize(18) }]}
            >
              {t('schedule_title')}
            </Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeBtn}
              hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
            >
              <Ionicons name="close" size={normalize(20)} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Dates Horizontal List */}
          <View style={styles.datesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {scheduleDates.map((d, index) => {
                const isSelected = selectedDateIndex === index;
                return (
                  <TouchableOpacity 
                    key={d.id} 
                    style={[styles.dateBox, isSelected && styles.dateBoxSelected]}
                    onPress={() => {
                      setSelectedDateIndex(index);
                      setSelectedTimeSlot(null); 
                    }}
                    activeOpacity={0.7}
                  >
                    <Text 
                      style={[
                        styles.dateLabel, 
                        { fontSize: lang === 'ta' ? normalize(10) : normalize(12) },
                        isSelected && styles.dateTextSelected
                      ]}
                    >
                      {d.dayLabel}
                    </Text>
                    <Text 
                      style={[
                        styles.dateValue, 
                        { fontSize: lang === 'ta' ? normalize(12) : normalize(14) },
                        isSelected && styles.dateTextSelected
                      ]}
                    >
                      {d.dateString}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slots */}
          <ScrollView style={styles.timeSlotsScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.periodHeading, { fontSize: lang === 'ta' ? normalize(10) : normalize(12) }]}>
              {t('morning')}
            </Text>
            {renderTimeSlots('MORNING')}

            <Text style={[styles.periodHeading, { fontSize: lang === 'ta' ? normalize(10) : normalize(12) }]}>
              {t('afternoon')}
            </Text>
            {renderTimeSlots('AFTERNOON')}

            <Text style={[styles.periodHeading, { fontSize: lang === 'ta' ? normalize(10) : normalize(12) }]}>
              {t('evening')}
            </Text>
            {renderTimeSlots('EVENING')}
            
            <View style={{ height: normalize(20) }} />
          </ScrollView>

          <View style={styles.confirmBtnContainer}>
             <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSchedule} activeOpacity={0.8}>
               <Text 
                 style={[styles.confirmBtnText, { fontSize: lang === 'ta' ? normalize(14) : normalize(16) }]}
               >
                 {t('confirm')}
               </Text>
             </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: normalize(24), 
    borderTopRightRadius: normalize(24), 
    height: '85%', 
    paddingHorizontal: normalize(16), 
    paddingTop: normalize(20) 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: normalize(20) 
  },
  modalTitle: { 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  closeBtn: { 
    backgroundColor: '#111827', 
    width: normalize(28), 
    height: normalize(28), 
    borderRadius: normalize(14), 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  datesContainer: { 
    marginBottom: normalize(20) 
  },
  dateBox: { 
    paddingVertical: normalize(12), 
    paddingHorizontal: normalize(16), 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: normalize(12), 
    marginRight: normalize(10), 
    alignItems: 'center', 
    minWidth: normalize(80) 
  },
  dateBoxSelected: { 
    borderColor: '#058A46', 
    backgroundColor: '#F0FDF4' 
  },
  dateLabel: { 
    color: '#9CA3AF', 
    marginBottom: normalize(4) 
  },
  dateValue: { 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  dateTextSelected: { 
    color: '#058A46' 
  },
  timeSlotsScroll: { 
    flex: 1 
  },
  periodHeading: { 
    fontWeight: 'bold', 
    color: '#9CA3AF', 
    marginTop: normalize(10), 
    marginBottom: normalize(10), 
    letterSpacing: 1 
  },
  slotGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: normalize(10) 
  },
  slotBox: { 
    width: '31%', 
    paddingVertical: normalize(12), 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: normalize(8), 
    alignItems: 'center', 
    marginBottom: normalize(4) 
  },
  slotBoxSelected: { 
    borderColor: '#058A46', 
    backgroundColor: '#F0FDF4' 
  },
  slotBoxDisabled: { 
    backgroundColor: '#F3F4F6', 
    borderColor: '#F3F4F6' 
  },
  slotText: { 
    fontWeight: '600', 
    color: '#4B5563' 
  },
  slotTextSelected: { 
    color: '#058A46' 
  },
  slotTextDisabled: { 
    color: '#D1D5DB' 
  },
  confirmBtnContainer: { 
    paddingVertical: normalize(16), 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingBottom: Platform.OS === 'ios' ? normalize(32) : normalize(16) 
  },
  confirmBtn: { 
    backgroundColor: '#FF204E', 
    paddingVertical: normalize(14), 
    borderRadius: normalize(8), 
    alignItems: 'center' 
  },
  confirmBtnText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
});