import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type UserRole = 'ADMIN' | 'SELLER'

interface UserResponse {
  id: number
  username: string
  role: UserRole
}

interface AuthResponse {
  user?: UserResponse
  bootstrapRequired?: boolean
}

interface BootstrapStatusResponse {
  setupRequired: boolean
}

const API_BASE = 'http://localhost:8080/api'

const readErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json()

    if (typeof data?.message === 'string') return data.message

    if (data && typeof data === 'object') {
      const firstValue = Object.values(data)[0]
      if (typeof firstValue === 'string' && firstValue.trim()) return firstValue
    }
  } catch {
    // ignore parse issues
  }

  return fallback
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserResponse | null>(null)
  const bootstrapRequired = ref(false)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  const fetchMe = async () => {
    const response = await fetch(`${API_BASE}/auth/me`)

    if (!response.ok) {
      user.value = null
      return
    }

    const data = (await response.json()) as AuthResponse
    user.value = data.user ?? null
    bootstrapRequired.value = Boolean(data.bootstrapRequired)
  }

  const init = async () => {
    if (initialized.value || loading.value) return

    loading.value = true

    try {
      const statusResponse = await fetch(`${API_BASE}/auth/bootstrap-status`)

      if (statusResponse.ok) {
        const statusData = (await statusResponse.json()) as BootstrapStatusResponse
        bootstrapRequired.value = Boolean(statusData.setupRequired)
      }

      if (bootstrapRequired.value) {
        user.value = null
      } else {
        await fetchMe()
      }
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Login failed'))
    }

    const data = (await response.json()) as AuthResponse
    user.value = data.user ?? null
    bootstrapRequired.value = Boolean(data.bootstrapRequired)
    initialized.value = true

    return data
  }

  const bootstrapAdmin = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/bootstrap-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Bootstrap admin failed'))
    }

    const data = (await response.json()) as AuthResponse
    user.value = data.user ?? null
    bootstrapRequired.value = false
    initialized.value = true

    return data
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
      })
    } finally {
      user.value = null
    }
  }

  const fetchUsers = async () => {
    const response = await fetch(`${API_BASE}/users`)

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to fetch users'))
    }

    return (await response.json()) as UserResponse[]
  }

  const createUser = async (payload: { username: string; password: string; role: UserRole }) => {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to create user'))
    }

    return (await response.json()) as UserResponse
  }

  return {
    user,
    bootstrapRequired,
    initialized,
    loading,
    isAuthenticated,
    isAdmin,
    init,
    login,
    bootstrapAdmin,
    logout,
    fetchMe,
    fetchUsers,
    createUser,
  }
})
