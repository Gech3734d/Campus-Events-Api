
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import {
  EVENT_POLICY_KEY,
  EventAction,
} from '../decorators/event-policy.decorator.js';

import { EventPolicy } from '../../events/policies/event.policy.js';
import { EventsService } from '../../events/events.service.js';

import { AuthUser } from '../interfaces/auth-user.interface.js';
import { Role } from '../enums/role.enum.js';

type AuthenticatedRequest = Request & {
  user?: AuthUser;
  event?: Awaited<ReturnType<EventsService['findOne']>>;
};

@Injectable()
export class EventPolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventsService: EventsService,
    private readonly eventPolicy: EventPolicy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get the policy action from the decorator.
    const action = this.reflector.getAllAndOverride<EventAction>(
      EVENT_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!action) {
      return true;
    }

    // 2. Get the HTTP request.
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
   const rawEventId = request.params.id;

const eventId = Array.isArray(rawEventId)
  ? rawEventId[0]
  : rawEventId;

    // 3. Check authentication.
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    // 4. Check event ID.
    if (!eventId) {
  throw new NotFoundException('Event not found');
}



    // 5. Find the event.
    const event = this.eventsService.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 6. Identify modification actions.
    const isModification = [
      'update',
      'delete',
      'publish',
    ].includes(action);

    // 7. Students cannot modify events.
    if (
      user.role === Role.STUDENT &&
      isModification
    ) {
      throw new ForbiddenException(
        'Students cannot modify events',
      );
    }

    // 8. Organizers can modify only their own events.
    if (
      user.role === Role.ORGANIZER &&
      isModification &&
      event.createdBy !== user.userId
    ) {
      // Return 404 to avoid revealing another organizer's event.
      throw new NotFoundException('Event not found');
    }

    // 9. Check the requested action using EventPolicy.
    let allowed = false;

    switch (action) {
      case 'read':
        allowed = this.eventPolicy.canRead(user, event);
        break;

      case 'update':
        allowed = this.eventPolicy.canUpdate(user, event);
        break;

      case 'delete':
        allowed = this.eventPolicy.canDelete(user, event);
        break;

      case 'publish':
        allowed = this.eventPolicy.canPublish(user, event);
        break;
    }

    // 10. Reject unauthorized actions.
    if (!allowed) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }

    // 11. Attach the event to the request.
    request.event = event;

    return true;
  }
}
