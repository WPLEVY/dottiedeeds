import { describe, it, expect } from 'vitest';
import * as G from './generators.js';
import { FORM, MASTER } from './__fixtures__/sample.js';

// Each deed generator: (form, master) -> HTML string.
// mustContain = distinctive statutory/document content confirmed for this deed type.
const deedGenerators = {
  genGrant:        ['Documentary Transfer Tax'],
  genTrust:        ['11930'],
  genDOT:          ['reconvey'],
  genQuitclaim:    ['Documentary Transfer Tax'],
  genInterspousal: ['11911'],
  genADJT:         ['Joint Tenant'],
  genADTR:         ['Documentary Transfer Tax'],
  genSSCP:         ['Probate Code'],
  genTOD:          ['480.3'],
  genRecon:        ['reconvey'],
  genEasement:     ['Documentary Transfer Tax'],
  genDOTMod:       ['Documentary Transfer Tax'],
  genTrusteeDeed:  ['2924'],
  genSheriff:      ['redemption'],
};

describe('deed generators', () => {
  for (const [name, mustContain] of Object.entries(deedGenerators)) {
    describe(name, () => {
      const out = G[name](FORM, MASTER);
      it('returns a non-empty HTML string', () => {
        expect(typeof out).toBe('string');
        expect(out.length).toBeGreaterThan(500);
      });
      it('includes the parcel number and county', () => {
        expect(out).toContain(FORM.apn);
        expect(out).toContain(FORM.county);
      });
      it('includes its required document content', () => {
        for (const s of mustContain) expect(out).toContain(s);
      });
      it('matches the approved baseline (regression lock)', () => {
        expect(out).toMatchSnapshot();
      });
    });
  }
});

describe('genPCOR (BOE-502-A)', () => {
  const out = G.genPCOR('granttrust', FORM, MASTER, {});
  it('returns a substantial HTML string', () => {
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(1000);
  });
  it('includes the parcel number', () => { expect(out).toContain(FORM.apn); });
  it('matches the approved baseline (regression lock)', () => {
    expect(out).toMatchSnapshot();
  });
});
