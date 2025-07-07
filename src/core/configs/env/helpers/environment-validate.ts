import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { EnvConfig } from '../env.config';

export function environmentValidate(config: Record<string, unknown>): EnvConfig {
  const validatedConfig: EnvConfig = plainToClass(EnvConfig, config, {
    enableImplicitConversion: false,
  });

  const errors: ValidationError[] = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
