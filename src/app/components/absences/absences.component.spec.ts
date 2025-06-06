import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsencesComponent } from './absences.component';
import { expect } from 'chai';

describe('AbsencesComponent', () => {
  let component: AbsencesComponent;
  let fixture: ComponentFixture<AbsencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok
  });
});
