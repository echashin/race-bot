import { Injectable } from '@nestjs/common';
import { GqlService } from './gql.service';
import { SqliteService } from './sqlite.service';
import { BookingDetails } from '../dto/booking-details.dto';
import { ChatBotService } from './chat-bot.service';
import { add, format, getUnixTime } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CoreService {
  constructor(
    private readonly gqlService: GqlService,
    private readonly sqliteService: SqliteService,
    private readonly chatBotService: ChatBotService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async short() {
    const from = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const to = format(add(new Date(), { days: 3 }), 'yyyy-MM-dd HH:mm:ss');
    await this.sync(from, to);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async long() {
    const from = format(add(new Date(), { days: 3 }), 'yyyy-MM-dd HH:mm:ss');
    const to = format(add(new Date(), { months: 3 }), 'yyyy-MM-dd HH:mm:ss');
    await this.sync(from, to);
  }

  private async sync(from, to) {
    await this.sqliteService.deleteOldRecords();
    await this.gqlService.login();
    await this.gqlService.getHosts();
    const newRecords: BookingDetails[] = [];

    const bookings = await this.gqlService.getBookings(from, to);
    for (const booking of bookings) {
      const record = this.sqliteService.getRecord(booking.id);
      if (!record) {
        this.sqliteService.addRecord({
          fromDate: getUnixTime(new Date(booking.from)),
          toDate: getUnixTime(new Date(booking.to)),
          status: booking.status,
          id: booking.id,
        });
        newRecords.push(booking);
      } else {
        if (booking.status === 'CANCELED' && record.status !== 'CANCELED') {
          this.sqliteService.updateRecord({
            fromDate: getUnixTime(new Date(booking.from)),
            toDate: getUnixTime(new Date(booking.to)),
            status: booking.status,
            id: booking.id,
          });
          newRecords.push(booking);
        }
      }
    }

    console.dir(newRecords, { depth: 20 });

    for (const record of newRecords) {
      if (record.status === 'ACTIVE') {
        this.chatBotService.sendMessage({
          type: 'success',
          message: this.createMessage(record),
          timestamp: Date.now(),
        });
      }

      if (record.status === 'CANCELED') {
        this.chatBotService.sendMessage({
          type: 'error',
          message: this.createMessage(record),
          timestamp: Date.now(),
        });
      }
    }
  }

  private createMessage(record: BookingDetails): string {
    let client = 'Не указан';
    if (record.client) {
      client = [
        record.client.nickname,
        record.client.first_name,
        record.client.last_name,
      ]
        .filter(Boolean)
        .join(' ');
      if (record.client.phone) {
        client = '+' + record.client.phone + '\n' + client;
      }
    }

    const hosts: string = record.hosts
      .map((h) => this.gqlService.hosts[`${h}`])
      .join(' ');

    const dateFrom = format(new Date(record.from), 'yyyy-MM-dd HH:mm');
    const dateTo = format(new Date(record.to), 'yyyy-MM-dd HH:mm');

    return [
      '<b>Дата:</b>\n' + dateFrom + '\n' + dateTo,
      '<b>Хосты:</b>\n' + hosts,
      '<b>Клиент:</b>\n' + client,
    ].join('\n');
  }
}
