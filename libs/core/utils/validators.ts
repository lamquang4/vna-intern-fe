import { isAfter, isValid, parseISO, startOfDay } from "date-fns";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  OTP_LENGTH,
} from "../constants/limits";

export function validateUsername(value: string): boolean {
  return /^VNA\d{8}$/i.test(value.trim());
}

export function validateOtpDigit(value: string): boolean {
  return /^\d?$/.test(value);
}

export function validateOtp(otp: string): boolean {
  const regex = new RegExp(`^\\d{${OTP_LENGTH}}$`);
  return regex.test(otp.trim());
}

export function validateImageType(file: File): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.includes(file.type);
}

export function validateImageSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE;
}

export function validateBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISO(value);
  return isValid(date) && date.getFullYear() >= 1900;
}

export function validateBirthDateNotFuture(value: string): boolean {
  return !isAfter(startOfDay(parseISO(value)), startOfDay(new Date()));
}
