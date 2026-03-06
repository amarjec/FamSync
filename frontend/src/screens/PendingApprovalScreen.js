import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

const PendingApprovalScreen = () => {
  const { refreshProfile, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.title}>Waiting for Admin Approval...</Text>
        <Text style={styles.subtitle}>
          You have requested to join a family. Access will be unlocked once an admin approves you.
        </Text>
        <Pressable style={styles.button} onPress={refreshProfile}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.outline]} onPress={logout}>
          <Text style={[styles.buttonText, styles.outlineText]}>Logout</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1d3557', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#4b5563', maxWidth: 320 },
  button: { backgroundColor: '#1d3557', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, minWidth: 180, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  outline: { backgroundColor: '#fff', borderColor: '#1d3557', borderWidth: 1 },
  outlineText: { color: '#1d3557' }
});

export default PendingApprovalScreen;
