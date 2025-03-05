import { TestBed } from '@angular/core/testing';

import { NotificationsService } from './notifications.service';
import { expect } from 'chai';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsService);
  });

  it('should be created', () => {
    expect(service).to.be.ok;
  });
});
