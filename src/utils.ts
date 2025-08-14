export function extractUSREOU(html: string): string | null {
  const match = html.match(/\b\d{8,}\b/);

  if (match) {
    return match[0];
  }
  console.error("Error: Unable to find correct USREOU.");
  return null;
}

export function convertDDMMYYYYToTimestamp(dateStr: string): number {
  const [day, month, year] = dateStr.split(".").map(Number);

  if (!day || !month || !year) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const date = new Date(year, month - 1, day);

  return Math.floor(date.getTime() / 1000);
}
