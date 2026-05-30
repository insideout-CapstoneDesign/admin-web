import { createMockCampusAiResult } from '../mocks/campusAi.mock'

const MOCK_DELAY_MS = 1200

function sleep(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms)
    })
}

function normalizeDetection(detection, index) {
    return {
        id: detection.id || `detection-${index + 1}`,
        detectType: detection.detectType || detection.detect_type || 'unknown',
        confidence: Number(detection.confidence ?? 0),
        label: detection.label || null,
        ocrText: detection.ocrText || detection.ocr_text || null,
        bboxPx: Array.isArray(detection.bboxPx)
            ? detection.bboxPx
            : Array.isArray(detection.bbox_px)
                ? detection.bbox_px
                : null,
        geomPx: detection.geomPx || detection.geom_px || null,
        status: detection.status || 'pending',
    }
}

function normalizeCampusAiResult(payload, fallbackMeta) {
    const data = payload?.result || payload
    const detections = Array.isArray(data?.detections)
        ? data.detections.map(normalizeDetection)
        : []

    return {
        jobId: data?.jobId || data?.job_id || `job-${fallbackMeta.campusMapId}`,
        campusMapId: data?.campusMapId || data?.campus_map_id || fallbackMeta.campusMapId,
        status: data?.status || 'succeeded',
        source: fallbackMeta.source,
        imageWidth: data?.imageWidth || data?.image_width || fallbackMeta.imageWidth,
        imageHeight: data?.imageHeight || data?.image_height || fallbackMeta.imageHeight,
        detectionCount: data?.detectionCount || data?.detection_count || detections.length,
        detections,
    }
}

export async function analyzeCampusMap({
    campusMapId,
    tenantId,
    imageWidth,
    imageHeight,
    allowMockFallback = true,
} = {}) {
    const baseUrl = import.meta.env.VITE_AI_API_BASE_URL?.trim() || import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'
    const useMock = import.meta.env.VITE_USE_MOCK_AI !== 'false'

    const fallbackMeta = {
        campusMapId: campusMapId || 'preview-only-campus-map',
        imageWidth,
        imageHeight,
        source: 'mock',
    }

    if (useMock || !baseUrl || !campusMapId) {
        await sleep(MOCK_DELAY_MS)
        return createMockCampusAiResult(fallbackMeta)
    }

    try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`${baseUrl}/api/v1/ai/campuses/${campusMapId}/analyze?tenantId=${tenantId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error(`AI analysis request failed with status ${response.status}`)
        }

        const payload = await response.json()
        return normalizeCampusAiResult(payload, {
            ...fallbackMeta,
            source: 'api',
        })
    } catch (error) {
        if (!allowMockFallback) {
            throw error
        }

        await sleep(400)
        return {
            ...createMockCampusAiResult(fallbackMeta),
            source: 'mock-fallback',
        }
    }
}

export async function getCampusDetections({
    campusMapId,
    tenantId,
    allowMockFallback = true,
} = {}) {
    const baseUrl = import.meta.env.VITE_AI_API_BASE_URL?.trim() || import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'
    const useMock = import.meta.env.VITE_USE_MOCK_AI !== 'false'

    if (useMock || !baseUrl || !campusMapId) {
        return createMockCampusAiResult({ campusMapId })
    }

    try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`${baseUrl}/api/v1/ai/campuses/${campusMapId}/detections?tenantId=${tenantId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch campus detections with status ${response.status}`)
        }

        const payload = await response.json()
        return normalizeCampusAiResult(payload, {
            campusMapId,
            source: 'api',
        })
    } catch (error) {
        if (!allowMockFallback) {
            throw error
        }
        return createMockCampusAiResult({ campusMapId })
    }
}
