const dbName = 'cute-cook-book'
const storeName = 'photos'
const photoKey = 'tomato-egg-finished'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('当前浏览器不支持本地照片存储')); return }
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法打开本地照片存储'))
  })
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const request = operation(transaction.objectStore(storeName))
    let result: T
    request.onsuccess = () => { result = request.result }
    request.onerror = () => reject(request.error ?? new Error('本地照片操作失败'))
    transaction.onerror = () => reject(transaction.error ?? new Error('本地照片操作失败'))
    transaction.oncomplete = () => { db.close(); resolve(result) }
    transaction.onabort = () => { db.close(); reject(transaction.error ?? new Error('本地照片操作失败')) }
  })
}

export async function getPhoto(): Promise<Blob | null> {
  return (await withStore<Blob | undefined>('readonly', store => store.get(photoKey))) ?? null
}

export async function savePhoto(blob: Blob): Promise<void> {
  await withStore('readwrite', store => store.put(blob, photoKey))
}

export async function deletePhoto(): Promise<void> {
  await withStore('readwrite', store => store.delete(photoKey))
}
