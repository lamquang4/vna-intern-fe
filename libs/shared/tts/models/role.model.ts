import { RoleCode } from "./enums";
// request

// response
export interface RoleResponse {
  roleId: string;
  code: RoleCode;
  name: string;
}
