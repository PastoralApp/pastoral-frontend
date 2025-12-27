import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedSidebarComponent } from './feed-sidebar.component';

describe('FeedSidebarComponent', () => {
  let component: FeedSidebarComponent;
  let fixture: ComponentFixture<FeedSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
