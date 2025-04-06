import { TestBed } from '@angular/core/testing';

import { ChartService } from './chart.service';
import { expect } from 'chai';

describe('ChartService', () => {
  let service: ChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartService);
  });

  it('should be created', () => {
    expect(service).to.be.ok
  });
});
