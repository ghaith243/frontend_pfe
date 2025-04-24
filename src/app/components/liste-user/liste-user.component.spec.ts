import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeUserComponent } from './liste-user.component';
import { expect } from 'chai';

describe('ListeUserComponent', () => {
  let component: ListeUserComponent;
  let fixture: ComponentFixture<ListeUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok
  });
});
