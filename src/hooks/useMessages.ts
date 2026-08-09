import { useCallback, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  ref,
  push,
  onValue,
  query,
  orderByChild,
  limitToLast,
  type DatabaseReference,
} from "firebase/database";

export interface Message {
  id: string;
  text: string;
  senderName: string;
  timestamp: number;
}

export interface InboxMessage extends Message {
  memberId: string;
}

const SENT_KEY = "ll-sent-messages";
const LOCAL_MESSAGES_KEY = "ll-local-reply-messages";
const LOCAL_MESSAGES_EVENT = "ll-local-reply-messages:changed";
const MAX_MESSAGES = 50;
const MAX_TEXT_LENGTH = 200;
const DEFAULT_SENDER_NAME = "Một vì sao";

function getSentList(): string[] {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markSent(memberId: string) {
  const list = getSentList();
  if (!list.includes(memberId)) {
    list.push(memberId);
    localStorage.setItem(SENT_KEY, JSON.stringify(list));
  }
}

function readLocalStore(): Record<string, Record<string, Message>> {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalStore(store: Record<string, Record<string, Message>>) {
  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(LOCAL_MESSAGES_EVENT));
}

function getLocalMessages(memberId: string): Message[] {
  const store = readLocalStore();
  const messages = Object.values(store[memberId] ?? {});
  return messages.sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_MESSAGES);
}

function getAllLocalMessages(): InboxMessage[] {
  const store = readLocalStore();
  const messages: InboxMessage[] = [];

  Object.entries(store).forEach(([memberId, memberMessages]) => {
    Object.values(memberMessages).forEach((message) => {
      messages.push({ ...message, memberId });
    });
  });

  return messages.sort((a, b) => b.timestamp - a.timestamp);
}

function saveLocalMessage(memberId: string, message: Message) {
  const store = readLocalStore();
  store[memberId] = {
    ...(store[memberId] ?? {}),
    [message.id]: message,
  };
  writeLocalStore(store);
}

export function useMessages(memberId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSent, setHasSent] = useState(false);
  const [error, setError] = useState(false);
  const firebaseReady = Boolean(db);

  useEffect(() => {
    if (memberId) {
      setHasSent(getSentList().includes(memberId));
    }
  }, [memberId]);

  useEffect(() => {
    if (!memberId || !db) {
      setMessages(memberId ? getLocalMessages(memberId) : []);
      setLoading(false);
      setError(false);

      const handleLocalMessagesChanged = () => {
        if (memberId) {
          setMessages(getLocalMessages(memberId));
        }
      };

      window.addEventListener(LOCAL_MESSAGES_EVENT, handleLocalMessagesChanged);
      return () => window.removeEventListener(LOCAL_MESSAGES_EVENT, handleLocalMessagesChanged);
    }

    setLoading(true);
    setError(false);

    const messagesRef: DatabaseReference = ref(db, `messages/${memberId}`);
    const q = query(messagesRef, orderByChild("timestamp"), limitToLast(MAX_MESSAGES));

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setMessages([]);
          setLoading(false);
          setError(false);
          return;
        }

        const list: Message[] = Object.entries(data).map(([id, val]: [string, unknown]) => {
          const value = val as Record<string, unknown>;
          return {
            id,
            text: String(value.text ?? ""),
            senderName: String(value.senderName ?? DEFAULT_SENDER_NAME),
            timestamp: Number(value.timestamp ?? 0),
          };
        });

        list.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(list);
        setLoading(false);
        setError(false);
      },
      () => {
        try {
          const fallbackMessages = getLocalMessages(memberId);
          setMessages(fallbackMessages);
          setError(fallbackMessages.length === 0);
        } catch {
          setMessages([]);
          setError(true);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [memberId]);

  const sendMessage = useCallback(
    async (text: string, senderName?: string) => {
      if (!memberId || hasSent) {
        return false;
      }

      const trimmed = text.trim().slice(0, MAX_TEXT_LENGTH);
      if (!trimmed) {
        return false;
      }

      const safeSenderName = senderName?.trim() || DEFAULT_SENDER_NAME;

      if (!db) {
        const message: Message = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text: trimmed,
          senderName: safeSenderName,
          timestamp: Date.now(),
        };

        saveLocalMessage(memberId, message);
        setMessages(getLocalMessages(memberId));
        markSent(memberId);
        setHasSent(true);
        return true;
      }

      const messagesRef = ref(db, `messages/${memberId}`);
      await push(messagesRef, {
        text: trimmed,
        senderName: safeSenderName,
        timestamp: Date.now(),
      });

      markSent(memberId);
      setHasSent(true);
      return true;
    },
    [hasSent, memberId],
  );

  return { messages, loading, error, hasSent, sendMessage, firebaseReady };
}

export function useAllMessages(enabled = true) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setMessages([]);
      setLoading(false);
      setError(false);
      return undefined;
    }

    if (!db) {
      setMessages(getAllLocalMessages());
      setLoading(false);
      setError(false);

      const handleLocalMessagesChanged = () => {
        setMessages(getAllLocalMessages());
      };

      window.addEventListener(LOCAL_MESSAGES_EVENT, handleLocalMessagesChanged);
      return () => window.removeEventListener(LOCAL_MESSAGES_EVENT, handleLocalMessagesChanged);
    }

    setLoading(true);
    setError(false);

    const messagesRef: DatabaseReference = ref(db, "messages");
    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data || typeof data !== "object") {
          setMessages([]);
          setLoading(false);
          setError(false);
          return;
        }

        const list: InboxMessage[] = [];

        Object.entries(data as Record<string, unknown>).forEach(([memberId, value]) => {
          if (!value || typeof value !== "object") {
            return;
          }

          Object.entries(value as Record<string, unknown>).forEach(([id, val]) => {
            const message = val as Record<string, unknown>;
            list.push({
              id,
              memberId,
              text: String(message.text ?? ""),
              senderName: String(message.senderName ?? DEFAULT_SENDER_NAME),
              timestamp: Number(message.timestamp ?? 0),
            });
          });
        });

        list.sort((a, b) => b.timestamp - a.timestamp);
        setMessages(list);
        setLoading(false);
        setError(false);
      },
      () => {
        try {
          const fallbackMessages = getAllLocalMessages();
          setMessages(fallbackMessages);
          setError(fallbackMessages.length === 0);
        } catch {
          setMessages([]);
          setError(true);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [enabled]);

  return { messages, loading, error };
}
