import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const ProfileScreen = () => {
  const { user, family, logout, refreshProfile } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);

  const isAdmin = useMemo(() => {
    if (!family || !user) return false;
    return family.adminId?.toString?.() === user._id;
  }, [family, user]);

  const loadPending = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/family/pending');
      setPendingUsers(data.pendingUsers || []);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not load pending users');
    }
  };

  useEffect(() => {
    loadPending();
  }, [isAdmin]);

  const approve = async (id) => {
    try {
      await api.put(`/family/approve/${id}`);
      loadPending();
    } catch (error) {
      Alert.alert('Approve failed', error.response?.data?.message || 'Try again');
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/family/reject/${id}`);
      loadPending();
    } catch (error) {
      Alert.alert('Reject failed', error.response?.data?.message || 'Try again');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.item}><Text style={styles.label}>Name:</Text> {user?.name}</Text>
          <Text style={styles.item}><Text style={styles.label}>Phone:</Text> {user?.phoneNumber}</Text>
          <Text style={styles.item}><Text style={styles.label}>Family:</Text> {family?.familyName || '-'}</Text>
          <Text style={styles.item}><Text style={styles.label}>Invite Code:</Text> {family?.inviteCode || '-'}</Text>
        </View>

        <Pressable style={styles.secondaryButton} onPress={refreshProfile}>
          <Text style={styles.secondaryButtonText}>Refresh Profile</Text>
        </Pressable>

        {isAdmin ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            <FlatList
              data={pendingUsers}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={<Text style={styles.empty}>No pending users.</Text>}
              renderItem={({ item }) => (
                <View style={styles.pendingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pendingName}>{item.name}</Text>
                    <Text style={styles.pendingMeta}>{item.phoneNumber} | {item.email}</Text>
                  </View>
                  <Pressable style={styles.approveBtn} onPress={() => approve(item._id)}>
                    <Text style={styles.approveText}>Accept</Text>
                  </Pressable>
                  <Pressable style={styles.rejectBtn} onPress={() => reject(item._id)}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </Pressable>
                </View>
              )}
            />
          </View>
        ) : null}

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#1d3557' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 6 },
  label: { fontWeight: '700' },
  item: { color: '#111827' },
  sectionTitle: { fontWeight: '800', fontSize: 16, marginBottom: 4 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  pendingName: { fontWeight: '700' },
  pendingMeta: { color: '#6b7280', fontSize: 12 },
  approveBtn: { backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  approveText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  rejectBtn: { borderColor: '#dc2626', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  rejectText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  empty: { color: '#6b7280', marginTop: 4 },
  logoutBtn: { backgroundColor: '#dc2626', padding: 12, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderColor: '#1d3557', borderWidth: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#1d3557', fontWeight: '700' }
});

export default ProfileScreen;
