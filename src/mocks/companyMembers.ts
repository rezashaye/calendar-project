import { Person } from "../stores/calendarStore";

// Mock company members data
export const companyMembers: Person[] = [
  {
    id: "member-1",
    name: "John Smith",
    email: "john.smith@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    department: "Engineering",
  },
  {
    id: "member-2",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b2e1c9c8?w=150&h=150&fit=crop&crop=face",
    department: "Design",
  },
  {
    id: "member-3",
    name: "Mike Davis",
    email: "mike.davis@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    department: "Marketing",
  },
  {
    id: "member-4",
    name: "Emily Chen",
    email: "emily.chen@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    department: "Product",
  },
  {
    id: "member-5",
    name: "David Wilson",
    email: "david.wilson@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    department: "Sales",
  },
  {
    id: "member-6",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    department: "HR",
  },
  {
    id: "member-7",
    name: "Robert Brown",
    email: "robert.brown@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    department: "Engineering",
  },
  {
    id: "member-8",
    name: "Amanda Taylor",
    email: "amanda.taylor@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    department: "Finance",
  },
  {
    id: "member-9",
    name: "Chris Martinez",
    email: "chris.martinez@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    department: "Operations",
  },
  {
    id: "member-10",
    name: "Jennifer Lee",
    email: "jennifer.lee@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    department: "Legal",
  },
];

// Helper function to search members by name or email
export const searchMembers = (query: string): Person[] => {
  if (!query) return companyMembers;

  const lowerQuery = query.toLowerCase();
  return companyMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(lowerQuery) ||
      member.email.toLowerCase().includes(lowerQuery) ||
      member.department?.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get member by email
export const getMemberByEmail = (email: string): Person | null => {
  return companyMembers.find((member) => member.email === email) || null;
};

// Helper function to create a guest person
export const createGuestPerson = (name: string, email: string): Person => {
  return {
    id: crypto.randomUUID(),
    name,
    email,
    type: "guest",
  };
};

// Quick access functions for common operations
export const getRandomMembers = (count: number): Person[] => {
  const shuffled = [...companyMembers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getMembersByDepartment = (department: string): Person[] => {
  return companyMembers.filter(
    (member) => member.department?.toLowerCase() === department.toLowerCase()
  );
};

export const getAllDepartments = (): string[] => {
  const departments = companyMembers
    .map((member) => member.department)
    .filter((dept): dept is string => dept !== undefined);
  return [...new Set(departments)];
};
