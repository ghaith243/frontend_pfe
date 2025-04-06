import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavedecisionComponent } from './leavedecision.component';
import { expect } from 'chai';

describe('LeavedecisionComponent', () => {
  let component: LeavedecisionComponent;
  let fixture: ComponentFixture<LeavedecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavedecisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavedecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok;
  });
});
