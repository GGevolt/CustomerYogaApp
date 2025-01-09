import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebaseConfig';
import { Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen({ navigation }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const coursesRef = ref(database, 'courses');
      onValue(coursesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const coursesArray = Object.entries(data).map(([id, course]) => ({
                  id,
                  ...course
              })).filter(course => course !== null);
              setCourses(coursesArray);
          } else {
              setCourses([]);
          }
      });
  }, []);
    const renderCourseCard = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.course.course_id })}
        >
        <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
            <Icon name="yoga" size={20} color="#4A90E2" />
            <Text style={styles.classType}>{item.course.ClassType}</Text>
            </View>
            <View style={styles.cardContent}>
            <View style={styles.infoRow}>
                <Icon name="calendar" size={16} color="#7F8C8D" />
                <Text style={styles.infoText}>{item.course.DayOfTheWeek}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="clock-outline" size={16} color="#7F8C8D" />
                <Text style={styles.infoText}>{item.course.TimeOfCourse}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="currency-usd" size={16} color="#7F8C8D" />
                <Text style={styles.infoText}>${item.course.PricePerClass}</Text>
            </View>
            </View>
        </Card>
        </TouchableOpacity>
    );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item.course.course_id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  listContainer: {
    padding: 8,
  },
  card: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333333',
  },
  cardContent: {
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555555',
  },
});