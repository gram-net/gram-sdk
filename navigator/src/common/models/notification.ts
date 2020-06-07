/** @format */

export type NotificationType = 'warning' | 'info' | 'error' | 'success'

export interface Notification {
  text: string
  duration: number
  type: NotificationType
  timeCreated: string
  timeDismissed: string
  id: string
  timer: any
  payload?: any
  dismiss(): void
}

export interface NotificationOptions {
  text: string
  type?: NotificationType
  duration?: number
  payload?: any
}
