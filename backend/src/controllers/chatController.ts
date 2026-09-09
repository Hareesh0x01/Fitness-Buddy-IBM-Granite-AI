import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAIResponse, AIMessage } from '../services/aiService';
import { chatStore, profileStore } from '../utils/store';
import { ChatMessage } from '../models/types';

// POST /api/chat
export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const { message, sessionId } = req.body as {
      message?: string;
      sessionId?: string;
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    if (message.trim().length > 2000) {
      res.status(400).json({ error: 'Message too long. Please keep it under 2000 characters.' });
      return;
    }

    // Get or create session
    let session = sessionId ? chatStore.getSession(sessionId) : null;
    if (!session) {
      session = chatStore.createSession();
    }

    // Get user profile for context
    const profile = profileStore.get();

    // Build message history (last 10 messages for context window)
    const recentHistory = session.messages.slice(-10);
    const aiMessages: AIMessage[] = recentHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Add current user message
    aiMessages.push({ role: 'user', content: message.trim() });

    // Get AI response
    const aiResponse = await getAIResponse(aiMessages, message.trim(), profile || undefined);

    // Save messages to session
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    const assistantMsg: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse.text,
      timestamp: new Date().toISOString(),
    };

    session.messages.push(userMsg, assistantMsg);
    session.updatedAt = new Date().toISOString();
    chatStore.saveSession(session);

    res.json({
      sessionId: session.id,
      message: assistantMsg,
      provider: aiResponse.provider,
    });
  } catch (err) {
    console.error('[Chat Controller]', err);
    res.status(503).json({
      error: 'Fitness Buddy is temporarily unable to connect to the AI service. Please try again.',
    });
  }
}

// GET /api/chat/history/:sessionId
export async function getChatHistory(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'Session ID required.' });
      return;
    }
    const session = chatStore.getSession(sessionId as string);
    if (!session) {
      res.json({ messages: [], sessionId });
      return;
    }
    res.json({ messages: session.messages, sessionId });
  } catch (err) {
    console.error('[Chat History]', err);
    res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
}
