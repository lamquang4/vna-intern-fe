import { isAfter, isValid, parseISO, startOfDay } from "date-fns";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  OTP_LENGTH,
} from "../constants/limits";

export function validateUsername(value: string): boolean {
  const regex = /^VNA\d{8}$/i;
  return regex.test(value.trim());
}

export function validatePhone(phone: string): boolean {
  const regex = /^(0?)(3[2-9]|5[689]|7[06-9]|8[0-689]|9[0-46-9])[0-9]{7}$/;

  return regex.test(phone);
}

export function validateOtpDigit(value: string): boolean {
  const regex = /^\d?$/;
  return regex.test(value);
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

export function validateDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISO(value);
  return isValid(date) && date.getFullYear() >= 1900;
}

export function validateDateNotFuture(value: string): boolean {
  return !isAfter(startOfDay(parseISO(value)), startOfDay(new Date()));
}

export function validateTaxCode(value: string): boolean {
  const regex = /^\d{10}$/;
  return regex.test(value.trim());
}
