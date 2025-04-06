import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitleaveComponent } from './submitleave.component';
import { expect } from 'chai';

describe('SubmitleaveComponent', () => {
  let component: SubmitleaveComponent;
  let fixture: ComponentFixture<SubmitleaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitleaveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitleaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok;
  });
});
