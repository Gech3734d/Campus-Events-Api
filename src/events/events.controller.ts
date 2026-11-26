
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';

import { Request } from 'express';

import { EventsService } from './events.service.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { FindEventsQueryDto } from './dto/find-events-query.dto.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { EventPolicyGuard } from '../common/guards/event-policy.guard.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { CheckEventPolicy } from '../common/decorators/event-policy.decorator.js';

import { Role } from '../common/enums/role.enum.js';
import { AuthUser } from '../common/interfaces/auth-user.interface.js';

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  // PUBLIC: GET PUBLISHED EVENTS
  @Get()
  findAll(@Query() query: FindEventsQueryDto) {
    return this.eventsService.findAll({
      ...query,
      isPublished: true,
    });
  }

  // ORGANIZER / ADMIN: GET OWN EVENTS
  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  getMyEvents(@Req() req: AuthenticatedRequest) {
    if (req.user.role === Role.ADMIN) {
      return this.eventsService.findAll({
        page: 1,
        limit: 100,
      });
    }

    return this.eventsService.findMyEvents(
      req.user.userId,
    );
  }

  // ADMIN: GET ALL EVENTS
  @Get('manage/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllEventsForAdmin(
    @Query() query: FindEventsQueryDto,
  ) {
    return this.eventsService.findAll({
      ...query,
      isPublished: undefined,
    });
  }

  // CREATE EVENT
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  create(
    @Body() dto: CreateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.create(
      dto,
      req.user.userId,
    );
  }

  // GET ONE PUBLISHED EVENT
  @Get(':id')
  getEvent(@Param('id') id: string) {
    const event = this.eventsService.findOne(id);

    if (!event.isPublished) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // UPDATE EVENT
  @Patch(':id')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('update')
  updateEvent(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.update(
      id,
      dto,
      req.user,
    );
  }

  // PUBLISH EVENT
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('publish')
  publishEvent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.publish(
      id,
      req.user,
    );
  }

  // DELETE EVENT
  @Delete(':id')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('delete')
  deleteEvent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.remove(
      id,
      req.user,
    );
  }

  // GET SESSIONS FOR A PUBLISHED EVENT
  @Get(':id/sessions')
  getSessions(@Param('id') id: string) {
    const event = this.eventsService.findOne(id);

    if (!event.isPublished) {
      throw new NotFoundException('Event not found');
    }

    return this.eventsService.findSessions(id);
  }

  // CREATE SESSION
  @Post(':id/sessions')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('update')
  createSession(
    @Param('id') eventId: string,
    @Body() dto: CreateSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.createSession(
      eventId,
      dto,
      req.user,
    );
  }

  // UPDATE SESSION
  @Patch(':id/sessions/:sessionId')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('update')
  updateSession(
    @Param('id') eventId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.updateSession(
      eventId,
      sessionId,
      dto,
      req.user,
    );
  }

  // DELETE SESSION
  @Delete(':id/sessions/:sessionId')
  @UseGuards(JwtAuthGuard, EventPolicyGuard)
  @CheckEventPolicy('delete')
  deleteSession(
    @Param('id') eventId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.removeSession(
      eventId,
      sessionId,
      req.user,
    );
  }
}
