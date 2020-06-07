/** @format */

import store from '@/common/store'
import router from '@/router'
import { Location } from 'vue-router'

export const redirectSomethingWrong = (error) => {
  const route: Location = {
    path: '/something-wrong',
    query: { error }
  }
  router.push(route)
}

export default (error) => {
  let e: any = { status: 999, message: 'Unknown Error' }

  if (error.response) {
    e = error.response.data
    return e
  } else if (error.request) {
    e = { status: 500, message: 'Server Error' }
  }

  if (e.message && !(e.status && e.status === 500)) {
    return e
  } else {
    return redirectSomethingWrong(e)
  }
}

export function addTimeoutToPromise<T = any>(
  promise: Promise<T>,
  timeout = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    promise.then(resolve, reject)
    setTimeout(reject, timeout)
  })
}

export const handleError = async (
  error: any,
  text = 'Something went wrong',
  duration = 2500,
  redirect = false
) => {
  const notification = await store.original.dispatch('Common/Notifications/notify', {
    text,
    type: 'error',
    duration,
    payload: { error }
  })
  if (redirect) {
    router.push('/notification/' + notification.notification.id)
  }
  return notification
}

export async function handleTimeout<T = any>(
  promise: Promise<T>,
  timeout = 20000,
  redirect = true
) {
  try {
    return addTimeoutToPromise(promise, timeout)
  } catch (error) {
    store.original.commit('Common/clearTimer')
    return handleError(
      error,
      `Server timed out after ${timeout} milliseconds`,
      timeout,
      redirect
    )
  }
}
