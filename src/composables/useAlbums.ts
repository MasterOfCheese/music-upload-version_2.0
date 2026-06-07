import { ref } from 'vue'
import {
  createAlbum as dbCreateAlbum,
  updateAlbum as dbUpdateAlbum,
  deleteAlbum as dbDeleteAlbum,
  getAlbumsByUser as dbGetAlbumsByUser,
  getAllAlbums as dbGetAllAlbums,
  getAlbumWithTracks as dbGetAlbumWithTracks,
  addTrackToAlbum as dbAddTrackToAlbum,
  removeTrackFromAlbum as dbRemoveTrackFromAlbum,
  reorderAlbumTracks as dbReorderAlbumTracks,
  uploadAlbumCover as dbUploadAlbumCover
} from '../lib/supabase'
import type { Album } from '../types/Track'

const albums = ref<Album[]>([])
const currentAlbum = ref<any>(null)
const loading = ref(false)

function mapAlbum(db: any): Album {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    coverUrl: db.cover_url,
    userId: db.user_id,
    username: db.username || db.profiles?.username,
    trackCount: db.track_count ?? 0,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at)
  }
}

export function useAlbums() {
  const loadAllAlbums = async () => {
    loading.value = true
    try {
      const data = await dbGetAllAlbums()
      albums.value = data.map(mapAlbum)
    } catch (error) {
      console.error('Error loading albums:', error)
    } finally {
      loading.value = false
    }
  }

  const loadUserAlbums = async (userId: string) => {
    loading.value = true
    try {
      const data = await dbGetAlbumsByUser(userId)
      albums.value = data.map(mapAlbum)
    } catch (error) {
      console.error('Error loading user albums:', error)
    } finally {
      loading.value = false
    }
  }

  const loadAlbumDetail = async (albumId: string) => {
    loading.value = true
    try {
      const data = await dbGetAlbumWithTracks(albumId)
      currentAlbum.value = data
      return data
    } catch (error) {
      console.error('Error loading album detail:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const createAlbum = async (title: string, description?: string) => {
    const result = await dbCreateAlbum(title, description)
    if (result.success && result.data) {
      const newAlbum = mapAlbum({ ...result.data, track_count: 0 })
      albums.value.unshift(newAlbum)
      return { success: true, album: newAlbum }
    }
    return { success: false, error: result.error }
  }

  const editAlbum = async (albumId: string, updates: { title?: string; description?: string }) => {
    const dbUpdates: any = {}
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description

    const result = await dbUpdateAlbum(albumId, dbUpdates)
    if (result.success) {
      const idx = albums.value.findIndex(a => a.id === albumId)
      if (idx !== -1) {
        albums.value[idx] = { ...albums.value[idx], ...updates, updatedAt: new Date() }
        albums.value = [...albums.value]
      }
    }
    return result
  }

  const removeAlbum = async (albumId: string) => {
    const result = await dbDeleteAlbum(albumId)
    if (result.success) {
      albums.value = albums.value.filter(a => a.id !== albumId)
      if (currentAlbum.value?.id === albumId) {
        currentAlbum.value = null
      }
    }
    return result
  }

  const addTrack = async (albumId: string, trackId: string, position?: number) => {
    const result = await dbAddTrackToAlbum(albumId, trackId, position)
    if (result.success) {
      const idx = albums.value.findIndex(a => a.id === albumId)
      if (idx !== -1) {
        albums.value[idx].trackCount++
        albums.value = [...albums.value]
      }
    }
    return result
  }

  const removeTrack = async (albumId: string, trackId: string) => {
    const result = await dbRemoveTrackFromAlbum(albumId, trackId)
    if (result.success) {
      const idx = albums.value.findIndex(a => a.id === albumId)
      if (idx !== -1) {
        albums.value[idx].trackCount = Math.max(0, albums.value[idx].trackCount - 1)
        albums.value = [...albums.value]
      }
    }
    return result
  }

  const reorderTracks = async (albumId: string, trackOrders: { track_id: string; position: number }[]) => {
    return await dbReorderAlbumTracks(albumId, trackOrders)
  }

  const uploadCover = async (albumId: string, file: File) => {
    const result = await dbUploadAlbumCover(albumId, file)
    if (result.success) {
      const idx = albums.value.findIndex(a => a.id === albumId)
      if (idx !== -1) {
        albums.value[idx].coverUrl = result.url!
        albums.value = [...albums.value]
      }
    }
    return result
  }

  return {
    albums,
    currentAlbum,
    loading,
    loadAllAlbums,
    loadUserAlbums,
    loadAlbumDetail,
    createAlbum,
    editAlbum,
    removeAlbum,
    addTrack,
    removeTrack,
    reorderTracks,
    uploadCover
  }
}
