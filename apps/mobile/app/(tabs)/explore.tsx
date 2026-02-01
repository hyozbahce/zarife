import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface Book {
  id: string;
  title: string;
  author?: string;
  durationMinutes: number;
  targetAgeMin: number;
  targetAgeMax: number;
  status: string;
}

export default function DiscoverScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    searchBooks();
  }, []);

  const searchBooks = async () => {
    setIsLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/api/books${params}`);
      setBooks(res.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={[styles.searchInput, isDark && styles.textDark]}
          placeholder="Search books..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={searchBooks}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listItem, isDark && styles.listItemDark]}
            onPress={() => router.push(`/book/${item.id}`)}
          >
            <View style={styles.listIcon}>
              <Ionicons name="book" size={24} color="#6366f1" />
            </View>
            <View style={styles.listInfo}>
              <Text style={[styles.listTitle, isDark && styles.textDark]}>{item.title}</Text>
              {item.author && <Text style={styles.listAuthor}>{item.author}</Text>}
              <Text style={styles.listMeta}>{item.durationMinutes}m | Ages {item.targetAgeMin}-{item.targetAgeMax}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No books found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#111827' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, fontSize: 16, color: '#1f2937' },
  textDark: { color: '#f9fafb' },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 12, padding: 16, gap: 12 },
  listItemDark: { backgroundColor: '#1f2937' },
  listIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center' },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  listAuthor: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  listMeta: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16 },
});
