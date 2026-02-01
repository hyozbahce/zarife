import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/auth-context';
import api from '../../services/api';

interface ProgressItem {
  id: string;
  bookId: string;
  bookTitle?: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
  readingTimeSeconds: number;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [progress, setProgress] = useState<ProgressItem[]>([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const res = await api.get('/api/progress');
      setProgress(res.data);
    } catch {
      // handle error
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const totalBooks = progress.filter(p => p.isCompleted).length;
  const totalTime = progress.reduce((sum, p) => sum + p.readingTimeSeconds, 0);
  const displayName = user?.email.split('@')[0] || 'Reader';

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Avatar & Name */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, isDark && styles.textDark]}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <Ionicons name="book" size={24} color="#6366f1" />
          <Text style={[styles.statValue, isDark && styles.textDark]}>{totalBooks}</Text>
          <Text style={styles.statLabel}>Books Read</Text>
        </View>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <Ionicons name="time" size={24} color="#f59e0b" />
          <Text style={[styles.statValue, isDark && styles.textDark]}>{Math.floor(totalTime / 60)}m</Text>
          <Text style={styles.statLabel}>Reading Time</Text>
        </View>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <Ionicons name="flame" size={24} color="#ef4444" />
          <Text style={[styles.statValue, isDark && styles.textDark]}>{progress.length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
      </View>

      {/* Recent Activity */}
      {progress.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Recent Activity</Text>
          {progress.slice(0, 5).map((item) => (
            <View key={item.id} style={[styles.activityItem, isDark && styles.activityItemDark]}>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, isDark && styles.textDark]}>{item.bookTitle || 'Unknown Book'}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${item.totalPages > 0 ? (item.currentPage / item.totalPages) * 100 : 0}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.isCompleted ? 'Completed' : `Page ${item.currentPage}/${item.totalPages}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#111827' },
  textDark: { color: '#f9fafb' },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  role: { fontSize: 12, color: '#9ca3af', marginTop: 2, textTransform: 'capitalize' },
  stats: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  statCardDark: { backgroundColor: '#1f2937' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 11, color: '#6b7280' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  activityItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  activityItemDark: { backgroundColor: '#1f2937' },
  activityInfo: { gap: 8 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6b7280' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginHorizontal: 16, marginBottom: 40, borderWidth: 1, borderColor: '#fecaca', borderRadius: 12 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '500' },
});
