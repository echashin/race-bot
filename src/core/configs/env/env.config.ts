import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { EnvironmentModeEnum } from './environment-mode.enum';

export class EnvConfig {
  @IsDefined()
  @IsEnum(EnvironmentModeEnum)
  NODE_ENV: EnvironmentModeEnum;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  LOGIN: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  APP_ID: string;

  @IsNumber()
  @Transform(({ value }) => +value)
  @IsNotEmpty()
  @IsDefined()
  @Type(() => Number)
  HTTP_PORT: number;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  HTTP_SERVER: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  TG_BOT_TOKEN: string;

  @IsNumber()
  @Transform(({ value }) => +value)
  @IsNotEmpty()
  @IsDefined()
  @Type(() => Number)
  CHAT_BOT_MESSAGES_AMOUNT: number;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  TG_CHAT_ID: string;
}
