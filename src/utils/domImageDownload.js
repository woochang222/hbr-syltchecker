import { toPng } from 'html-to-image'

const DEFAULT_IMAGE_TIMEOUT_MS = 10000

const waitForImage = (image, timeoutMs = DEFAULT_IMAGE_TIMEOUT_MS) => {
  if (image.complete) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    let timeoutId

    const resolveAndCleanup = () => {
      image.removeEventListener('load', resolveAndCleanup)
      image.removeEventListener('error', resolveAndCleanup)
      clearTimeout(timeoutId)
      resolve()
    }

    timeoutId = setTimeout(resolveAndCleanup, timeoutMs)
    image.addEventListener('load', resolveAndCleanup)
    image.addEventListener('error', resolveAndCleanup)
  })
}

export const waitForImages = (element, timeoutMs = DEFAULT_IMAGE_TIMEOUT_MS) => {
  const images = Array.from(element.querySelectorAll('img'))
  return Promise.all(images.map(image => waitForImage(image, timeoutMs)))
}

export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
}

export const downloadElementAsPng = async (element, filename) => {
  await waitForImages(element)
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#121212'
  })
  downloadDataUrl(dataUrl, filename)
}
