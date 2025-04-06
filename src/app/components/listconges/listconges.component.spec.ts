import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListcongesComponent } from './listconges.component';
import { expect } from 'chai';

describe('ListcongesComponent', () => {
  let component: ListcongesComponent;
  let fixture: ComponentFixture<ListcongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListcongesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListcongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
   expect(component).to.be.ok;
  });
});
