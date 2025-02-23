import { TestBed } from '@angular/core/testing';

import { CongesService } from './conges.service';
import { expect } from 'chai';

describe('CongesService', () => {
  let service: CongesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CongesService);
  });

  it('should be created', () => {

    expect(service).to.be.ok;
  });
});
