import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberStatisticComponent } from './member-statistic.component';

describe('MemberStatisticComponent', () => {
  let component: MemberStatisticComponent;
  let fixture: ComponentFixture<MemberStatisticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberStatisticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
