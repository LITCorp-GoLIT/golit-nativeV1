import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { ChatConversation, ChatMessage } from '../types';

export const useChat = () => {
  const { user } = useAuth();

  const getOrCreateConversation = useCallback(
    async (hostId: string, experienceId?: string): Promise<ChatConversation | null> => {
      if (!user) return null;

      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('host_id', hostId)
        .maybeSingle();

      if (existing) return existing as ChatConversation;

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({ user_id: user.id, host_id: hostId, experience_id: experienceId ?? null })
        .select()
        .single();

      if (error) { console.error('useChat: create conv', error); return null; }
      return data as ChatConversation;
    },
    [user],
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string): Promise<ChatMessage | null> => {
      if (!user || !content.trim()) return null;
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() })
        .select()
        .single();
      if (error) { console.error('useChat: send', error); return null; }
      return data as ChatMessage;
    },
    [user],
  );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    },
    [user],
  );

  return { getOrCreateConversation, sendMessage, markAsRead };
};

export const useConversationMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      setMessages((data as ChatMessage[]) ?? []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as ChatMessage]),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  return { messages, loading };
};

export const useUserConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (data) {
      const enriched: ChatConversation[] = await Promise.all(
        data.map(async (conv: any) => {
          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          return { ...conv, last_message: lastMsg?.content ?? '', unread_count: count ?? 0 };
        }),
      );
      setConversations(enriched);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { conversations, loading, refetch: fetch };
};
