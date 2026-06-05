export function parsePositiveInt(rawValue: string | undefined, fallback: number): number {
  const parsedValue = Number.parseInt(rawValue ?? "", 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}
