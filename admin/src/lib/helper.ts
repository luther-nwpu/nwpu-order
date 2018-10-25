/**
 * tryCatch return Promise<[T, Error]>
 * @param {Promise<T>} promise
 */
export async function tryCatch(promise: any) {
  try {
    const ret = await promise
    return [ret, null]
  } catch (e) {
    return [null, e]
  }
}

export async function fetch(param: any) {
  console.log(param)
}
