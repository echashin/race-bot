import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { ChatBotMessageMp } from '../dto/chat-bot-message.mp';
import { EnvConfig } from '../core/configs/env';

@Injectable()
export class ChatBotService {
  private readonly bot: TelegramBot;
  private readonly limit: number;
  private readonly alertBotId: string;
  private readonly env: string;
  private alertList: ChatBotMessageMp[] = [];
  icon = {
    error: '🔴',
    info: '🔵',
    success: '🟢',
    default: '🔵',
  };

  constructor(private readonly config: ConfigService<EnvConfig>) {
    this.limit = this.config.get('CHAT_BOT_MESSAGES_AMOUNT');
    this.alertBotId = this.config.get('TG_CHAT_ID');
    this.bot = new TelegramBot(this.config.get('TG_BOT_TOKEN'));
  }

  sendMessage(alert: ChatBotMessageMp): void {
    this.bot
      .sendMessage(this.alertBotId, this.parseAlert(alert), {
        parse_mode: 'html',
      })
      .finally(() => this.pushAlert(alert));
  }

  parseAlert(alert: ChatBotMessageMp): string {
    const icon: string = this.icon[alert.type] || this.icon.default;
    let label = 'Новая бронь';
    switch (alert.type) {
      case 'info': {
        label = 'Инфо';
        break;
      }
      case 'success': {
        label = 'Новая бронь';
        break;
      }
      case 'error': {
        label = 'Отмена брони';
      }
    }

    return `${icon} ${label}\n${alert.message}`;
  }

  pushAlert(alert: ChatBotMessageMp): void {
    if (this.alertList.length >= this.limit) {
      this.alertList.shift();
    }
    this.alertList.push(alert);
  }

  async getAlerts(): Promise<ChatBotMessageMp[]> {
    return this.alertList;
  }
}
