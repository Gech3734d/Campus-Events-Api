
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import {
  EventResource,
  EventPolicy,
} from './policies/event.policy.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { FindEventsQueryDto } from './dto/find-events-query.dto.js';

import { CreateSessionDto } from './dto/create-session.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';

import { AuthUser } from '../common/interfaces/auth-user.interface.js';
import { Role } from '../common/enums/role.enum.js';

// ==========================================
// EVENT INTERFACE
// ==========================================

export interface Event extends EventResource {
  description: string;
  location: string;
  eventDate: string;
  category: string;
}

// ==========================================
// SESSION INTERFACE
// ==========================================

export interface Session {
  id: string;
  eventId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  room: string;
}

// ==========================================
// EVENTS SERVICE
// ==========================================

@Injectable()
export class EventsService {
  constructor(
    private readonly eventPolicy: EventPolicy,
  ) {}

  // ========================================
  // IN-MEMORY EVENTS STORAGE
  // ========================================

  private events: Event[] = [
    {
      id: 'evt-101',
      title: 'Robotics Showcase',
      description: 'Learn modern web development.',
      location: 'Main Campus',
      eventDate: '2026-12-04T09:00:00.000Z',
      category: 'technology',
      isPublished: true,
      createdBy: 'user-10',
    },
    {
      id: 'evt-102',
      title: 'Student Art Exhibition',
      description: 'Business and entrepreneurship.',
      location: 'Business Block',
      eventDate: '2026-12-10T10:00:00.000Z',
      category: 'business',
      isPublished: true,
      createdBy: 'user-20',
    },
    {
      id: 'evt-103',
      title: 'Programming Competition',
      description: 'Coding competition for students.',
      location: 'Engineering Block',
      eventDate: '2026-12-15T08:00:00.000Z',
      category: 'technology',
      isPublished: true,
      createdBy: 'user-20',
    },
    {
      id: 'evt-104',
      title: 'Cultural Festival',
      description: 'Celebrate different cultures.',
      location: 'Main Campus',
      eventDate: '2026-12-20T09:00:00.000Z',
      category: 'culture',
      isPublished: false,
      createdBy: 'user-20',
    },
    {
      id: 'evt-105',
      title: 'Graduation Ceremony',
      description: 'Annual graduation event.',
      location: 'Main Hall',
      eventDate: '2026-10-15T09:00:00.000Z',
      category: 'education',
      isPublished: true,
      createdBy: 'user-10',
    },
  ];

  // ========================================
  // IN-MEMORY SESSIONS STORAGE
  // ========================================

  private sessions: Session[] = [
    {
      id: 'ses-201',
      eventId: 'evt-101',
      title: 'Introduction to NestJS',
      startsAt: '2026-12-04T09:00:00.000Z',
      endsAt: '2026-12-04T10:00:00.000Z',
      room: 'Room 101',
    },
    {
      id: 'ses-202',
      eventId: 'evt-101',
      title: 'Building REST APIs',
      startsAt: '2026-12-04T10:00:00.000Z',
      endsAt: '2026-12-04T11:00:00.000Z',
      room: 'Room 102',
    },
    {
      id: 'ses-203',
      eventId: 'evt-102',
      title: 'Business Planning',
      startsAt: '2026-12-10T10:00:00.000Z',
      endsAt: '2026-12-10T11:00:00.000Z',
      room: 'Room 201',
    },
    {
      id: 'ses-204',
      eventId: 'evt-102',
      title: 'Entrepreneurship',
      startsAt: '2026-12-10T11:00:00.000Z',
      endsAt: '2026-12-10T12:00:00.000Z',
      room: 'Room 202',
    },
  ];

  // ========================================
  // CHECK EVENT OWNERSHIP
  // ========================================

  private checkEventOwnership(
    user: AuthUser,
    event: Event,
  ): void {
    // ADMIN can manage every event.
    if (user.role === Role.ADMIN) {
      return;
    }

    // STUDENT cannot modify events.
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException(
        'Students cannot modify events',
      );
    }

    // ORGANIZER can manage only their own events.
    // Return 404 instead of revealing another organizer's event.
    if (
      user.role === Role.ORGANIZER &&
      event.createdBy !== user.userId
    ) {
      throw new NotFoundException('Event not found');
    }

    // Check the event policy.
    if (!this.eventPolicy.canUpdate(user, event)) {
      throw new ForbiddenException(
        'You are not allowed to modify this event',
      );
    }
  }

  // ========================================
  // VALIDATE SESSION TIME
  // ========================================

  private validateSessionTime(
    startsAt: string,
    endsAt: string,
  ): void {
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      end <= start
    ) {
      throw new BadRequestException(
        'Session end time must be after start time',
      );
    }
  }

  // ========================================
  // CREATE EVENT
  // ========================================

  create(
    data: CreateEventDto,
    userId: string,
  ): Event {
    const newEvent: Event = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      location: data.location,
      eventDate: data.eventDate,
      category: data.category,

      // New events are unpublished by default.
      isPublished: false,

      // Owner comes from the authenticated user.
      createdBy: userId,
    };

    this.events.push(newEvent);

    return newEvent;
  }

  // ========================================
  // GET ALL EVENTS
  // FILTER + SORT + PAGINATION
  // ========================================

  findAll(query: FindEventsQueryDto) {
    const {
      category,
      location,
      isPublished,
      sortBy = 'eventDate',
      order = 'asc',
    } = query;

    const page = Math.max(
      1,
      Number(query.page) || 1,
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(query.limit) || 5),
    );

    // FILTER EVENTS
    let result = this.events.filter((event) => {
      return (
        (!category ||
          event.category.toLowerCase() ===
            category.toLowerCase()) &&

        (!location ||
          event.location.toLowerCase().includes(
            location.toLowerCase(),
          )) &&

        (isPublished === undefined ||
          event.isPublished === isPublished)
      );
    });

    // SORT EVENTS
    result = [...result].sort((a, b) => {
      const comparison =
        sortBy === 'title'
          ? a.title.localeCompare(b.title)
          : new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime();

      return order === 'desc'
        ? -comparison
        : comparison;
    });

    // PAGINATION
    const total = result.length;
    const offset = (page - 1) * limit;

    const items = result.slice(
      offset,
      offset + limit,
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========================================
  // GET UPCOMING PUBLISHED EVENTS
  // ========================================

  findUpcoming(): Event[] {
    const now = new Date();

    return this.events
      .filter(
        (event) =>
          event.isPublished &&
          new Date(event.eventDate) >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime(),
      );
  }

  // ========================================
  // FIND EVENT BY ID
  // Used by EventPolicyGuard
  // ========================================

  findById(id: string): Event | undefined {
    return this.events.find(
      (event) => event.id === id,
    );
  }

  // ========================================
  // GET ONE EVENT
  // ========================================

  findOne(id: string): Event {
    const event = this.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // ========================================
  // GET MY EVENTS
  // ========================================

  findMyEvents(userId: string): Event[] {
    return this.events.filter(
      (event) => event.createdBy === userId,
    );
  }

  // ========================================
  // UPDATE EVENT
  // ========================================

  update(
    id: string,
    data: UpdateEventDto,
    user: AuthUser,
  ): Event {
    const event = this.findOne(id);

    this.checkEventOwnership(user, event);

    const updatedEvent: Event = {
      ...event,
      ...data,

      // Protected fields cannot be changed by DTO.
      id: event.id,
      createdBy: event.createdBy,
      isPublished: event.isPublished,
    };

    const index = this.events.findIndex(
      (item) => item.id === id,
    );

    this.events[index] = updatedEvent;

    return updatedEvent;
  }

  // ========================================
  // PUBLISH EVENT
  // ========================================

  publish(
    id: string,
    user: AuthUser,
  ): Event {
    const event = this.findOne(id);

    this.checkEventOwnership(user, event);

    const publishedEvent: Event = {
      ...event,
      isPublished: true,
    };

    const index = this.events.findIndex(
      (item) => item.id === id,
    );

    this.events[index] = publishedEvent;

    return publishedEvent;
  }

  // ========================================
  // DELETE EVENT
  // Also deletes its sessions.
  // ========================================

  remove(
    id: string,
    user: AuthUser,
  ) {
    const event = this.findOne(id);

    this.checkEventOwnership(user, event);

    this.events = this.events.filter(
      (item) => item.id !== id,
    );

    this.sessions = this.sessions.filter(
      (session) => session.eventId !== id,
    );

    return {
      message: 'Event deleted successfully',
    };
  }

  // ========================================
  // GET ALL SESSIONS OF AN EVENT
  // ========================================

  findSessions(eventId: string): Session[] {
    // First make sure the parent event exists.
    this.findOne(eventId);

    return this.sessions.filter(
      (session) => session.eventId === eventId,
    );
  }

  // ========================================
  // GET ONE SESSION UNDER AN EVENT
  // ========================================

  findOneSession(
    eventId: string,
    sessionId: string,
  ): Session {
    this.findOne(eventId);

    const session = this.sessions.find(
      (item) =>
        item.id === sessionId &&
        item.eventId === eventId,
    );

    if (!session) {
      throw new NotFoundException(
        'Session not found',
      );
    }

    return session;
  }

  // ========================================
  // CREATE SESSION
  // ADMIN or owner ORGANIZER only
  // ========================================

  createSession(
    eventId: string,
    data: CreateSessionDto,
    user: AuthUser,
  ): Session {
    const event = this.findOne(eventId);

    this.checkEventOwnership(user, event);

    this.validateSessionTime(
      data.startsAt,
      data.endsAt,
    );

    const newSession: Session = {
      id: randomUUID(),
      eventId: event.id,
      title: data.title,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      room: data.room,
    };

    this.sessions.push(newSession);

    return newSession;
  }

  // ========================================
  // UPDATE SESSION
  // ADMIN or owner ORGANIZER only
  // ========================================

  updateSession(
    eventId: string,
    sessionId: string,
    data: UpdateSessionDto,
    user: AuthUser,
  ): Session {
    const event = this.findOne(eventId);

    this.checkEventOwnership(user, event);

    // This checks both session ID and parent event ID.
    const session = this.findOneSession(
      eventId,
      sessionId,
    );

    this.validateSessionTime(
      data.startsAt ?? session.startsAt,
      data.endsAt ?? session.endsAt,
    );

    const updatedSession: Session = {
      ...session,
      ...data,

      // These fields must never change.
      id: session.id,
      eventId: session.eventId,
    };

    const index = this.sessions.findIndex(
      (item) =>
        item.id === sessionId &&
        item.eventId === eventId,
    );

    this.sessions[index] = updatedSession;

    return updatedSession;
  }

  // ========================================
  // DELETE SESSION
  // ADMIN or owner ORGANIZER only
  // ========================================

  removeSession(
    eventId: string,
    sessionId: string,
    user: AuthUser,
  ) {
    const event = this.findOne(eventId);

    this.checkEventOwnership(user, event);

    // Verify the session belongs to this event.
    this.findOneSession(eventId, sessionId);

    this.sessions = this.sessions.filter(
      (session) =>
        !(
          session.id === sessionId &&
          session.eventId === eventId
        ),
    );

    return {
      message: 'Session deleted successfully',
    };
  }
}
