declare module 'bip66' {
  export function encode(r: Buffer, s: Buffer): Buffer;
  export function decode(buffer: Buffer): { r: Buffer; s: Buffer };
}
