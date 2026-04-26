import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isPlainObject,
  readJsonStorage,
  readStringStorage
} from './localStorageState.js'

const createStorage = initialValues => {
  const values = new Map(Object.entries(initialValues))
  const removedKeys = []

  return {
    removedKeys,
    getItem: key => values.has(key) ? values.get(key) : null,
    removeItem: key => {
      removedKeys.push(key)
      values.delete(key)
    }
  }
}

describe('readJsonStorage', () => {
  it('returns parsed JSON when it passes validation', () => {
    const storage = createStorage({
      owned: '{"style_id":2}'
    })

    assert.deepEqual(
      readJsonStorage(storage, 'owned', {}, isPlainObject),
      { style_id: 2 }
    )
    assert.deepEqual(storage.removedKeys, [])
  })

  it('returns fallback without cleanup when value is missing', () => {
    const storage = createStorage({})

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
    assert.deepEqual(storage.removedKeys, [])
  })

  it('returns fallback and removes malformed JSON', () => {
    const storage = createStorage({
      owned: '{bad json'
    })

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
    assert.deepEqual(storage.removedKeys, ['owned'])
  })

  it('returns fallback and removes values that fail validation', () => {
    const storage = createStorage({
      owned: '[]'
    })

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
    assert.deepEqual(storage.removedKeys, ['owned'])
  })

  it('returns fallback when cleanup throws', () => {
    const storage = {
      getItem: () => '{bad json',
      removeItem: () => {
        throw new Error('blocked')
      }
    }

    assert.deepEqual(readJsonStorage(storage, 'owned', {}, isPlainObject), {})
  })
})

describe('readStringStorage', () => {
  it('returns stored string when it is allowed', () => {
    const storage = createStorage({
      viewMode: 'hide'
    })

    assert.equal(readStringStorage(storage, 'viewMode', 'dim', ['dim', 'hide']), 'hide')
    assert.deepEqual(storage.removedKeys, [])
  })

  it('returns fallback and removes disallowed strings', () => {
    const storage = createStorage({
      viewMode: 'unknown'
    })

    assert.equal(readStringStorage(storage, 'viewMode', 'dim', ['dim', 'hide']), 'dim')
    assert.deepEqual(storage.removedKeys, ['viewMode'])
  })

  it('returns fallback when getItem throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {}
    }

    assert.equal(readStringStorage(storage, 'viewMode', 'dim', ['dim', 'hide']), 'dim')
  })
})
