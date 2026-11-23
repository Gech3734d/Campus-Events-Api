import { Injectable } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum.js';
import { AuthUser } from '../../common/interfaces/auth-user.interface.js';

export interface EventResource {
  id: string;
  title: string;
  createdBy: string;
  isPublished: boolean;
}

@Injectable()
export class EventPolicy {
  canRead(user: AuthUser | undefined, event: EventResource): boolean {
    if (event.isPublished) {
      return true;
    }

    return !!user &&
      (user.role === Role.ADMIN || event.createdBy === user.userId);
  }

  canUpdate(user: AuthUser, event: EventResource): boolean {
    return (
      user.role === Role.ADMIN ||
      (
        user.role === Role.ORGANIZER &&
        event.createdBy === user.userId
      )
    );
  }

  canDelete(user: AuthUser, event: EventResource): boolean {
    return (
      user.role === Role.ADMIN ||
      (
        user.role === Role.ORGANIZER &&
        event.createdBy === user.userId
      )
    );
  }

  canPublish(user: AuthUser, event: EventResource): boolean {
    return this.canUpdate(user, event);
  }
}