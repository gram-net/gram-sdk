/** @format */

export function getCache<T = any>(key: string, defaultValue: T) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue)) as T
}

export function setCache(key: string, value: any = null) {
  localStorage.setItem(key, JSON.stringify(value))
}
