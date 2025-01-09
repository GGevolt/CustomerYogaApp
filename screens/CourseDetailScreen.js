import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebaseConfig';
import { Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CourseDetailScreen({ route }) {
    const { courseId } = route.params;
    const [courseDetails, setCourseDetails] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([]);
    useEffect(() => {
        const courseRef = ref(database, `courses/${courseId}`);
        onValue(courseRef, (snapshot) => {
        const data = snapshot.val();
        setCourseDetails(Object.assign(data.course));
        const now = new Date();
        const yogaClasses = data.yogaClasses !== undefined?  Object.assign(data.yogaClasses) : []; 
        const futureClasses = yogaClasses.filter(yogaClass => {
            const [classYear, classMonth, classDay] = yogaClass.ClassDate.split('/').map(Number);
            const [classHour, classMinute] = data.course.TimeOfCourse.split(':').map(Number);
            const classDateTime = new Date(classYear, classMonth - 1, classDay, classHour, classMinute);
            return classDateTime > now;
        });
        setAvailableClasses(futureClasses);
        });
    }, [courseId]);

    const renderClassCard = ({ item }) => (
        <Card containerStyle={styles.classCard}>
        <View style={styles.classCardContent}>
            <View style={styles.infoRow}>
            <Icon name="account" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{item.Teacher}</Text>
            </View>
            <View style={styles.infoRow}>
            <Icon name="calendar-clock" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{`${item.ClassDate} at ${courseDetails?.TimeOfCourse}`}</Text>
            </View>
            {item.Comment && (
            <View style={styles.infoRow}>
                <Icon name="comment-text-outline" size={16} color="#7F8C8D" />
                <Text style={styles.infoText}>{item.Comment}</Text>
            </View>
            )}
        </View>
        </Card>
    );

    if (!courseDetails) {
        return (
        <SafeAreaView style={styles.container}>
            <Text>Loading...</Text>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{courseDetails.ClassType}</Text>
            <View style={styles.courseDetails}>
            <View style={styles.infoRow}>
                <Icon name="calendar" size={18} color="#4A90E2" />
                <Text style={styles.courseInfoText}>{courseDetails.DayOfTheWeek}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="clock-outline" size={18} color="#4A90E2" />
                <Text style={styles.courseInfoText}>{courseDetails.TimeOfCourse}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="currency-usd" size={18} color="#4A90E2" />
                <Text style={styles.courseInfoText}>${courseDetails.PricePerClass}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="information-outline" size={18} color="#4A90E2" />
                <Text style={styles.courseInfoText}>{courseDetails.Description || 'No description available'}</Text>
            </View>
            </View>
        </View>
        
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Available Classes</Text>
        
        <FlatList
            data={availableClasses}
            renderItem={renderClassCard}
            keyExtractor={(item) => item.class_id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No upcoming classes available</Text>}
        />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  courseDetails: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseInfoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 8,
  },
  classCard: {
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
  classCardContent: {
    marginLeft: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#7F8C8D',
  },
});