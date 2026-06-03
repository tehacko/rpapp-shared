import {
  BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS,
  BRIDGE_PARITY_FIXTURE_GRANTS,
  expandCapabilitiesForClientCheck,
} from './capabilityBridgeRules.js';

describe('capabilityBridgeRules parity fixture', () => {
  it('expands users:admins:create to tenant admin capability bridge targets', () => {
    const expanded = expandCapabilitiesForClientCheck([...BRIDGE_PARITY_FIXTURE_GRANTS]);
    for (const target of BRIDGE_PARITY_FIXTURE_EXPECTED_TARGETS) {
      expect(expanded.has(target)).toBe(true);
    }
  });
});
