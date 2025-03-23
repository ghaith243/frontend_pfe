import { TestBed } from '@angular/core/testing';

import { ProfileService } from './profile.service';
import { expect } from 'chai';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
  });

  it('should be created', () => {
    expect(service).to.be.ok;
  });
});
