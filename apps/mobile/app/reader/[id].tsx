import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface BookPage {
  id: string;
  pageNumber: number;
  riveFileUrl?: string;
  narrationText?: string;
  narrationAudioUrl?: string;
}

interface BookDetail {
  id: string;
  title: string;
  pages: BookPage[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    if (book) {
      reportProgress();
    }
  }, [currentPage, book]);

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

  const reportProgress = async () => {
    if (!book) return;
    try {
      await api.post('/api/progress', {
        bookId: id,
        currentPage: currentPage + 1,
        totalPages: book.pages.length,
        readingTimeSeconds: 30,
        interactionCount: 1,
        isCompleted: currentPage + 1 >= book.pages.length,
      });
    } catch {
      // silent
    }
  };

  const goNext = () => {
    if (book && currentPage < book.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading || !book) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const page = book.pages[currentPage];

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.pageCount}>{currentPage + 1}/{book.pages.length}</Text>
      </View>

      {/* Page content */}
      <View style={styles.pageContent}>
        {page ? (
          <View style={styles.pageCard}>
            <View style={styles.pageIllustration}>
              <Ionicons name="image" size={64} color="rgba(255,255,255,0.3)" />
              {page.riveFileUrl && (
                <Text style={styles.riveLabel}>Rive Animation</Text>
              )}
            </View>
            {page.narrationText && (
              <Text style={styles.narrationText}>{page.narrationText}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.noContent}>No content</Text>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={goPrev}
          style={[styles.navButton, currentPage === 0 && styles.navDisabled]}
          disabled={currentPage === 0}
        >
          <Ionicons name="chevron-back" size={32} color={currentPage === 0 ? '#555' : '#fff'} />
        </TouchableOpacity>

        {/* Page dots */}
        <View style={styles.dots}>
          {book.pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentPage && styles.dotActive, i < currentPage && styles.dotRead]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={goNext}
          style={[styles.navButton, currentPage >= book.pages.length - 1 && styles.navDisabled]}
          disabled={currentPage >= book.pages.length - 1}
        >
          <Ionicons name="chevron-forward" size={32} color={currentPage >= book.pages.length - 1 ? '#555' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, gap: 12 },
  iconButton: { padding: 8 },
  topTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  pageCount: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  pageContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  pageCard: { width: SCREEN_WIDTH - 40, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  pageIllustration: { height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(99,102,241,0.1)' },
  riveLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8 },
  narrationText: { color: '#e5e7eb', fontSize: 20, lineHeight: 32, padding: 24, textAlign: 'center' },
  noContent: { color: '#6b7280', fontSize: 18 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 50 },
  navButton: { padding: 16 },
  navDisabled: { opacity: 0.3 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 20, backgroundColor: '#fff' },
  dotRead: { backgroundColor: 'rgba(255,255,255,0.5)' },
});
