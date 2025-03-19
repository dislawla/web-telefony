import { db } from "../db";
import { telephonySettings } from "../schema";
import { eq } from "drizzle-orm";

// Функция для сохранения настроек телефонии
export async function saveTelephonySettings(userId: number, settings: any) {
  try {
    const existing = await db
      .select()
      .from(telephonySettings)
      .where(eq(telephonySettings.userId, userId));

    if (existing.length > 0) {
      // Обновляем существующие настройки
      await db
        .update(telephonySettings)
        .set({
          apiKey: settings.apiKey,
          incomingRouting: settings.incomingCalls.routing,
          incomingGreeting: settings.incomingCalls.greeting,
          incomingWaitTime: parseInt(settings.incomingCalls.waitTime, 10),
          outgoingPhone: settings.outgoingCalls.phoneNumber,
          recordCalls: settings.outgoingCalls.recordCalls,
          analyzeConversations: settings.aiIntegration.analyzeConversations,
          transcriptionEnabled: settings.aiIntegration.transcriptionEnabled,
          updatedAt: new Date(),
        })
        .where(eq(telephonySettings.userId, userId));
    } else {
      // Создаем новые настройки
      await db.insert(telephonySettings).values({
        userId,
        apiKey: settings.apiKey,
        incomingRouting: settings.incomingCalls.routing,
        incomingGreeting: settings.incomingCalls.greeting,
        incomingWaitTime: parseInt(settings.incomingCalls.waitTime, 10),
        outgoingPhone: settings.outgoingCalls.phoneNumber,
        recordCalls: settings.outgoingCalls.recordCalls,
        analyzeConversations: settings.aiIntegration.analyzeConversations,
        transcriptionEnabled: settings.aiIntegration.transcriptionEnabled,
      });
    }

    return { success: true, message: "Настройки телефонии сохранены" };
  } catch (error) {
    console.error("Ошибка сохранения настроек телефонии:", error);
    throw new Error("Ошибка сохранения настроек");
  }
}

// Функция для получения настроек телефонии
export async function getTelephonySettings(userId: number) {
  try {
    const settings = await db
      .select()
      .from(telephonySettings)
      .where(eq(telephonySettings.userId, userId));

    return settings.length > 0 ? settings[0] : null;
  } catch (error) {
    console.error("Ошибка получения настроек телефонии:", error);
    throw new Error("Ошибка получения настроек");
  }
}
