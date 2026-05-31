import { handleSessionExpired, isUnauthorizedResponse } from '../utils/authSession'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'

async function parseJsonSafe(response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

async function requestApi(path, { method = 'GET', body = null } = {}) {
    const token = localStorage.getItem('accessToken')
    const headers = {}

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    headers['Content-Type'] = 'application/json'

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    })

    const payload = await parseJsonSafe(response)
    const isSuccess = payload?.isSuccess

    if (isUnauthorizedResponse(response, payload)) {
        handleSessionExpired()
        throw new Error('로그인 세션이 만료되었습니다.')
    }

    if (!response.ok) {
        throw new Error(payload?.message || '요청 처리 중 오류가 발생했습니다.')
    }

    if (payload == null) {
        throw new Error('서버 응답을 해석할 수 없습니다.')
    }

    if (isSuccess === false) {
        throw new Error(payload?.message || '요청 처리 중 오류가 발생했습니다.')
    }

    return payload.result ?? payload
}

export async function getMyTenantsApi() {
    return requestApi('/api/v1/tenants/me', {
        method: 'GET',
    })
}

export async function createTenantApi(tenantData) {
    return requestApi('/api/v1/tenants/create', {
        method: 'POST',
        body: tenantData,
    })
}
