import prisma from './prisma';
import { executeFlow } from './flowEngine';

interface IncomingMessage {
  channelId: string;
  teamId: string;
  channelType: 'FACEBOOK_MESSENGER' | 'TELEGRAM';
  platformUserId: string;
  platformUserName?: string;
  message: string;
  messageType: string;
  metadata?: Record<string, unknown>;
}

export async function processIncomingMessage(msg: IncomingMessage) {
  // Find or create contact
  let contact = await prisma.contact.findUnique({
    where: {
      platformId_channelId: {
        platformId: msg.platformUserId,
        channelId: msg.channelId,
      },
    },
  });

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        platformId: msg.platformUserId,
        channelId: msg.channelId,
        teamId: msg.teamId,
        name: msg.platformUserName || `User ${msg.platformUserId.slice(-6)}`,
      },
    });
  }

  // Find or create chat
  let chat = await prisma.chat.findFirst({
    where: {
      contactId: contact.id,
      channelId: msg.channelId,
      status: { in: ['OPEN', 'ASSIGNED'] },
    },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        contactId: contact.id,
        channelId: msg.channelId,
        status: 'OPEN',
      },
    });
  }

  // Store the incoming message
  await prisma.message.create({
    data: {
      chatId: chat.id,
      direction: 'INCOMING',
      type: msg.messageType as any,
      content: msg.message,
      metadata: msg.metadata as any,
    },
  });

  // Track analytics event
  await prisma.analyticsEvent.create({
    data: {
      contactId: contact.id,
      eventType: 'message_received',
      channel: msg.channelType,
      eventData: {
        messageType: msg.messageType,
        messageLength: msg.message.length,
      },
    },
  });

  // Find matching flows
  const flows = await prisma.flow.findMany({
    where: {
      teamId: msg.teamId,
      isActive: true,
    },
  });

  for (const flow of flows) {
    const shouldTrigger = checkFlowTrigger(flow, msg);
    if (shouldTrigger) {
      await executeFlow(flow, contact, chat, msg);
    }
  }
}

function checkFlowTrigger(flow: any, msg: IncomingMessage): boolean {
  switch (flow.triggerType) {
    case 'KEYWORD':
      if (!flow.triggerValue) return false;
      const keywords = flow.triggerValue.split(',').map((k: string) => k.trim().toLowerCase());
      return keywords.some((kw: string) => msg.message.toLowerCase().includes(kw));

    case 'FIRST_MESSAGE':
      return true; // Already filtered to new chats

    case 'BUTTON_CLICK':
      return msg.messageType === 'BUTTON';

    default:
      return false;
  }
}

export async function sendPlatformMessage(
  channel: any,
  platformUserId: string,
  content: string,
  type: string = 'TEXT',
  metadata?: Record<string, unknown>
) {
  if (channel.type === 'FACEBOOK_MESSENGER') {
    await sendFacebookMessage(channel, platformUserId, content, type, metadata);
  } else if (channel.type === 'TELEGRAM') {
    await sendTelegramMessage(channel, platformUserId, content, type, metadata);
  }
}

async function sendFacebookMessage(
  channel: any,
  recipientId: string,
  content: string,
  type: string,
  metadata?: Record<string, unknown>
) {
  const messagePayload: any = {
    recipient: { id: recipientId },
  };

  if (type === 'BUTTON' && metadata?.buttons) {
    messagePayload.message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: content,
          buttons: (metadata.buttons as any[]).map((btn) => ({
            type: 'postback',
            title: btn.label,
            payload: btn.value,
          })),
        },
      },
    };
  } else if (type === 'QUICK_REPLY' && metadata?.quickReplies) {
    messagePayload.message = {
      text: content,
      quick_replies: (metadata.quickReplies as any[]).map((qr) => ({
        content_type: 'text',
        title: qr.label,
        payload: qr.value,
      })),
    };
  } else if (type === 'IMAGE') {
    messagePayload.message = {
      attachment: {
        type: 'image',
        payload: { url: content, is_reusable: true },
      },
    };
  } else {
    messagePayload.message = { text: content };
  }

  await fetch(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${channel.accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    }
  );
}

async function sendTelegramMessage(
  channel: any,
  chatId: string,
  content: string,
  type: string,
  metadata?: Record<string, unknown>
) {
  const botToken = channel.botToken;
  const telegramChatId = metadata?.chatId || chatId;

  if (type === 'BUTTON' && metadata?.buttons) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: content,
        reply_markup: {
          inline_keyboard: [(metadata.buttons as any[]).map((btn) => ({
            text: btn.label,
            callback_data: btn.value,
          }))],
        },
      }),
    });
  } else if (type === 'IMAGE') {
    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        photo: content,
      }),
    });
  } else {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: content,
      }),
    });
  }
}
