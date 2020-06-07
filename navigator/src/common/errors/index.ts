/** @format */

export default (err, store) => {
  const { dispatch } = store
  const { message, status } = err

  // console.warn("Errors:", err);

  let theme = 'info'
  let timer = 5000
  let messageCustom = message

  if (status === 418) {
    theme = 'warning'
    timer = 5000
  }
  if (status === 401 || status === 500 || status === 403) {
    theme = 'error'
    timer = 5000
  }

  if (!message) {
    if (status === 401) messageCustom = 'Unauthorized'
    if (status === 500) {
      messageCustom = 'Server not found. Try again or contact support'
    }
    if (status === 403) messageCustom = 'Forbidden'
    if (status === 999) messageCustom = 'Unknown error'
  }
  // TODO: code messages into localised strings
  dispatch('Common/Notifications/notify', {
    type: theme,
    text: messageCustom,
    duration: timer
  })
}
