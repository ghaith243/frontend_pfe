import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagerieComponent } from './messagerie.component';
import { expect } from 'chai';

describe('MessagerieComponent', () => {
  let component: MessagerieComponent;
  let fixture: ComponentFixture<MessagerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagerieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).to.be.ok;
  });
});
