export interface SystemInfo {
  ua: string,
  browser: { name: string },
  engine: { name: string },
  os: { name: string },
  device: { model: string, type: string }
}