import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '../common/enums/role.enum.js';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  refreshHash: string | null;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];
  private nextId = 31;

  async onModuleInit(): Promise<void> {
    const passwordHash = await argon2.hash('Password123!');

    const demoUsers: User[] = [
      {
        id: 'user-1',
        email: 'admin@example.et',
        passwordHash,
        role: Role.ADMIN,
        refreshHash: null,
      },
      {
        id: 'user-10',
        email: 'organizer10@example.et',
        passwordHash,
        role: Role.ORGANIZER,
        refreshHash: null,
      },
      {
        id: 'user-20',
        email: 'organizer20@example.et',
        passwordHash,
        role: Role.ORGANIZER,
        refreshHash: null,
      },
      {
        id: 'user-30',
        email: 'student@example.et',
        passwordHash,
        role: Role.STUDENT,
        refreshHash: null,
      },
    ];

    this.users = demoUsers;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async create(data: {
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const user: User = {
      id: `user-${this.nextId++}`,
      email: data.email,
      passwordHash: data.passwordHash,
      role: Role.STUDENT,
      refreshHash: null,
    };

    this.users.push(user);
    return user;
  }

  async setRefreshHash(
    id: string,
    hash: string | null,
  ): Promise<void> {
    const user = await this.findById(id);

    if (user) {
      user.refreshHash = hash;
    }
  }

  findAll() {
    return this.users.map(({ id, email, role }) => ({
      id,
      email,
      role,
    }));
  }

  findOne(id: string) {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}