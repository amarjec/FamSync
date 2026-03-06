import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const SetupFamilyScreen = () => {
  const { refreshProfile } = useAuth();
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const createFamily = async () => {
    try {
      setLoading(true);
      await api.post('/family/create', { familyName });
      await refreshProfile();
    } catch (error) {
      Alert.alert('Create failed', error.response?.data?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const joinFamily = async () => {
    try {
      setLoading(true);
      await api.post('/family/join', { inviteCode });
      await refreshProfile();
    } catch (error) {
      Alert.alert('Join failed', error.response?.data?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.title}>Set Up Your Family</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create Family</Text>
          <TextInput
            style={styles.input}
            placeholder="Family Name"
            value={familyName}
            onChangeText={setFamilyName}
          />
          <Pressable style={styles.button} onPress={createFamily} disabled={loading || !familyName.trim()}>
            <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Create Family'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Join Family</Text>
          <TextInput
            style={styles.input}
            placeholder="Invite Code"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Pressable style={styles.button} onPress={joinFamily} disabled={loading || inviteCode.length !== 6}>
            <Text style={styles.buttonText}>Join with Code</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#1d3557', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 },
  sectionTitle: { fontWeight: '700', fontSize: 16, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 },
  button: { backgroundColor: '#1d3557', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' }
});

export default SetupFamilyScreen;
