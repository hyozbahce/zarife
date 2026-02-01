import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/auth-context';

export default function StudentLoginScreen() {
  const [schoolCode, setSchoolCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { studentLogin } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!schoolCode || !username) {
      setError('Please enter your school code and username');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await studentLogin(schoolCode, username);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid school code or username');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Z</Text>
          </View>
          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>Enter your school code to get started</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="School Code"
          value={schoolCode}
          onChangeText={(text) => setSchoolCode(text.toUpperCase())}
          autoCapitalize="characters"
          placeholderTextColor="#999"
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="Your Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Reading</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Back to Teacher/Admin Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#f59e0b', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, color: '#1f2937' },
  codeInput: { textAlign: 'center', fontSize: 24, letterSpacing: 4, fontWeight: 'bold' },
  button: { backgroundColor: '#f59e0b', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6366f1', fontSize: 14 },
});
