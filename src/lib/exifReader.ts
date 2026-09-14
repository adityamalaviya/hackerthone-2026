// Zero-dependency browser-safe EXIF GPS parser
export interface ExifGpsResult {
  latitude: number;
  longitude: number;
}

export async function extractExifGps(file: File): Promise<ExifGpsResult | null> {
  try {
    const buffer = await file.slice(0, 131072).arrayBuffer(); // read first 128KB
    const view = new DataView(buffer);

    // Check SOI marker 0xFFD8
    if (view.getUint16(0, false) !== 0xffd8) {
      return null;
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      // APP1 marker containing EXIF
      if (marker === 0xffe1) {
        const app1Length = view.getUint16(offset, false);
        offset += 2;

        // Check for 'Exif\0\0' (0x457869660000)
        if (
          view.getUint32(offset, false) === 0x45786966 &&
          view.getUint16(offset + 4, false) === 0x0000
        ) {
          const tiffStart = offset + 6;
          const isLittleEndian = view.getUint16(tiffStart, false) === 0x4949;

          const firstIfdOffset = view.getUint32(tiffStart + 4, isLittleEndian);
          if (firstIfdOffset < 8) return null;

          const ifd0 = tiffStart + firstIfdOffset;
          const numEntries = view.getUint16(ifd0, isLittleEndian);

          let gpsIfdOffset: number | null = null;
          for (let i = 0; i < numEntries; i++) {
            const entryOffset = ifd0 + 2 + i * 12;
            if (entryOffset + 12 > length) break;
            const tag = view.getUint16(entryOffset, isLittleEndian);
            if (tag === 0x8825) { // GPS Info IFD
              gpsIfdOffset = tiffStart + view.getUint32(entryOffset + 8, isLittleEndian);
              break;
            }
          }

          if (gpsIfdOffset && gpsIfdOffset + 2 < length) {
            const gpsEntries = view.getUint16(gpsIfdOffset, isLittleEndian);
            let latDms: number[] | null = null;
            let lonDms: number[] | null = null;
            let latRef: string = 'N';
            let lonRef: string = 'E';

            const readRational = (ptr: number): number => {
              const num = view.getUint32(ptr, isLittleEndian);
              const den = view.getUint32(ptr + 4, isLittleEndian);
              return den === 0 ? 0 : num / den;
            };

            for (let i = 0; i < gpsEntries; i++) {
              const entry = gpsIfdOffset + 2 + i * 12;
              if (entry + 12 > length) break;
              const tag = view.getUint16(entry, isLittleEndian);

              if (tag === 1) {
                // GPSLatitudeRef
                latRef = String.fromCharCode(view.getUint8(entry + 8));
              } else if (tag === 2) {
                // GPSLatitude
                const valOffset = tiffStart + view.getUint32(entry + 8, isLittleEndian);
                if (valOffset + 24 <= length) {
                  latDms = [
                    readRational(valOffset),
                    readRational(valOffset + 8),
                    readRational(valOffset + 16),
                  ];
                }
              } else if (tag === 3) {
                // GPSLongitudeRef
                lonRef = String.fromCharCode(view.getUint8(entry + 8));
              } else if (tag === 4) {
                // GPSLongitude
                const valOffset = tiffStart + view.getUint32(entry + 8, isLittleEndian);
                if (valOffset + 24 <= length) {
                  lonDms = [
                    readRational(valOffset),
                    readRational(valOffset + 8),
                    readRational(valOffset + 16),
                  ];
                }
              }
            }

            if (latDms && lonDms) {
              let lat = latDms[0] + latDms[1] / 60 + latDms[2] / 3600;
              let lon = lonDms[0] + lonDms[1] / 60 + lonDms[2] / 3600;
              if (latRef === 'S') lat = -lat;
              if (lonRef === 'W') lon = -lon;
              return {
                latitude: Number(lat.toFixed(6)),
                longitude: Number(lon.toFixed(6)),
              };
            }
          }
        }
        offset += app1Length;
      } else if (marker === 0xffda || marker === 0xffd9) {
        // Start of scan or end of image
        break;
      } else {
        const segLen = view.getUint16(offset, false);
        offset += segLen;
      }
    }
  } catch (err) {
    console.debug('EXIF GPS parse error (can use device GPS fallback):', err);
  }
  return null;
}
