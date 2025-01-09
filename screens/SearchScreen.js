import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { SearchBar, Card } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebaseConfig';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [allClasses, setAllClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);

  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const classes = transformCourseData(data);
      setAllClasses(classes);
      setFilteredClasses(classes);
    });
  }, []);

  const transformCourseData = (data) => {
    const classes = [];
    
    Object.entries(data).forEach(([courseId, courseData]) => {
      if (!courseData || !courseData.course) return;
  
      const courseDetails = courseData.course;
      
      if (courseData.yogaClasses) {
        courseData.yogaClasses.forEach(yogaClass => {
          classes.push({
            ...yogaClass,
            ClassType: courseDetails.ClassType,
            DayOfWeek: courseDetails.DayOfTheWeek,
            TimeOfCourse: courseDetails.TimeOfCourse,
            PricePerClass: courseDetails.PricePerClass,
            Capacity: courseDetails.Capacity,
            Duration: courseDetails.Duration,
            Description: courseDetails.Description,
            courseId: courseDetails.course_id
          });
        });
      }
    });
  
    return classes;
  };

  useEffect(() => {
    handleSearch();
  }, [search, dayOfWeek, timeOfDay, allClasses]);

  const handleSearch = () => {
    const filtered = allClasses.filter(yogaClass => {
      const matchesSearch = search === '' || 
        yogaClass.Teacher.toLowerCase().includes(search.toLowerCase()) ||
        yogaClass.ClassType.toLowerCase().includes(search.toLowerCase());
      const matchesDay = dayOfWeek === '' || yogaClass.DayOfWeek === dayOfWeek;
      const matchesTime = timeOfDay === '' || (
        (timeOfDay === 'morning' && yogaClass.TimeOfCourse < '12:00') ||
        (timeOfDay === 'afternoon' && yogaClass.TimeOfCourse >= '12:00' && yogaClass.TimeOfCourse < '17:00') ||
        (timeOfDay === 'evening' && yogaClass.TimeOfCourse >= '17:00')
      );
      return matchesSearch && matchesDay && matchesTime;
    });
    setFilteredClasses(filtered);
  };

  const renderClassCard = (yogaClass) => (
    <TouchableOpacity
      key={yogaClass.class_id}
      onPress={() => navigation.navigate('CourseDetail', { courseId: yogaClass.courseId })}
    >
      <Card containerStyle={styles.classCard}>
        <View style={styles.classCardContent}>
          <Text style={styles.classType}>{yogaClass.ClassType}</Text>
          <View style={styles.infoRow}>
            <Icon name="account" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{yogaClass.Teacher}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{yogaClass.DayOfWeek}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{yogaClass.TimeOfCourse}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-check" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{yogaClass.ClassDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="currency-usd" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>${yogaClass.PricePerClass}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search by teacher or class type"
            onChangeText={setSearch}
            value={search}
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInputContainer}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dayOfWeek}
              onValueChange={(itemValue) => setDayOfWeek(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Any day" value="" />
              <Picker.Item label="Monday" value="Monday" />
              <Picker.Item label="Tuesday" value="Tuesday" />
              <Picker.Item label="Wednesday" value="Wednesday" />
              <Picker.Item label="Thursday" value="Thursday" />
              <Picker.Item label="Friday" value="Friday" />
              <Picker.Item label="Saturday" value="Saturday" />
              <Picker.Item label="Sunday" value="Sunday" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={timeOfDay}
              onValueChange={(itemValue) => setTimeOfDay(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Any time" value="" />
              <Picker.Item label="Morning" value="morning" />
              <Picker.Item label="Afternoon" value="afternoon" />
              <Picker.Item label="Evening" value="evening" />
            </Picker>
          </View>
        </View>
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results</Text>
          {filteredClasses.map(renderClassCard)}
          {filteredClasses.length === 0 && (
            <Text style={styles.noResultsText}>No classes found matching your criteria.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    paddingHorizontal: 0,
  },
  searchBarInputContainer: {
    backgroundColor: '#F0F0F0',
  },
  pickerContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  classCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  classCardContent: {
    gap: 8,
  },
  classType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#7F8C8D',
  },
});