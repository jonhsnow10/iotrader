import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;
globalThis.global = globalThis;

if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {},
    browser: true,
    version: 'v18.0.0',
  };
}
