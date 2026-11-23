import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import {
  EVENT_POLICY_KEY,
  EventAction,
} from '../decorators/event-policy.decorator.js';

import { EventPolicy } from '../../events/policies/event.policy.js';
import { EventsService } from '../../events/events.service.js';
import { AuthUser } from '../interfaces/auth-user.interface.js';

@Injectable()
export class EventPolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private eventsService: EventsService,
    private eventPolicy: EventPolicy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<EventAction>(
      EVENT_POLICY_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (!action) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user as AuthUser;
    const eventId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const event = await this.eventsService.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

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

    if (!allowed) {
      throw new ForbiddenException(
        'You are not allowed to perform this action on this event',
      );
    }

    request.event = event;

    return true;
  }
}