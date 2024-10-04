import { Gender, Role } from './enums';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  role: Role;
  avatar: string;
  balance: number;
}
