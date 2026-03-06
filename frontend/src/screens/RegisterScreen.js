import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const onChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    try {
      setLoading(true);
      await register({ ...form, fcmToken: 'demo-fcm-token' });
    } catch (error) {
      Alert.alert('Registration failed', error.response?.data?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={(v) => onChange('name', v)} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChangeText={(v) => onChange('phoneNumber', v)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(v) => onChange('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={form.password}
          onChangeText={(v) => onChange('password', v)}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Register'}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1d3557', textAlign: 'center', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  button: { backgroundColor: '#1d3557', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontWeight: '700' }
});

export default RegisterScreen;
