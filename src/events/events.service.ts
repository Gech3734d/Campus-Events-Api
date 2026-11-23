
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import { EventResource } from './policies/event.policy.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { FindEventsQueryDto } from './dto/find-events-query.dto.js';


// EVENT INTERFACE


export interface Event extends EventResource {
  description: string;
  location: string;
  eventDate: string;
  category: string;
}


// SESSION INTERFACE


export interface Session {
  id: string;
  eventId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  room: string;
}
// EVENTS SERVICE


@Injectable()
export class EventsService {

  // IN-MEMORY EVENTS STORAGE
  private events: Event[] = [
    {
      id: 'evt-101',
      title: 'Technology Workshop',
      description: 'Learn modern web development.',
      location: 'Main Campus',
      eventDate: '2026-12-04T09:00:00.000Z',
      category: 'technology',
      isPublished: true,
      createdBy: 'organizer-001',
    },
    {
      id: 'evt-102',
      title: 'Business Conference',
      description: 'Business and entrepreneurship.',
      location: 'Business Block',
      eventDate: '2026-12-10T10:00:00.000Z',
      category: 'business',
      isPublished: true,
      createdBy: 'organizer-001',
    },
    {
      id: 'evt-103',
      title: 'Programming Competition',
      description: 'Coding competition for students.',
      location: 'Engineering Block',
      eventDate: '2026-12-15T08:00:00.000Z',
      category: 'technology',
      isPublished: true,
      createdBy: 'organizer-002',
    },
    {
      id: 'evt-104',
      title: 'Cultural Festival',
      description: 'Celebrate different cultures.',
      location: 'Main Campus',
      eventDate: '2026-12-20T09:00:00.000Z',
      category: 'culture',
      isPublished: false,
      createdBy: 'organizer-002',
    },
    {
      id: 'evt-105',
      title: 'Graduation Ceremony',
      description: 'Annual graduation event.',
      location: 'Main Hall',
      eventDate: '2026-10-15T09:00:00.000Z',
      category: 'education',
      isPublished: true,
      createdBy: 'organizer-001',
    },
  ];

  // IN-MEMORY SESSIONS STORAGE
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

  
  // CREATE EVENT
  

  create(data: CreateEventDto, userId: string): Event {
    const newEvent: Event = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      location: data.location,
      eventDate: data.eventDate,
      category: data.category,
      isPublished: false,
      createdBy: userId,
    };

    this.events.push(newEvent);

    return newEvent;
  }

  
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

    // SORT
    result = [...result].sort((a, b) => {
      const comparison =
        sortBy === 'title'
          ? a.title.localeCompare(b.title)
          : new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime();

      return order === 'desc' ? -comparison : comparison;
    });

    // PAGINATION
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
      (event) =>
        event.isPublished &&
        new Date(event.eventDate) >= today,
    );
  }

  
  // FIND EVENT BY ID
  // Used by EventPolicyGuard
  

  findById(id: string): Event | undefined {
    return this.events.find(
      (event) => event.id === id,
    );
  }

  
  // GET ONE EVENT
  

  findOne(id: string): Event {
    const event = this.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  
  // GET MY EVENTS
  

  findMyEvents(userId: string): Event[] {
    return this.events.filter(
      (event) => event.createdBy === userId,
    );
  }

  
  // GET ALL SESSIONS OF AN EVENT
  

  findSessions(eventId: string): Session[] {
    this.findOne(eventId);

    return this.sessions.filter(
      (session) => session.eventId === eventId,
    );
  }

  
  // GET ONE SESSION UNDER AN EVENT
  

  findOneSession(
    eventId: string,
    sessionId: string,
  ): Session {
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

  
  // UPDATE EVENT
  

  update(
    id: string,
    data: Partial<CreateEventDto>,
  ): Event {
    const event = this.findOne(id);

    const updatedEvent: Event = {
      ...event,
      ...data,
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

  
  // PUBLISH EVENT
  

  publish(id: string): Event {
    const event = this.findOne(id);

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

  
  // DELETE EVENT
  

  remove(id: string) {
    this.findOne(id);

    this.events = this.events.filter(
      (event) => event.id !== id,
    );

    // Also remove sessions belonging to this event
    this.sessions = this.sessions.filter(
      (session) => session.eventId !== id,
    );

    return {
      message: 'Event deleted successfully',
    };
  }
}
