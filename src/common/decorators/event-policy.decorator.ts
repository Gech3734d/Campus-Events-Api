import { SetMetadata } from '@nestjs/common';

export const EVENT_POLICY_KEY = 'event_policy';

export type EventAction =
  | 'read'
  |'update'
   |'delete'
   |'publish';

export const CheckEventPolicy = (action: EventAction) =>
  SetMetadata(EVENT_POLICY_KEY, action);