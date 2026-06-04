import { handleSessionExpired, isUnauthorizedResponse } from '../utils/authSession'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'

async function parseJsonSafe(response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

async function requestApi(path, { method = 'GET', body = null, isMultipart = false } = {}) {
    const token = localStorage.getItem('accessToken')
    const headers = {}

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    if (!isMultipart) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: isMultipart ? body : body ? JSON.stringify(body) : null,
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

export async function createCampusApi(tenantId, campusData) {
    return requestApi(`/api/v1/campuses?tenantId=${tenantId}`, {
        method: 'POST',
        body: campusData,
    })
}

export async function updateCampusApi(tenantId, campusId, campusData) {
    return requestApi(`/api/v1/campuses/${campusId}?tenantId=${tenantId}`, {
        method: 'PUT',
        body: campusData,
    })
}

export async function getCampusesApi(tenantId) {
    return requestApi(`/api/v1/campuses?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function uploadCampusMapApi(tenantId, campusId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return requestApi(`/api/v1/campuses/${campusId}/maps?tenantId=${tenantId}`, {
        method: 'POST',
        body: formData,
        isMultipart: true,
    })
}

export async function getCampusByIdApi(tenantId, campusId) {
    return requestApi(`/api/v1/campuses/${campusId}?tenantId=${tenantId}`, {
        method: 'GET',
    })
}
