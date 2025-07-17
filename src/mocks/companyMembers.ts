import { Person } from "../stores/calendarStore";

// Mock company members data
export const companyMembers: Person[] = [
  {
    id: "member-1",
    name: "علی احمدی",
    email: "ali.ahmadi@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    department: "مهندسی",
  },
  {
    id: "member-2",
    name: "سارا محمدی",
    email: "sara.mohammadi@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b2e1c9c8?w=150&h=150&fit=crop&crop=face",
    department: "طراحی",
  },
  {
    id: "member-3",
    name: "محمد کریمی",
    email: "mohammad.karimi@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    department: "بازاریابی",
  },
  {
    id: "member-4",
    name: "الهام رضایی",
    email: "elham.rezaei@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    department: "محصول",
  },
  {
    id: "member-5",
    name: "داود حسینی",
    email: "davood.hosseini@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    department: "فروش",
  },
  {
    id: "member-6",
    name: "فاطمه زارعی",
    email: "fatemeh.zarei@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=150&h=150&fit=crop&crop=face",
    department: "منابع انسانی",
  },
  {
    id: "member-7",
    name: "رضا بهرامی",
    email: "reza.bahrami@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    department: "مهندسی",
  },
  {
    id: "member-8",
    name: "آمنه تقوی",
    email: "ameneh.taghavi@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    department: "مالی",
  },
  {
    id: "member-9",
    name: "حسن اسکندری",
    email: "hasan.eskandari@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    department: "عملیات",
  },
  {
    id: "member-10",
    name: "مریم نوری",
    email: "maryam.nouri@company.com",
    type: "member",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    department: "حقوقی",
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
