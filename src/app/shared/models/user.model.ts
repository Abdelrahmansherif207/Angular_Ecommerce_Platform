export interface User {
  id: string | number;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  role?: 'user' | 'admin';
}
