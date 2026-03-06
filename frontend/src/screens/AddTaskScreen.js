import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ScreenContainer from '../components/ScreenContainer';
import api from '../api/client';

const AddTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMembers = async () => {
    try {
      const { data } = await api.get('/family/members/approved');
      setMembers(data.members || []);
      if (data.members?.length) {
        setAssignedTo((prev) => prev || data.members[0]._id);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load members');
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const submit = async () => {
    if (!title.trim() || !assignedTo) {
      Alert.alert('Missing data', 'Please add title and assignee');
      return;
    }

    try {
      setLoading(true);
      await api.post('/tasks', { title, assignedTo, isPriority });
      setTitle('');
      setIsPriority(false);
      Alert.alert('Success', 'Task created');
    } catch (error) {
      Alert.alert('Create failed', error.response?.data?.message || 'Could not create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.title}>Add New Task</Text>

        <TextInput
          style={styles.input}
          placeholder="Task Title"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={assignedTo} onValueChange={setAssignedTo}>
            {members.map((m) => (
              <Picker.Item key={m._id} label={`${m.name} (${m.phoneNumber})`} value={m._id} />
            ))}
          </Picker>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>High Priority</Text>
          <Switch value={isPriority} onValueChange={setIsPriority} />
        </View>

        <Pressable style={styles.button} onPress={submit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Create Task'}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#1d3557' },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 12 },
  pickerWrap: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10 },
  label: { fontWeight: '700' },
  button: { marginTop: 4, backgroundColor: '#1d3557', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' }
});

export default AddTaskScreen;
