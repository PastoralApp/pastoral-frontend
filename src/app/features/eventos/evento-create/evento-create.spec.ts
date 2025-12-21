import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoCreate } from './evento-create';

describe('EventoCreate', () => {
  let component: EventoCreate;
  let fixture: ComponentFixture<EventoCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
