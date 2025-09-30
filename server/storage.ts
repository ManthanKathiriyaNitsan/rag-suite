// Static in-memory storage for demo purposes
// No database dependencies - fully static

export interface MockUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Static demo data
const mockUsers: MockUser[] = [
  {
    id: "demo-user-1",
    username: "admin",
    email: "admin@ragsuite.com", 
    role: "admin"
  }
];

export const storage = {
  // Get user by credentials (for demo login)
  getUserByEmail: (email: string): MockUser | undefined => {
    return mockUsers.find(user => user.email === email);
  },
  
  // Get all users 
  getUsers: (): MockUser[] => {
    return [...mockUsers];
  }
};
