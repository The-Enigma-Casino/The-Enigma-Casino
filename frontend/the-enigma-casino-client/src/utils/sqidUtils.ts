import Sqids from 'sqids';

const sqids = new Sqids({ minLength: 6 });

export function encodeId(id: number): string {
  return sqids.encode([id]);
}

export function decodeId(encoded: string): number {
  const decoded = sqids.decode(encoded);
  if (!decoded.length) throw new Error("Invalid Sqid");
  return decoded[0];
}
