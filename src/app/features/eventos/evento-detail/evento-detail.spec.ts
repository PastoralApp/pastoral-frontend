import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoDetail } from './evento-detail';

describe('EventoDetail', () => {
  let component: EventoDetail;
  let fixture: ComponentFixture<EventoDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
