import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAllcongeComponent } from './liste-allconge.component';
import { expect } from 'chai';

describe('ListeAllcongeComponent', () => {
  let component: ListeAllcongeComponent;
  let fixture: ComponentFixture<ListeAllcongeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeAllcongeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeAllcongeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok;
  });
});
