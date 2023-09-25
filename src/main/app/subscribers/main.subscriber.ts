import { EventSubscriber, EntitySubscriberInterface } from 'typeorm';

@EventSubscriber()
export class MainSubscriber implements EntitySubscriberInterface {
  afterLoad(entity: any) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(entity)) {
      if (value instanceof Date) {
        entity[key] = new Date(value).toString();
      }
    }
  }
}
