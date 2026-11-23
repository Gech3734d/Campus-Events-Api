import { Module } from '@nestjs/common';

import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { EventPolicy } from './policies/event.policy.js';

import { RolesGuard } from '../common/guards/roles.guard.js';
import { EventPolicyGuard } from '../common/guards/event-policy.guard.js';

@Module({
  controllers: [EventsController],

  providers: [
    EventsService,
    EventPolicy,
    RolesGuard,
    EventPolicyGuard,
  ],

  exports: [
    EventsService,
  ],
})
export class EventsModule {}