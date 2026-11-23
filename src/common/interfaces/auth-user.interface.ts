import { Role } from '../enums/role.enum.js';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}