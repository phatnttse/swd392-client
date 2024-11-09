import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbanUserComponent } from './unban-user.component';

describe('UnbanUserComponent', () => {
  let component: UnbanUserComponent;
  let fixture: ComponentFixture<UnbanUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnbanUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnbanUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
