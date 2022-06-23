export const showDesktopNotification = (rootState, desktopNotificationOpts) => {
  if (!('Notification' in window && window.Notification.permission === 'granted')) return
  if (rootState.statuses.notifications.desktopNotificationSilence) { return }

  return new window.Notification(desktopNotificationOpts.title, desktopNotificationOpts)
}
