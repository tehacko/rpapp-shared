/**
 * @jest-environment jsdom
 *
 * G4 — continuous autofocus + mild optical zoom after getUserMedia.
 */
import {
  applyScannerTrackEnhancements,
  SCANNER_PREFERRED_ZOOM,
} from '../hooks/scannerCameraConstraints.js';

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

  it('requests mild optical zoom when zoom capability allows it', async () => {
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

    expect(applyConstraints).toHaveBeenCalledWith({
      advanced: [{ focusMode: 'continuous' }, { zoom: SCANNER_PREFERRED_ZOOM }],
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
