import { Transform, Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnvConfig {
  // @IsDefined()
  // @IsEnum(EnvironmentModeEnum)
  // NODE_ENV: EnvironmentModeEnum;

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
  HTTP_PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  HTTP_SERVER: string = '0.0.0.0';

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  TG_BOT_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  TG_CHAT_ID: string;
}
