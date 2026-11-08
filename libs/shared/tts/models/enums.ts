export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const RoleCode = {
  SO: "SO",
  DOANH_NGHIEP: "DOANH_NGHIEP",
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

export const CategoryType = {
  INJURY_FACTOR: "INJURY_FACTOR", // Yếu tố chấn thương
  INJURY_TYPE: "INJURY_TYPE", // Loại chấn thương
  OCCUPATION: "OCCUPATION", // Danh mục nghề nghiệp
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];
