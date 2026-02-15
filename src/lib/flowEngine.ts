import prisma from './prisma';
import { sendPlatformMessage } from './messaging';

interface FlowContext {
  variables: Record<string, string>;
  contactId: string;
  chatId: string;
  channelId: string;
  teamId: string;
  platformUserId: string;
  lastMessage: string;
  channelType: string;
}

export async function executeFlow(
  flow: any,
  contact: any,
  chat: any,
  incomingMsg: any
) {
  const nodes = flow.nodes as any[];
  const edges = flow.edges as any[];

  if (!nodes || nodes.length === 0) return;

  // Create execution record
  const execution = await prisma.flowExecution.create({
    data: {
      flowId: flow.id,
      contactId: contact.id,
      chatId: chat.id,
      status: 'running',
    },
  });

  const context: FlowContext = {
    variables: {
      user_name: contact.name || '',
      user_email: contact.email || '',
      user_input: incomingMsg.message || '',
      platform: incomingMsg.channelType,
    },
    contactId: contact.id,
    chatId: chat.id,
    channelId: incomingMsg.channelId,
    teamId: incomingMsg.teamId,
    platformUserId: contact.platformId,
    lastMessage: incomingMsg.message || '',
    channelType: incomingMsg.channelType,
  };

  try {
    // Find trigger node
    const triggerNode = nodes.find((n) => n.type === 'trigger' || n.data?.type === 'trigger');
    if (!triggerNode) {
      await prisma.flowExecution.update({
        where: { id: execution.id },
        data: { status: 'error', endedAt: new Date() },
      });
      return;
    }

    // Execute from trigger
    await executeNode(triggerNode.id, nodes, edges, context);

    await prisma.flowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        endedAt: new Date(),
        variables: context.variables,
      },
    });
  } catch (err) {
    console.error('Flow execution error:', err);
    await prisma.flowExecution.update({
      where: { id: execution.id },
      data: { status: 'error', endedAt: new Date() },
    });
  }
}

async function executeNode(
  nodeId: string,
  nodes: any[],
  edges: any[],
  context: FlowContext
): Promise<void> {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return;

  const data = node.data;
  const channel = await prisma.channel.findFirst({
    where: { id: context.channelId },
  });

  if (!channel) return;

  switch (data.type) {
    case 'trigger':
      // Just pass through to next node
      break;

    case 'sendMessage':
      const message = replaceVariables(data.message || '', context.variables);
      await sendPlatformMessage(channel, context.platformUserId, message);
      await storeOutgoingMessage(context.chatId, message, 'TEXT');
      break;

    case 'sendImage':
      const imageUrl = replaceVariables(data.imageUrl || '', context.variables);
      await sendPlatformMessage(channel, context.platformUserId, imageUrl, 'IMAGE');
      await storeOutgoingMessage(context.chatId, imageUrl, 'IMAGE');
      break;

    case 'sendButton':
      const btnMsg = replaceVariables(data.message || '', context.variables);
      await sendPlatformMessage(channel, context.platformUserId, btnMsg, 'BUTTON', {
        buttons: data.buttons,
      });
      await storeOutgoingMessage(context.chatId, btnMsg, 'BUTTON', { buttons: data.buttons });
      break;

    case 'sendQuickReply':
      const qrMsg = replaceVariables(data.message || '', context.variables);
      await sendPlatformMessage(channel, context.platformUserId, qrMsg, 'QUICK_REPLY', {
        quickReplies: data.quickReplies,
      });
      await storeOutgoingMessage(context.chatId, qrMsg, 'QUICK_REPLY', {
        quickReplies: data.quickReplies,
      });
      break;

    case 'condition':
      const field = replaceVariables(data.conditionField || '', context.variables);
      const value = replaceVariables(data.conditionValue || '', context.variables);
      const result = evaluateCondition(field, data.conditionOperator, value);

      // Follow true or false branch
      const handleId = result ? 'true' : 'false';
      const nextEdge = edges.find(
        (e) => e.source === nodeId && e.sourceHandle === handleId
      );
      if (nextEdge) {
        await executeNode(nextEdge.target, nodes, edges, context);
      }
      return; // Don't follow default path

    case 'delay':
      const seconds = data.delaySeconds || 1;
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      break;

    case 'setVariable':
      const varName = data.variableName || '';
      const varValue = replaceVariables(data.variableValue || '', context.variables);
      context.variables[varName] = varValue;
      break;

    case 'httpRequest':
      try {
        const url = replaceVariables(data.httpUrl || '', context.variables);
        const body = data.httpBody
          ? replaceVariables(data.httpBody, context.variables)
          : undefined;

        const response = await fetch(url, {
          method: data.httpMethod || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(data.httpHeaders || {}),
          },
          ...(body && { body }),
        });

        const responseData = await response.text();
        if (data.httpResponseVariable) {
          context.variables[data.httpResponseVariable] = responseData;
        }
      } catch (err) {
        console.error('HTTP request error in flow:', err);
      }
      break;

    case 'googleSheet':
      await handleGoogleSheetAction(data, context);
      break;

    case 'assignAgent':
      if (data.agentId) {
        await prisma.chat.update({
          where: { id: context.chatId },
          data: { assignedTo: data.agentId, status: 'ASSIGNED' },
        });
      }
      break;

    case 'ocrProcess':
      try {
        const imageInput = replaceVariables(
          data.ocrInputVariable || '',
          context.variables
        );
        const ocrResult = await processOCR(imageInput);
        if (data.ocrOutputVariable) {
          context.variables[data.ocrOutputVariable] = ocrResult;
        }
      } catch (err) {
        console.error('OCR processing error:', err);
      }
      break;
  }

  // Follow to next node (default path)
  const nextEdge = edges.find(
    (e) => e.source === nodeId && !e.sourceHandle
  );
  if (nextEdge) {
    await executeNode(nextEdge.target, nodes, edges, context);
  }
}

function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

function evaluateCondition(
  field: string,
  operator: string,
  value: string
): boolean {
  switch (operator) {
    case 'equals':
      return field === value;
    case 'notEquals':
      return field !== value;
    case 'contains':
      return field.includes(value);
    case 'notContains':
      return !field.includes(value);
    case 'greaterThan':
      return parseFloat(field) > parseFloat(value);
    case 'lessThan':
      return parseFloat(field) < parseFloat(value);
    case 'exists':
      return field !== '' && field !== undefined && field !== null;
    case 'notExists':
      return field === '' || field === undefined || field === null;
    case 'regex':
      try {
        return new RegExp(value).test(field);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

async function handleGoogleSheetAction(
  data: any,
  context: FlowContext
): Promise<void> {
  // This will be handled by the Google Sheets service
  const { google } = await import('googleapis');

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    undefined,
    (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });

  if (data.sheetAction === 'append' && data.sheetId) {
    const values = Object.entries(data.sheetData || context.variables).map(
      ([, v]) => replaceVariables(String(v), context.variables)
    );

    await sheets.spreadsheets.values.append({
      spreadsheetId: data.sheetId,
      range: data.sheetRange || 'Sheet1!A:Z',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
  } else if (data.sheetAction === 'read' && data.sheetId) {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: data.sheetId,
      range: data.sheetRange || 'Sheet1!A:Z',
    });
    context.variables['sheet_data'] = JSON.stringify(result.data.values || []);
  }
}

async function processOCR(imageUrl: string): Promise<string> {
  // Use Tesseract.js for local OCR or external API
  if (process.env.OCR_API_URL && process.env.OCR_API_KEY) {
    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('apikey', process.env.OCR_API_KEY);
    formData.append('language', 'eng');

    const res = await fetch(process.env.OCR_API_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.ParsedResults?.[0]?.ParsedText || '';
  }

  // Fallback: return placeholder
  return '[OCR: Configure OCR_API_URL and OCR_API_KEY in environment]';
}

async function storeOutgoingMessage(
  chatId: string,
  content: string,
  type: string,
  metadata?: any
) {
  await prisma.message.create({
    data: {
      chatId,
      direction: 'OUTGOING',
      type: type as any,
      content,
      metadata,
    },
  });
}
