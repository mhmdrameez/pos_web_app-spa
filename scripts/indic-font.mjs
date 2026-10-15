// Cuts a Noto Sans font for an Indic script down to the glyphs the site actually shows.
//
// A plain character subset keeps every conjunct the font could form from those letters (70 KB+).
// Instead we shape each word with HarfBuzz, note which glyphs come out, and keep exactly those.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as hb from "harfbuzzjs";
import subsetFont from "subset-font";

const require = createRequire(import.meta.url);

const HB_MEMORY_MODE_WRITABLE = 2;
const HB_SUBSET_FLAGS_NO_LAYOUT_CLOSURE = 0x200;

let subsetWasm;
async function loadSubsetWasm() {
  if (!subsetWasm) {
    const { instance } = await WebAssembly.instantiate(
      await readFile(require.resolve("harfbuzzjs/dist/harfbuzz-subset.wasm"))
    );
    instance.exports._initialize();
    subsetWasm = instance.exports;
  }
  return subsetWasm;
}

const isIndic = (cp) => cp >= 0x0900 && cp !== 0x2019 && cp !== 0x201c && cp !== 0x201d;

/** Words and symbols written in the script, ZWJ/ZWNJ kept inside because they change shaping. */
function runsOf(text) {
  const runs = new Set();
  let cur = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (isIndic(cp) && cp !== 0x2013 && cp !== 0x2014 && cp !== 0x2022 && cp !== 0x2026) cur += ch;
    else if (cur) {
      runs.add(cur);
      cur = "";
    }
  }
  if (cur) runs.add(cur);
  return [...runs];
}

/**
 * @param {Buffer} woff2 the complete (variable) font
 * @param {Array<{lang: string, text: string}>} samples every text shown in this script, with its language
 * @param {number} [pinWeight] when set, the output is a static instance at that weight
 * @returns {Promise<{ data: Buffer, glyphs: number }>} subset WOFF2
 */
export async function subsetIndicFont(woff2, samples, pinWeight) {
  // Plain TrueType copy of the full font: shaping and subsetting both want an sfnt.
  const sfnt = await subsetFont(woff2, "", { keepAllGlyphs: true, targetFormat: "sfnt" });
  const arrayBuffer = sfnt.buffer.slice(sfnt.byteOffset, sfnt.byteOffset + sfnt.byteLength);

  const face = new hb.Face(new hb.Blob(arrayBuffer));
  const gids = new Set([0]);
  const codepoints = new Set([0x20, 0x25cc, 0x200c, 0x200d, 0x20b9, 0x964, 0x965]);

  for (const wght of [400, 700]) {
    const font = new hb.Font(face);
    font.setVariations([new hb.Variation("wght", wght)]);
    for (const { lang, text } of samples) {
      for (const run of runsOf(text)) {
        for (const ch of run) codepoints.add(ch.codePointAt(0));
        const buffer = new hb.Buffer();
        buffer.addText(run);
        buffer.guessSegmentProperties();
        buffer.setLanguage(lang);
        hb.shape(font, buffer);
        for (const g of buffer.getGlyphInfos()) gids.add(g.codepoint);
      }
    }
  }

  const w = await loadSubsetWasm();
  const heap = () => new Uint8Array(w.memory.buffer);

  const input = w.hb_subset_input_create_or_fail();
  const fontPtr = w.malloc(sfnt.byteLength);
  heap().set(sfnt, fontPtr);
  const blob = w.hb_blob_create(fontPtr, sfnt.byteLength, HB_MEMORY_MODE_WRITABLE, 0, 0);
  const srcFace = w.hb_face_create(blob, 0);
  w.hb_blob_destroy(blob);

  w.hb_subset_input_set_flags(input, w.hb_subset_input_get_flags(input) | HB_SUBSET_FLAGS_NO_LAYOUT_CLOSURE);
  const uni = w.hb_subset_input_unicode_set(input);
  for (const cp of codepoints) w.hb_set_add(uni, cp);
  const glyphSet = w.hb_subset_input_glyph_set(input);
  for (const g of gids) w.hb_set_add(glyphSet, g);

  if (pinWeight) {
    const tag = [..."wght"].reduce((a, ch) => (a << 8) + ch.charCodeAt(0), 0);
    if (!w.hb_subset_input_pin_axis_location(input, srcFace, tag, pinWeight)) throw new Error("could not pin wght");
  }

  const subset = w.hb_subset_or_fail(srcFace, input);
  w.hb_subset_input_destroy(input);
  if (!subset) throw new Error("hb_subset_or_fail failed");
  const result = w.hb_face_reference_blob(subset);
  const offset = w.hb_blob_get_data(result, 0);
  const length = w.hb_blob_get_length(result);
  const out = Buffer.from(heap().subarray(offset, offset + length));
  w.hb_blob_destroy(result);
  w.hb_face_destroy(subset);
  w.hb_face_destroy(srcFace);
  w.free(fontPtr);

  const fontverter = require("fontverter");
  const data = await fontverter.convert(out, "woff2", "truetype");
  return { data, glyphs: gids.size };
}
