import { Router, Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, optionalAuthMiddleware } from "../middleware/auth.js";
import { runShoppingAgent } from "./agent.js";
import { prisma } from "../config/prisma.js";

const router = Router();

// POST /api/ai/chat
router.post("/chat", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const conv = await prisma.aIConversation.create({
        data: {
          userId: req.user?.id || null,
          title: message.substring(0, 40) + "...",
        },
      });
      activeConversationId = conv.id;
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: activeConversationId,
        role: "user",
        content: message,
      },
    });

    // Run AI Agent
    const agentResponse = await runShoppingAgent(message);

    // Save assistant message with tool calls
    await prisma.aIMessage.create({
      data: {
        conversationId: activeConversationId,
        role: "assistant",
        content: agentResponse.reply,
        toolCalls: agentResponse.toolInvocations.length ? JSON.stringify(agentResponse.toolInvocations) : null,
      },
    });

    res.json({
      success: true,
      conversationId: activeConversationId,
      reply: agentResponse.reply,
      toolInvocations: agentResponse.toolInvocations,
      quote: agentResponse.quote,
      venmoSplit: agentResponse.venmoSplit,
      xoomQuote: agentResponse.xoomQuote,
      swiftOffer: agentResponse.swiftOffer,
      suggestedActions: agentResponse.suggestedActions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/conversations
router.get("/conversations", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: req.user?.id ? { userId: req.user.id } : undefined,
      include: {
        messages: {
          take: 20,
          orderBy: { createdAt: "asc" },
        },
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    });

    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
});

export const aiController = router;
