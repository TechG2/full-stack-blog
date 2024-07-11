import { User } from '../auth/auth.service';

interface Page {
  user: User | undefined;
  isAuthenticated: boolean;

  setUser(): Promise<void>;
}

export default Page;
