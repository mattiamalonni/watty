import type { WattyAPI } from '../preload/index'

declare global {
  interface Window {
    watty: WattyAPI
  }
}
