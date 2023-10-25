import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class AuditTrailSubscriber implements EntitySubscriberInterface {
  afterInsert(event: InsertEvent<any>): void | Promise<any> {
    // To audit here...
    
  }

  afterUpdate(event: UpdateEvent<any>): void | Promise<any> {
    //
  }
}
