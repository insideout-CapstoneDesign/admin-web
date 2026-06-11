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

async function requestMultipartApi(path, formData) {
    const token = localStorage.getItem('accessToken')
    const headers = {}

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: formData,
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

export async function getBuildingsApi(tenantId) {
    return requestApi(`/api/v1/buildings?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function getBuildingByIdApi(tenantId, buildingId) {
    return requestApi(`/api/v1/buildings/${buildingId}?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function getMapEditorFloorApi(tenantId, buildingId, floorId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/floors/${floorId}?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function initializeBuildingDraftApi(tenantId, buildingId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/initialize-draft?tenantId=${tenantId}`, {
        method: 'POST',
    })
}

export async function saveMapEditorFloorDraftApi(tenantId, buildingId, floorId, draftData) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/floors/${floorId}/draft?tenantId=${tenantId}`, {
        method: 'PUT',
        body: draftData,
    })
}

export async function createBuildingApi(tenantId, buildingData) {
    return requestApi(`/api/v1/buildings?tenantId=${tenantId}`, {
        method: 'POST',
        body: buildingData,
    })
}

export async function uploadBuildingFloorplanApi(tenantId, buildingId, floorId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return requestMultipartApi(
        `/api/v1/buildings/${buildingId}/floors/${floorId}/floorplans?tenantId=${tenantId}`,
        formData
    )
}

export async function getBuildingEntrancesApi(tenantId, buildingId) {
    return requestApi(`/api/v1/buildings/${buildingId}/entrances?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function createBuildingEntranceApi(tenantId, buildingId, entranceData) {
    return requestApi(`/api/v1/buildings/${buildingId}/entrances?tenantId=${tenantId}`, {
        method: 'POST',
        body: entranceData,
    })
}

export async function mapBuildingEntranceApi(tenantId, buildingId, mappingData) {
    return requestApi(`/api/v1/buildings/${buildingId}/entrance-mappings?tenantId=${tenantId}`, {
        method: 'POST',
        body: mappingData,
    })
}

export async function addBuildingFloorApi(tenantId, buildingId, floorData) {
    return requestApi(`/api/v1/buildings/${buildingId}/floors?tenantId=${tenantId}`, {
        method: 'POST',
        body: floorData,
    })
}

export async function getVerticalConnectorsApi(tenantId, buildingId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/vertical-connectors?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function createVerticalConnectorApi(tenantId, buildingId, data) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/vertical-connectors?tenantId=${tenantId}`, {
        method: 'POST',
        body: data,
    })
}

export async function deleteVerticalConnectorApi(tenantId, buildingId, connectorId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/vertical-connectors/${connectorId}?tenantId=${tenantId}`, {
        method: 'DELETE',
    })
}

export async function mapVerticalConnectorNodeApi(tenantId, buildingId, connectorId, data) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/vertical-connectors/${connectorId}/nodes?tenantId=${tenantId}`, {
        method: 'POST',
        body: data,
    })
}

export async function unmapVerticalConnectorNodeApi(tenantId, buildingId, connectorId, floorId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/vertical-connectors/${connectorId}/floors/${floorId}?tenantId=${tenantId}`, {
        method: 'DELETE',
    })
}

export async function updateVerticalConnectorApi(tenantId, buildingId, connectorId, data) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/vertical-connectors/${connectorId}?tenantId=${tenantId}`, {
        method: 'PATCH',
        body: data,
    })
}

export async function getBuildingDraftPoisApi(tenantId, buildingId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/draft-pois?tenantId=${tenantId}`, {
        method: 'GET',
    })
}

export async function saveBuildingPoiMappingsApi(tenantId, buildingId, data) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/poi-mappings?tenantId=${tenantId}`, {
        method: 'PUT',
        body: data,
    })
}

export async function publishBuildingDraftApi(tenantId, buildingId) {
    return requestApi(`/api/v1/map-editor/buildings/${buildingId}/publish?tenantId=${tenantId}`, {
        method: 'POST',
    })
}

export async function deactivateBuildingApi(tenantId, buildingId) {
    return requestApi(`/api/v1/buildings/${buildingId}/deactivate?tenantId=${tenantId}`, {
        method: 'POST',
    })
}

export async function activateBuildingApi(tenantId, buildingId) {
    return requestApi(`/api/v1/buildings/${buildingId}/activate?tenantId=${tenantId}`, {
        method: 'POST',
    })
}

export async function searchPlacesApi(query, options = {}) {
    const q = (query || '').trim()
    if (!q) {
        return []
    }

    const params = new URLSearchParams()
    params.set('q', q)

    if (options.lat != null) params.set('lat', String(options.lat))
    if (options.lng != null) params.set('lng', String(options.lng))
    if (options.radius != null) params.set('radius', String(options.radius))
    if (options.size != null) params.set('size', String(options.size))

    return requestApi(`/api/v1/places/search?${params.toString()}`, {
        method: 'GET',
    })
}
