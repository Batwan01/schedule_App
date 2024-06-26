import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const CalendarScreen = ({ navigation }) => {
  const swiper = useRef();
  const [value, setValue] = useState(new Date());
  const [week, setWeek] = useState(0);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const startOfWeek = moment().add(week, 'weeks').startOf('week').toDate();
      const endOfWeek = moment().add(week, 'weeks').endOf('week').toDate();

      const attendanceSnapshot = await firestore()
        .collection('workplaces')
        .doc('테스트') // workplace 이름을 사용
        .collection('attendance')
        .where('userId', '==', auth().currentUser.uid)
        .where('timestamp', '>=', startOfWeek)
        .where('timestamp', '<=', endOfWeek)
        .get();

      const attendanceData = attendanceSnapshot.docs.map(doc => doc.data());
      setAttendance(attendanceData);
    };

    fetchAttendance();
  }, [week]);

  const weeks = React.useMemo(() => {
    const start = moment().add(week, 'weeks').startOf('week');

    return [-1, 0, 1].map(adj => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');

        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  const handleSchedule = () => {
    // 여기에 Schedule 버튼 클릭 시 수행할 작업을 추가하세요
    console.log('Scheduled for:', value.toDateString());
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
        </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={ind => {
              if (ind === 1) {
                return;
              }
              setTimeout(() => {
                const newIndex = ind - 1;
                const newWeek = week + newIndex;
                setWeek(newWeek);
                setValue(moment(value).add(newIndex, 'week').toDate());
                swiper.current.scrollTo(1, false);
              }, 100);
            }}>
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive = value.toDateString() === item.date.toDateString();
                  const dayAttendance = attendance.filter(att => moment(att.timestamp.toDate()).isSame(item.date, 'day'));
                  const workTime = dayAttendance.map(att => `${att.type}: ${moment(att.timestamp.toDate()).format('HH:mm')}`).join('\n');

                  return (
                    <TouchableWithoutFeedback key={dateIndex} onPress={() => setValue(item.date)}>
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: '#111',
                            borderColor: '#111',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: '#fff' },
                          ]}>
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate,
                            isActive && { color: '#fff' },
                          ]}>
                          {item.date.getDate()}
                        </Text>
                        {workTime && (
                          <Text
                            style={[
                              styles.itemWorkTime,
                              isActive && { color: '#fff' },
                            ]}>
                            {workTime}
                          </Text>
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={styles.subtitle}>{value.toDateString()}</Text>
          <View style={styles.placeholder}>
            <View style={styles.placeholderInset}>
              {/* Replace with your content */}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSchedule}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Schedule</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
container: {
flex: 1,
paddingVertical: 24,
},
header: {
paddingHorizontal: 16,
},
title: {
fontSize: 32,
fontWeight: '700',
color: '#1d1d1d',
marginBottom: 12,
},
picker: {
flex: 1,
maxHeight: 74,
paddingVertical: 12,
flexDirection: 'row',
alignItems: 'center',
},
subtitle: {
fontSize: 17,
fontWeight: '600',
color: '#999999',
marginBottom: 12,
},
footer: {
marginTop: 'auto',
paddingHorizontal: 16,
},
/** Item */
item: {
flex: 1,
height: 50,
marginHorizontal: 4,
paddingVertical: 6,
paddingHorizontal: 4,
borderWidth: 1,
borderRadius: 8,
borderColor: '#e3e3e3',
flexDirection: 'column',
alignItems: 'center',
},
itemRow: {
width: width,
flexDirection: 'row',
alignItems: 'flex-start',
justifyContent: 'space-between',
paddingHorizontal: 12,
},
itemWeekday: {
fontSize: 13,
fontWeight: '500',
color: '#737373',
marginBottom: 4,
},
itemDate: {
fontSize: 15,
fontWeight: '600',
color: '#111',
},
/** Placeholder */
placeholder: {
flexGrow: 1,
flexShrink: 1,
flexBasis: 0,
height: 400,
marginTop: 0,
padding: 0,
backgroundColor: 'transparent',
},
placeholderInset: {
borderWidth: 4,
borderColor: '#e5e7eb',
borderStyle: 'dashed',
borderRadius: 9,
flexGrow: 1,
flexShrink: 1,
flexBasis: 0,
},
/** Button */
btn: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
borderRadius: 8,
paddingVertical: 10,
paddingHorizontal: 20,
borderWidth: 1,
backgroundColor: '#007aff',
borderColor: '#007aff',
},
btnText: {
fontSize: 18,
lineHeight: 26,
fontWeight: '600',
color: '#fff',
},
itemWorkTime: {
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
  },
});

export default CalendarScreen;