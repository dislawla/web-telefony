import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: number;
  username: string;
  email: string;
}

export const findUserById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id }
  });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email }
  });
}; 