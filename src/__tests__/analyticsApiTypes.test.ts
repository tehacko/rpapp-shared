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
      isClosed: false,
    });
  });

  it('parses optional sessionAuthToken fields', () => {
    const data: AnalyticsStartSessionData = {
      session: { sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee' },
      created: false,
      sessionAuthToken: 'tok',
      sessionAuthTokenExpiresAt: '2026-06-04T00:00:00.000Z',
    };
    expect(parseAnalyticsStartSessionData(data)).toEqual({
      sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
      created: false,
      isClosed: false,
      sessionAuthToken: 'tok',
      sessionAuthTokenExpiresAt: '2026-06-04T00:00:00.000Z',
    });
  });

  it('parses closed session flags from nested session', () => {
    expect(
      parseAnalyticsStartSessionData({
        session: {
          sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
          completed: true,
        },
        created: false,
      }),
    ).toEqual({
      sessionId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
      created: false,
      isClosed: true,
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
