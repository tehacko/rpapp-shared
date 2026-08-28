/**
 * @jest-environment jsdom
 *
 * G4 — continuous autofocus + optical zoom ladder after getUserMedia.
 * G9 — deepen Android constraint ladder (exact payloads + retryable names).
 * G2 — NotAllowedError continues early rungs; final `true` rung throws/denies.
 * G1 — torch capability gating on applyScannerTrackEnhancements.
 * G2 — max optical-zoom policy via resolvePreferredOpticalZoom (independent asserts).
 */
import {
  applyScannerDistanceZoom,
  applyScannerTrackEnhancements,
  openScannerMediaStream,
  resolvePreferredOpticalZoom,
  SCANNER_OPTICAL_ZOOM_POLICY,
  SCANNER_VIDEO_CONSTRAINTS,
  SCANNER_VIDEO_CONSTRAINT_FALLBACKS,
} from '../hooks/scannerCameraConstraints.js';

const STEP2_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

const STEP3_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
};

function emptyStream(): MediaStream {
  return { getTracks: () => [], getVideoTracks: () => [] } as unknown as MediaStream;
}

describe('openScannerMediaStream (Android constraint ladder)', () => {
  it('tries preferred constraints first', async () => {
    const stream = emptyStream();
    const gum = jest.fn().mockResolvedValue(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);
    expect(gum).toHaveBeenCalledTimes(1);
    expect(gum).toHaveBeenCalledWith({
      video: SCANNER_VIDEO_CONSTRAINTS,
      audio: false,
    });
  });

  it('G9: preferred → step2 (1280x720) → step3 (facingMode) → step4 (true) with exact payloads on OverconstrainedError', async () => {
    const stream = emptyStream();
    const overconstrained = new DOMException('overconstrained', 'OverconstrainedError');
    const gum = jest
      .fn()
      .mockRejectedValueOnce(overconstrained)
      .mockRejectedValueOnce(overconstrained)
      .mockRejectedValueOnce(overconstrained)
      .mockResolvedValueOnce(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);

    expect(gum).toHaveBeenCalledTimes(4);
    expect(gum.mock.calls[0]?.[0]).toEqual({
      video: SCANNER_VIDEO_CONSTRAINTS,
      audio: false,
    });
    expect(gum.mock.calls[1]?.[0]).toEqual({
      video: STEP2_CONSTRAINTS,
      audio: false,
    });
    expect(gum.mock.calls[2]?.[0]).toEqual({
      video: STEP3_CONSTRAINTS,
      audio: false,
    });
    expect(gum.mock.calls[3]?.[0]).toEqual({
      video: true,
      audio: false,
    });
    expect(SCANNER_VIDEO_CONSTRAINT_FALLBACKS).toEqual([
      SCANNER_VIDEO_CONSTRAINTS,
      STEP2_CONSTRAINTS,
      STEP3_CONSTRAINTS,
      true,
    ]);
  });

  it('G9: NotFoundError (retryable) continues the ladder past preferred', async () => {
    const stream = emptyStream();
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('not found', 'NotFoundError'))
      .mockResolvedValueOnce(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);
    expect(gum).toHaveBeenCalledTimes(2);
    expect(gum.mock.calls[0]?.[0]).toEqual({
      video: SCANNER_VIDEO_CONSTRAINTS,
      audio: false,
    });
    expect(gum.mock.calls[1]?.[0]).toEqual({
      video: STEP2_CONSTRAINTS,
      audio: false,
    });
  });

  it('G9: NotReadableError continues the ladder like OverconstrainedError', async () => {
    const stream = emptyStream();
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('busy', 'NotReadableError'))
      .mockRejectedValueOnce(new DOMException('busy', 'NotReadableError'))
      .mockResolvedValueOnce(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);
    expect(gum).toHaveBeenCalledTimes(3);
    expect(gum.mock.calls[2]?.[0]).toEqual({
      video: STEP3_CONSTRAINTS,
      audio: false,
    });
  });

  it('G9: full four-attempt exhaustion throws the last OverconstrainedError', async () => {
    const first = new DOMException('overconstrained-1', 'OverconstrainedError');
    const second = new DOMException('overconstrained-2', 'OverconstrainedError');
    const third = new DOMException('overconstrained-3', 'OverconstrainedError');
    const last = new DOMException('overconstrained-last', 'OverconstrainedError');
    const gum = jest
      .fn()
      .mockRejectedValueOnce(first)
      .mockRejectedValueOnce(second)
      .mockRejectedValueOnce(third)
      .mockRejectedValueOnce(last);

    await expect(openScannerMediaStream(gum)).rejects.toBe(last);
    expect(gum).toHaveBeenCalledTimes(4);
    expect(gum.mock.calls[3]?.[0]).toEqual({ video: true, audio: false });
  });

  it('G2: NotAllowedError on early rungs continues; succeeds on a later rung', async () => {
    const stream = emptyStream();
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'))
      .mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'))
      .mockResolvedValueOnce(stream);

    await expect(openScannerMediaStream(gum)).resolves.toBe(stream);
    expect(gum).toHaveBeenCalledTimes(3);
    expect(gum.mock.calls[2]?.[0]).toEqual({
      video: STEP3_CONSTRAINTS,
      audio: false,
    });
  });

  it('G2: NotAllowedError on final video:true rung throws (does not invent a fifth attempt)', async () => {
    const denied = new DOMException('denied-final', 'NotAllowedError');
    const gum = jest
      .fn()
      .mockRejectedValueOnce(new DOMException('denied-1', 'NotAllowedError'))
      .mockRejectedValueOnce(new DOMException('denied-2', 'NotAllowedError'))
      .mockRejectedValueOnce(new DOMException('denied-3', 'NotAllowedError'))
      .mockRejectedValueOnce(denied);

    await expect(openScannerMediaStream(gum)).rejects.toBe(denied);
    expect(gum).toHaveBeenCalledTimes(4);
    expect(gum.mock.calls[3]?.[0]).toEqual({ video: true, audio: false });
  });

  it('SecurityError aborts immediately without further ladder attempts', async () => {
    const gum = jest.fn().mockRejectedValue(new DOMException('insecure', 'SecurityError'));

    await expect(openScannerMediaStream(gum)).rejects.toMatchObject({ name: 'SecurityError' });
    expect(gum).toHaveBeenCalledTimes(1);
  });
});

describe('applyScannerTrackEnhancements (G4)', () => {
  it('attempts continuous focusMode when getCapabilities returns focusMode including continuous', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['continuous'],
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(getCapabilities).toHaveBeenCalled();
    expect(applyConstraints).toHaveBeenCalledWith({
      advanced: [{ focusMode: 'continuous' }],
    });
  });

  it('applies focus without optical zoom on open (zoom is delayed distance assist)', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['continuous'],
      zoom: { min: 1, max: 5, step: 0.1 },
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(applyConstraints).toHaveBeenCalledTimes(1);
    expect(applyConstraints).toHaveBeenCalledWith({
      advanced: [{ focusMode: 'continuous' }],
    });
  });

  it('applyScannerDistanceZoom requests mid then max optical zoom ladder', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      zoom: { min: 1, max: 5, step: 0.1 },
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    const preferred = resolvePreferredOpticalZoom(1, 5, 0.1);

    await applyScannerDistanceZoom(track);

    expect(applyConstraints).toHaveBeenNthCalledWith(1, {
      advanced: [{ zoom: 3 }],
    });
    expect(applyConstraints).toHaveBeenNthCalledWith(2, {
      advanced: [{ zoom: preferred }],
    });
  });

  it('does not call applyConstraints when continuous focusMode is absent and zoom unavailable', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['manual'],
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(getCapabilities).toHaveBeenCalled();
    expect(applyConstraints).not.toHaveBeenCalled();
  });

  it('no-ops when getCapabilities is undefined', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const track = {
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(applyConstraints).not.toHaveBeenCalled();
  });
});

describe('resolvePreferredOpticalZoom (G2)', () => {
  it('SCANNER_OPTICAL_ZOOM_POLICY is max (not a hard 2x ceiling)', () => {
    expect(SCANNER_OPTICAL_ZOOM_POLICY).toBe('max');
  });

  it('returns capability max for (min:1, max:5) — fails if hard 2x ceiling returns', () => {
    expect(resolvePreferredOpticalZoom(1, 5)).toBe(5);
    expect(resolvePreferredOpticalZoom(1, 5)).not.toBe(2);
  });

  it('step-snaps down to the highest valid step at or below max', () => {
    // max 5.05 with step 0.1 from min 1 → 1 + floor(40.5)*0.1 = 5.0
    expect(resolvePreferredOpticalZoom(1, 5.05, 0.1)).toBe(5);
    // Wide range: must not clamp to 2x (min+1 or 2)
    expect(resolvePreferredOpticalZoom(1, 8, 0.5)).toBe(8);
    expect(resolvePreferredOpticalZoom(1, 8, 0.5)).not.toBe(2);
  });

  it('returns min when max === min', () => {
    expect(resolvePreferredOpticalZoom(1, 1)).toBe(1);
    expect(resolvePreferredOpticalZoom(2.5, 2.5, 0.1)).toBe(2.5);
  });

  it('returns min when max < min', () => {
    expect(resolvePreferredOpticalZoom(3, 1)).toBe(3);
  });
});

describe('applyScannerTrackEnhancements torch (G1)', () => {
  it('requests advanced { torch: true } when capabilities.torch === true', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      torch: true,
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(getCapabilities).toHaveBeenCalled();
    expect(applyConstraints).toHaveBeenCalled();
    const torchEntries = applyConstraints.mock.calls.flatMap((call) => {
      const advanced = (call[0] as { advanced?: Array<{ torch?: boolean }> }).advanced ?? [];
      return advanced.filter((entry) => entry.torch === true);
    });
    expect(torchEntries).toEqual([{ torch: true }]);
    expect(applyConstraints).toHaveBeenCalledWith({
      advanced: expect.arrayContaining([{ torch: true }]),
    });
  });

  it('includes torch with continuous focus when both are supported', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['continuous'],
      torch: true,
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(applyConstraints).toHaveBeenCalledWith({
      advanced: [{ focusMode: 'continuous' }, { torch: true }],
    });
  });

  it('does not request torch when capabilities.torch is absent', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['continuous'],
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(applyConstraints).toHaveBeenCalled();
    for (const call of applyConstraints.mock.calls) {
      const advanced = (call[0] as { advanced?: Array<{ torch?: boolean }> }).advanced ?? [];
      expect(advanced.some((entry) => Object.prototype.hasOwnProperty.call(entry, 'torch'))).toBe(
        false,
      );
    }
  });

  it('does not request torch when capabilities.torch === false', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      focusMode: ['continuous'],
      torch: false,
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(applyConstraints).toHaveBeenCalled();
    for (const call of applyConstraints.mock.calls) {
      const advanced = (call[0] as { advanced?: Array<{ torch?: boolean }> }).advanced ?? [];
      expect(
        advanced.some(
          (entry) =>
            entry.torch === true || Object.prototype.hasOwnProperty.call(entry, 'torch'),
        ),
      ).toBe(false);
    }
  });

  it('does not call applyConstraints for torch-only when torch is false', async () => {
    const applyConstraints = jest.fn().mockResolvedValue(undefined);
    const getCapabilities = jest.fn().mockReturnValue({
      torch: false,
    });
    const track = {
      getCapabilities,
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await applyScannerTrackEnhancements(track);

    expect(applyConstraints).not.toHaveBeenCalled();
  });
});
