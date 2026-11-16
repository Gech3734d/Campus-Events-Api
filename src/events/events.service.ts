import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto.js';
import { FindEventsQueryDto } from './dto/find-events-query.dto.js';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  category: string;
  isPublished: boolean;
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  room: string;
}

@Injectable()
export class EventsService {
  private events: Event[] = [
    {
      id: 'evt-101',
      title: 'Technology Workshop',
      description: 'Learn modern web development.',
      location: 'Main Campus',
      eventDate: '2026-12-04T09:00:00.000Z',
      category: 'technology',
      isPublished: true,
    },
    {
      id: 'evt-102',
      title: 'Business Conference',
      description: 'Business and entrepreneurship.',
      location: 'Business Block',
      eventDate: '2026-12-10T10:00:00.000Z',
      category: 'business',
      isPublished: true,
    },
    {
      id: 'evt-103',
      title: 'Programming Competition',
      description: 'Coding competition for students.',
      location: 'Engineering Block',
      eventDate: '2026-12-15T08:00:00.000Z',
      category: 'technology',
      isPublished: true,
    },
    {
      id: 'evt-104',
      title: 'Cultural Festival',
      description: 'Celebrate different cultures.',
      location: 'Main Campus',
      eventDate: '2026-12-20T09:00:00.000Z',
      category: 'culture',
      isPublished: false,
    },
    {
      id: 'evt-105',
      title: 'Graduation Ceremony',
      description: 'Annual graduation event.',
      location: 'Main Hall',
      eventDate: '2026-10-15T09:00:00.000Z',
      category: 'education',
      isPublished: true,
    },
  ];

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

  // GET ALL EVENTS + FILTER + SORT + PAGINATION
  findAll(query: FindEventsQueryDto) {
    const {
      category,
      location,
      isPublished,
      sortBy = 'eventDate',
      order = 'asc',
      page = 1,
      limit = 5,
    } = query;

    // 1. FILTER
    let result = this.events.filter((event) => {
      return (
        (!category ||
          event.category.toLowerCase() === category.toLowerCase()) &&
        (!location ||
          event.location.toLowerCase().includes(location.toLowerCase())) &&
        (isPublished === undefined ||
          event.isPublished === isPublished)
      );
    });

    // 2. SORT
    result = [...result].sort((a, b) => {
      const comparison =
        sortBy === 'title'
          ? a.title.localeCompare(b.title)
          : new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime();

      return order === 'desc' ? -comparison : comparison;
    });

    // 3. PAGINATION
    const total = result.length;
    const offset = (page - 1) * limit;

    const items = result.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // GET UPCOMING EVENTS
  findUpcoming() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.events.filter(
      (event) => new Date(event.eventDate) >= today,
    );
  }

  // GET ONE EVENT
  findOne(id: string) {
    const event = this.events.find(
      (event) => event.id === id,
    );

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // GET ALL SESSIONS OF AN EVENT
  findSessions(eventId: string) {
    this.findOne(eventId);

    return this.sessions.filter(
      (session) => session.eventId === eventId,
    );
  }

  // GET ONE SESSION UNDER AN EVENT
  findOneSession(eventId: string, sessionId: string) {
    this.findOne(eventId);

    const session = this.sessions.find(
      (session) =>
        session.id === sessionId &&
        session.eventId === eventId,
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  // CREATE EVENT
  create(data: CreateEventDto) {
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      ...data,
    };

    this.events.push(newEvent);

    return newEvent;
  }
}