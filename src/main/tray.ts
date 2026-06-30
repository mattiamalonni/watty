import { deflateSync } from 'zlib'
import { Menu, nativeImage, Tray } from 'electron'
import { checkForUpdatesManually } from './updater'
import { showWindow } from './window'

let tray: Tray | null = null

// ── Drop icon generator ────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf: Buffer): number {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Buffer): Buffer {
  const lenBuf = Buffer.allocUnsafe(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function buildDropPng(level: 0 | 1 | 2 | 3 | 4, size: number): Buffer {
  const cx = size / 2
  const cy = size * 0.62
  const r = size * 0.32
  const tipY = size * 0.08

  const dropBottom = cy + r
  const dropHeight = dropBottom - tipY
  const fillY = dropBottom - (level / 4) * dropHeight

  function insideDrop(x: number, y: number): boolean {
    const inCircle = (x - cx) ** 2 + (y - cy) ** 2 <= r * r
    const inUpper = y >= tipY && y <= cy && Math.abs(x - cx) <= (r * (y - tipY)) / (cy - tipY)
    return inCircle || inUpper
  }

  function onOutline(x: number, y: number): boolean {
    return (
      insideDrop(x, y) &&
      (!insideDrop(x - 1, y) || !insideDrop(x + 1, y) || !insideDrop(x, y - 1) || !insideDrop(x, y + 1))
    )
  }

  const scanlines = new Uint8Array(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    const rowBase = y * (1 + size * 4)
    scanlines[rowBase] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const idx = rowBase + 1 + x * 4
      const alpha = (insideDrop(x, y) && y >= fillY) || onOutline(x, y) ? 255 : 0
      scanlines[idx] = 0     // R
      scanlines[idx + 1] = 0 // G
      scanlines[idx + 2] = 0 // B
      scanlines[idx + 3] = alpha
    }
  }

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type: RGBA
  ihdr[10] = 0 // compression method
  ihdr[11] = 0 // filter method
  ihdr[12] = 0 // interlace method

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(Buffer.from(scanlines))),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

function generateDropIcon(level: 0 | 1 | 2 | 3 | 4): Electron.NativeImage {
  const buf = buildDropPng(level, 44)
  const img = nativeImage.createFromBuffer(buf, { scaleFactor: 2 })
  img.setTemplateImage(true)
  return img
}

export function updateTrayIcon(level: 0 | 1 | 2 | 3 | 4): void {
  tray?.setImage(generateDropIcon(level))
}

// ── Tray ───────────────────────────────────────────────────────

export function createTray(): Tray {
  tray = new Tray(generateDropIcon(4))
  tray.setToolTip('Watty - Stay Hydrated')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Settings',
      click: () => showWindow('settings')
    },
    {
      label: 'Show Reports',
      click: () => showWindow('reports')
    },
    { type: 'separator' },
    {
      label: 'Check for Updates…',
      click: () => checkForUpdatesManually()
    },
    { type: 'separator' },
    {
      label: 'Quit Watty',
      role: 'quit',
      accelerator: 'CmdOrCtrl+Q'
    }
  ])

  tray.setContextMenu(contextMenu)

  // Left-click also shows context menu on macOS
  tray.on('click', () => {
    tray?.popUpContextMenu()
  })

  return tray
}

export function getTray(): Tray | null {
  return tray
}
