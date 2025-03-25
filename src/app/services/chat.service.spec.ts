import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';
import { expect } from 'chai';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).to.be.ok;
  });
});
