import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';

export function ToBoolean(): (target: any, key: string) => void {
  return Transform(({ key, obj }: TransformFnParams) => {
    if (obj[key] === undefined) {
      return;
    }

    return ['Y', 'y', 'YES', 'yes', '1', 1, 'true', true].includes(obj[key]);
  });
}
