import { MemberStatisticModule } from './member-statistic.module';

describe('MemberStatisticModule', () => {
  let memberStatisticModule: MemberStatisticModule;

  beforeEach(() => {
    memberStatisticModule = new MemberStatisticModule();
  });

  it('should create an instance', () => {
    expect(memberStatisticModule).toBeTruthy();
  });
});
