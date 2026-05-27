import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useConversationMessages, useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, Radius } from '../constants/theme';

type RouteParams = RouteProp<RootStackParamList, 'ChatRoom'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const formatTime = (iso: string | null) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
};

const Bubble: React.FC<{ msg: ChatMessage; isMine: boolean }> = ({ msg, isMine }) => (
  <View style={[styles.bubbleWrap, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
      <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{msg.content}</Text>
    </View>
    <Text style={styles.bubbleTime}>{formatTime(msg.created_at)}</Text>
  </View>
);

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { conversationId, hostName } = route.params;

  const { user } = useAuth();
  const { sendMessage, markAsRead } = useChat();
  const { messages, loading } = useConversationMessages(conversationId);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    setSending(true);
    await sendMessage(conversationId, text);
    setSending(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Feather name="user" size={16} color="rgba(255,255,255,0.5)" />
          </View>
          <Text style={styles.headerName}>{hostName}</Text>
        </View>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#E8621A" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <Bubble msg={item} isMine={item.sender_id === user?.id} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="message-circle" size={32} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyText}>Escribe el primer mensaje</Text>
            </View>
          }
        />
      )}

      <SafeAreaView edges={['bottom']} style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje…"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Feather name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A',
    justifyContent: 'center', alignItems: 'center',
  },
  headerName: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: FontSize.sm, marginTop: 10 },
  listContent: { padding: Spacing.base, gap: 6, flexGrow: 1 },
  bubbleWrap: { maxWidth: '78%', gap: 2 },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: {
    borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleMine: { backgroundColor: '#E8621A', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#1A1A1A', borderWidth: 0.5, borderColor: '#2A2A2A', borderBottomLeftRadius: 4 },
  bubbleText: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, lineHeight: 20 },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTime: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginHorizontal: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm,
    backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: '#1A1A1A',
  },
  input: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base, paddingVertical: 10,
    color: '#FFFFFF', fontSize: FontSize.base,
    borderWidth: 0.5, borderColor: '#2A2A2A',
    maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#E8621A', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
