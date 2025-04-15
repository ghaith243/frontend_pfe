import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeAbsenceComponent } from './employe-absence.component';
import { expect } from 'chai';

describe('EmployeAbsenceComponent', () => {
  let component: EmployeAbsenceComponent;
  let fixture: ComponentFixture<EmployeAbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeAbsenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeAbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok
  });
});
