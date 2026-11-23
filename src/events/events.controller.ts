import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto.js';
import { Query } from '@nestjs/common';
import { FindEventsQueryDto } from './dto/find-events-query.dto.js';


import { Request } from 'express';

import { EventsService } from './events.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { RolesGuard } from '../common/guards/roles.guard.js';
import { EventPolicyGuard } from '../common/guards/event-policy.guard.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { CheckEventPolicy } from '../common/decorators/event-policy.decorator.js';

import { Role } from '../common/enums/role.enum.js';
import { AuthUser } from '../common/interfaces/auth-user.interface.js';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  // Public: Published events
  @Get()
findAll(@Query() query: FindEventsQueryDto) {
  return this.eventsService.findAll(query);
}

  // Organizer: Own events
  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  getMyEvents(@Req() req: Request & { user: AuthUser }) {
    return this.eventsService.findMyEvents(req.user.userId);
  }

  // Organizer/Admin: Create event
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
 @Post()
create(
  @Body() dto: CreateEventDto,
  @Req() req: any,
) {
  return this.eventsService.create(dto, req.user.userId);
}

  // Owner/Admin: Update event
  @Patch(':id')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('update')
  updateEvent(
    @Param('id') id: string,
    @Body() dto: { title?: string; description?: string },
  ) {
    return this.eventsService.update(id, dto);
  }

  // Owner/Admin: Publish event
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('publish')
  publishEvent(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  // Owner/Admin: Delete event
  @Delete(':id')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('delete')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // Public: Published event only
  @Get(':id')
  getEvent(@Param('id') id: string) {
    const event = this.eventsService.findById(id);

    if (!event || !event.isPublished) {
      return null;
    }

    return event;
  }
}