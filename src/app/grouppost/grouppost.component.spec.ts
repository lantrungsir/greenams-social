import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrouppostComponent } from './grouppost.component';

describe('GrouppostComponent', () => {
  let component: GrouppostComponent;
  let fixture: ComponentFixture<GrouppostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrouppostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrouppostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
