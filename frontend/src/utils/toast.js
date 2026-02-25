import toast from 'react-hot-toast'

export function showSuccessToast(message) {
  return toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
    }
  })
}

export function showErrorToast(message) {
  return toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
    }
  })
}

export function showLoadingToast(message) {
  return toast.loading(message, {
    position: 'top-right',
  })
}

export function dismissToast(toastId) {
  toast.dismiss(toastId)
}

export function isClerkAPIResponseError(error) {
  return error && Array.isArray(error.errors) && error.errors.length > 0
}
