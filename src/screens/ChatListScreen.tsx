import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserConversations } from '../hooks/useChat';
import { ChatConversation, RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const timeAgo = (iso: string | null) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

const ConvItem: React.FC<{ conv: ChatConversation; onPress: () => void }> = ({ conv, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.avatar}>
      <Feather name="user" size={20} color="rgba(255,255,255,0.4)" />
    </View>
    <View style={styles.itemBody}>
      <View style={styles.itemRow}>
        <Text style={styles.itemName} numberOfLines={1}>
          {conv.host_name ?? 'Anfitrión'}
        </Text>
        <Text style={styles.itemTime}>{timeAgo(conv.last_message_at)}</Text>
      </View>
      <Text style={styles.itemPreview} numberOfLines={1}>
        {conv.last_message ?? 'Conversación nueva'}
      </Text>
    </View>
    {(conv.unread_count ?? 0) > 0 && (
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadText}>{conv.unread_count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { conversations, loading, refetch } = useUserConversations();

  const openChat = (conv: ChatConversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ChatRoom', {
      conversationId: conv.id,
      hostName: conv.host_name ?? 'Anfitrión',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#E8621A" size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Feather name="message-circle" size={40} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>Sin mensajes aún</Text>
          <Text style={styles.emptySub}>
            Cuando contactes a un anfitrión, los mensajes aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ConvItem conv={item} onPress={() => openChat(item)} />}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          contentContainerStyle={{ paddingVertical: Spacing.sm }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.md },
  emptySub: { color: 'rgba(255,255,255,0.35)', fontSize: FontSize.sm, textAlign: 'center', marginTop: 6 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: 14, gap: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A',
    justifyContent: 'center', alignItems: 'center',
  },
  itemBody: { flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  itemTime: { color: 'rgba(255,255,255,0.35)', fontSize: FontSize.xs },
  itemPreview: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.sm },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E8621A', justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
