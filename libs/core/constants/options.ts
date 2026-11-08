import { Gender } from "@/libs/shared/tts/models/enums";

export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: "Nam" },
  { value: Gender.FEMALE, label: "Nữ" },
];

export const USER_STATUS_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Ngừng hoạt động" },
];
