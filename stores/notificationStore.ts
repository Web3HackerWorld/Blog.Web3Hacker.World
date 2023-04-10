interface MessageItem { title: string; timeout?: number; type?: string; _id?: number }

const timerMap = {}
export const notificationStore = defineStore('notificationStore', () => {
  const items = $ref<[MessageItem]>([])
  let error = $ref(false)
  let success = $ref(false)
  let alertType = $ref(false)
  let alertCB = $ref(false)
  const addItem = (item: item) => {
    if (!item._id)
      item._id = parseInt(`${Date.now()}${Math.floor(Math.random() * 10000)}`, 10)

    const timeout = (item.timeout || 3) + 1

    items.push(item)
    timerMap[item._id] = setTimeout(() => {
      removeItem(item)
    }, timeout * 1000)

    return item
  }

  const removeItem = (item: MessageItem) => {
    const index = useFindIndex(items, _item => item._id === _item._id)
    if (index === -1)
      return
    items.splice(index, 1)
    if (timerMap[item._id]) {
      clearTimeout(timerMap[item._id])
      timerMap[item._id] = null
      delete timerMap[item._id]
    }
  }

  const addLoading = (title) => {
    return addItem({
      title,
      type: 'loading',
      timeout: 10000,
    })
  }

  const addSuccess = (title, loadingItem = false, timeout = 3) => {
    if (loadingItem)
      removeItem(loadingItem)

    addItem({
      title,
      type: 'success',
      timeout,
    })
  }

  const addWarning = (title, loadingItem = false) => {
    if (loadingItem)
      removeItem(loadingItem)

    addItem({
      title,
      type: 'warning',
    })
  }

  const addError = (title, loadingItem = false) => {
    if (loadingItem)
      removeItem(loadingItem)

    addItem({
      title,
      type: 'error',
    })
  }

  const alertError = (err) => {
    alertType = 'error'
    error = err
  }

  const alertSuccess = (title, _alertCB = false) => {
    alertType = 'success'
    success = title
    alertCB = _alertCB
  }

  const doCloseAlert = async () => {
    if (alertCB)
      await alertCB()

    alertType = false
    alertCB = false
  }

  return $$({
    alertError,
    alertSuccess,
    addLoading,
    addSuccess,
    addWarning,
    addError,
    addItem,
    removeItem,
    doCloseAlert,
    items,
    error,
    success,
    alertType,
  })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(notificationStore, import.meta.hot))
