export interface FieldError {
  path: string;
  message: string;
}

export function getFieldError(fieldErrors: FieldError[] | undefined, path: string): string | undefined {
  return fieldErrors?.find((error) => error.path === path)?.message;
}
