import { TestBed } from '@angular/core/testing';

import { AbsencesService } from './absences.service';
import { expect } from 'chai';

describe('AbsencesService', () => {
  let service: AbsencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbsencesService);
  });

  it('should be created', () => {
    expect(service).to.be.ok
  });
});
