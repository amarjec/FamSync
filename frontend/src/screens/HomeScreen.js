import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [onlyMine, setOnlyMine] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks || []);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not load tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (!onlyMine) return tasks;
    return tasks.filter((task) => task.assignedTo?._id === user?._id);
  }, [tasks, onlyMine, user]);

  const completeTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/complete`);
      await fetchTasks();
    } catch (error) {
      Alert.alert('Update failed', error.response?.data?.message || 'Could not update task');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Task Feed</Text>
        <Pressable style={styles.toggle} onPress={() => setOnlyMine((v) => !v)}>
          <Text style={styles.toggleText}>{onlyMine ? 'Show All Family Tasks' : 'Show My Tasks'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No tasks found.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, item.isPriority && styles.priorityCard]}>
            <View style={styles.rowBetween}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>

            <Text style={styles.meta}>Assigned By: {item.assignedBy?.name || '-'}</Text>
            <Text style={styles.meta}>Assigned To: {item.assignedTo?.name || '-'}</Text>

            {item.status === 'Pending' && item.assignedTo?._id === user?._id ? (
              <Pressable style={styles.completeBtn} onPress={() => completeTask(item._id)}>
                <Text style={styles.completeBtnText}>Mark as Completed</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: { marginBottom: 12, gap: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1d3557' },
  toggle: { alignSelf: 'flex-start', backgroundColor: '#e9eff5', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  toggleText: { color: '#1d3557', fontWeight: '700', fontSize: 12 },
  list: { gap: 10, paddingBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 4 },
  priorityCard: { borderColor: '#dc2626', borderWidth: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  taskTitle: { fontWeight: '700', fontSize: 16, flex: 1, paddingRight: 8 },
  status: { color: '#6b7280', fontWeight: '700' },
  meta: { color: '#4b5563', fontSize: 12 },
  completeBtn: { marginTop: 8, backgroundColor: '#16a34a', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' }
});

export default HomeScreen;
