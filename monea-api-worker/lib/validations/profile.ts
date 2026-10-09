export function isValidProfileName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 100;
}

export function isValidProfilePhone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const phone = value.trim();
  if (!phone) return true;
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return false;

  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
}
