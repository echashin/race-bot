import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { environmentValidate } from './core/configs/env';
import { ConfigModule } from '@nestjs/config';
import { GqlService } from './services/gql.service';
import { SqliteService } from './services/sqlite.service';
import { CoreService } from './services/core.service';
import { ChatBotService } from './services/chat-bot.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: environmentValidate,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [GqlService, SqliteService, CoreService, ChatBotService],
})
export class AppModule {}
