import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface Book {
  id: string;
  title: string;
  author?: string;
  language: string;
  targetAgeMin: number;
  targetAgeMax: number;
  durationMinutes: number;
  status: string;
  pageCount: number;
}

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await api.get('/api/books?status=Published');
      setBooks(res.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={() => router.push(`/book/${item.id}`)}
    >
      <View style={[styles.cover, { backgroundColor: isDark ? '#374151' : '#e0e7ff' }]}>
        <Ionicons name="book" size={40} color="#6366f1" />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={2}>{item.title}</Text>
        {item.author && <Text style={styles.author}>{item.author}</Text>}
        <View style={styles.meta}>
          <Text style={styles.metaText}>{item.durationMinutes}m</Text>
          <Text style={styles.metaText}>Ages {item.targetAgeMin}-{item.targetAgeMax}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.center, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {books.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="library-outline" size={64} color="#9ca3af" />
          <Text style={[styles.emptyText, isDark && styles.textDark]}>No books available yet</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12 },
  row: { gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardDark: { backgroundColor: '#1f2937' },
  cover: { height: 140, justifyContent: 'center', alignItems: 'center' },
  info: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  textDark: { color: '#f9fafb' },
  author: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 8 },
  metaText: { fontSize: 11, color: '#9ca3af' },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
});
