declare module 'bigi' {
  export default class BigInteger {
    constructor(value: number | string | Buffer | Uint8Array | number[]);
    static fromBuffer(buffer: Buffer): BigInteger;
    static fromHex(hex: string): BigInteger;
    toBuffer(size?: number): Buffer;
    toHex(): string;
    toDERInteger(): Buffer;
  }
}
