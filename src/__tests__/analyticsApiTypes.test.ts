import {
  parseAnalyticsStartSessionData,
  type AnalyticsStartSessionData,
} from '../analyticsApiTypes.js';

describe('parseAnalyticsStartSessionData', () => {
  it('parses nested session envelope', () => {
    const data: AnalyticsStartSessionData = {
      session: { sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee' },
      created: true,
    };
    expect(parseAnalyticsStartSessionData(data)).toEqual({
      sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
      created: true,
    });
  });

  it('rejects flat sessionId at top level', () => {
    expect(() =>
      parseAnalyticsStartSessionData({
        sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
        created: true,
      }),
    ).toThrow('analytics_start_session_missing_session');
  });

  it('rejects missing sessionId', () => {
    expect(() =>
      parseAnalyticsStartSessionData({ session: {}, created: false }),
    ).toThrow('analytics_start_session_missing_session_id');
  });
});
