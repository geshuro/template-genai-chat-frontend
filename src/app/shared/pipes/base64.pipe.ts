import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'base64',
})
export class Base64Pipe implements PipeTransform {
  transform(value?: string, decode: boolean = false): string {
    if (!value || value.length === 0) return '';
    const encoder = new TextEncoder();
    // Codificar la cadena a Base64 manteniendo las tildes
    const encodeValue = encoder.encode(value);
    return decode ? window.atob(value) : this._arrayBufferToBase64(encodeValue);
  }

  _arrayBufferToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
}
