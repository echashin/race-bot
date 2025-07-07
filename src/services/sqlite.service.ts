import * as Database from 'better-sqlite3';
import { Injectable } from '@nestjs/common';
import { BookingRecordDto } from '../dto/booking-record.dto';
import { getUnixTime } from 'date-fns';

@Injectable()
export class SqliteService {
  private db: Database.Database;
  private dbPath: string = 'database.db';

  constructor() {
    this.db = new Database(this.dbPath);
    this.initializeDatabase();
  }

  // Инициализация базы данных (создание таблицы, если её нет)
  private initializeDatabase(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS records
      (
        id INTEGER  PRIMARY  KEY,
        status TEXT NOT NULL,
        fromDate INTEGER NOT NULL,
        toDate INTEGER NOT NULL
      );
    `;
    this.db.exec(createTableSQL);
  }

  // Добавление новой записи
  public addRecord(record: BookingRecordDto): number {
    const stmt = this.db.prepare(`
      INSERT INTO records (id,status, fromDate, toDate)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      record.id,
      record.status,
      record.fromDate,
      record.toDate,
    );
    return result.lastInsertRowid as number;
  }

  // Получение записи по ID
  public getRecord(id: number): BookingRecordDto | undefined {
    const stmt = this.db.prepare('SELECT * FROM records WHERE id = ?');
    return stmt.get(id) as BookingRecordDto | undefined;
  }

  // Получение всех записей
  public getAllRecords(): BookingRecordDto[] {
    const stmt = this.db.prepare('SELECT * FROM records');
    return stmt.all() as BookingRecordDto[];
  }

  // Обновление записи
  public updateRecord(record: BookingRecordDto): boolean {
    const stmt = this.db.prepare(`
      UPDATE records
      SET status   = ?,
          fromDate = ?,
          toDate   = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      record.status,
      record.fromDate,
      record.toDate,
      record.id,
    );
    return result.changes > 0;
  }

  // Удаление записи
  async deleteOldRecords(): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM records WHERE toDate < ?');
    const unixTime = getUnixTime(new Date());
    console.log({ unixTime });
    const result = stmt.run(unixTime);
    return result.changes > 0;
  }

  // Закрытие соединения с БД
  public close(): void {
    this.db.close();
  }
}
