declare module "omggif" {
  export interface GifFrameInfo {
    x: number;
    y: number;
    width: number;
    height: number;
    has_local_palette: boolean;
    palette_offset: number;
    palette_size: number;
    data_offset: number;
    data_length: number;
    transparent_index: number | null;
    interlaced: boolean;
    delay: number;
    disposal: number;
  }

  export class GifReader {
    constructor(buf: Uint8Array);
    width: number;
    height: number;
    numFrames(): number;
    frameInfo(frame_num: number): GifFrameInfo;
    decodeAndBlitFrameRGBA(frame_num: number, pixels: Uint8ClampedArray): void;
  }

  export class GifWriter {
    constructor(buf: Uint8Array, width: number, height: number, options?: object);
    addFrame(
      x: number,
      y: number,
      w: number,
      h: number,
      indexed_pixels: Uint8Array,
      options?: object
    ): number;
    end(): number;
  }
}
