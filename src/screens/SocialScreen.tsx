import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth';
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

const ConvRow: React.FC<{ conv: ChatConversation; onPress: () => void }> = ({ conv, onPress }) => (
  <TouchableOpacity style={styles.convRow} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.convAvatar}>
      <Feather name="user" size={18} color="rgba(255,255,255,0.4)" />
    </View>
    <View style={styles.convBody}>
      <View style={styles.convTop}>
        <Text style={styles.convName}>{conv.host_name ?? 'Anfitrión'}</Text>
        <Text style={styles.convTime}>{timeAgo(conv.last_message_at)}</Text>
      </View>
      <Text style={styles.convPreview} numberOfLines={1}>
        {conv.last_message ?? 'Conversación nueva'}
      </Text>
    </View>
    {(conv.unread_count ?? 0) > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{conv.unread_count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const AuthenticatedSocial: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { conversations, loading, refetch } = useUserConversations();

  const openChat = (conv: ChatConversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ChatRoom', { conversationId: conv.id, hostName: conv.host_name ?? 'Anfitrión' });
  };

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Feather name="message-circle" size={16} color="#E8621A" />
        <Text style={styles.sectionTitle}>Mensajes</Text>
        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => navigation.navigate('ChatList')}
        >
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#E8621A" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptySection}>
          <Feather name="message-circle" size={28} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>Sin mensajes</Text>
          <Text style={styles.emptySub}>
            Contacta a un anfitrión desde el detalle de cualquier experiencia
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations.slice(0, 8)}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ConvRow conv={item} onPress={() => openChat(item)} />}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}

      {/* Social hint */}
      <View style={styles.comingSoon}>
        <Feather name="users" size={20} color="rgba(255,255,255,0.2)" />
        <Text style={styles.comingSoonText}>Feed social · Próximamente</Text>
      </View>
    </View>
  );
};

export const SocialScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Feather name="users" size={48} color="rgba(255,255,255,0.12)" />
          <Text style={styles.title}>Social</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para ver tus mensajes y conectar con anfitriones
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); navigation.navigate('Auth'); }}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
      </View>
      <AuthenticatedSocial />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerTitle: { color: '#FFFFFF', fontSize: FontSize['2xl'], fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  title: {
    color: Colors.textPrimary, fontSize: FontSize['2xl'], fontWeight: '700',
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary, fontSize: FontSize.sm,
    textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl,
  },
  loginBtn: {
    backgroundColor: '#E8621A', borderRadius: Radius.lg,
    paddingVertical: 15, paddingHorizontal: 40,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  seeAll: { paddingHorizontal: 10, paddingVertical: 4 },
  seeAllText: { color: '#E8621A', fontSize: FontSize.sm, fontWeight: '600' },
  convRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: 12, gap: 12,
  },
  convAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A',
    justifyContent: 'center', alignItems: 'center',
  },
  convBody: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  convName: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  convTime: { color: 'rgba(255,255,255,0.3)', fontSize: FontSize.xs },
  convPreview: { color: 'rgba(255,255,255,0.4)', fontSize: FontSize.sm },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E8621A', justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  emptySection: { alignItems: 'center', padding: Spacing.xl, gap: 8 },
  emptyTitle: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600' },
  emptySub: { color: 'rgba(255,255,255,0.35)', fontSize: FontSize.sm, textAlign: 'center' },
  comingSoon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: Spacing.xl,
  },
  comingSoonText: { color: 'rgba(255,255,255,0.2)', fontSize: FontSize.sm },
});
