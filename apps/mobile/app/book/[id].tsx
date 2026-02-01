import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface BookDetail {
  id: string;
  title: string;
  author?: string;
  illustrator?: string;
  language: string;
  targetAgeMin: number;
  targetAgeMax: number;
  durationMinutes: number;
  description?: string;
  status: string;
  pageCount: number;
  pages: { id: string; pageNumber: number; narrationText?: string }[];
}

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await api.get(`/api/books/${id}`);
      setBook(res.data);
    } catch {
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!book) return null;

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Cover */}
      <View style={[styles.cover, isDark && { backgroundColor: '#374151' }]}>
        <Ionicons name="book" size={80} color="#6366f1" />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, isDark && styles.textDark]}>{book.title}</Text>
        {book.author && <Text style={styles.author}>by {book.author}</Text>}
        {book.illustrator && <Text style={styles.author}>Illustrated by {book.illustrator}</Text>}

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, isDark && styles.metaChipDark]}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{book.durationMinutes} min</Text>
          </View>
          <View style={[styles.metaChip, isDark && styles.metaChipDark]}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>Ages {book.targetAgeMin}-{book.targetAgeMax}</Text>
          </View>
          <View style={[styles.metaChip, isDark && styles.metaChipDark]}>
            <Ionicons name="document-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{book.pageCount} pages</Text>
          </View>
        </View>

        {book.description && (
          <Text style={[styles.description, isDark && { color: '#d1d5db' }]}>{book.description}</Text>
        )}

        {/* Read Button */}
        {book.pages.length > 0 && (
          <TouchableOpacity
            style={styles.readButton}
            onPress={() => router.push(`/reader/${book.id}`)}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.readButtonText}>Start Reading</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#111827' },
  textDark: { color: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  cover: { height: 250, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center' },
  info: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  author: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 16 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  metaChipDark: { backgroundColor: '#374151' },
  metaText: { fontSize: 12, color: '#6b7280' },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 24 },
  readButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 16 },
  readButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
