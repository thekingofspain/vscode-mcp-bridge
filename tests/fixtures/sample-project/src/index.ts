/**
 * Sample TypeScript file for E2E testing
 * Used to test LSP features, diagnostics, etc.
 */

export interface User {
  id: number;
  name: string;
  email: string;
}

export function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

export function createUser(id: number, name: string, email: string): User {
  return { id, name, email };
}

export class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getAllUsers(): User[] {
    return this.users;
  }
}

// Test diagnostic - intentionally unused for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unusedVariable = 'This is unused';

export function calculateTotal(users: User[]): number {
  return users.length;
}
