import { createMockAiAnalysisResult } from '../mocks/aiAnalysis.mock'

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

function normalizeAiAnalysisResult(payload, fallbackMeta) {
    const data = payload?.result || payload
    const detections = Array.isArray(data?.detections)
        ? data.detections.map(normalizeDetection)
        : []

    return {
        jobId: data?.jobId || data?.job_id || `job-${fallbackMeta.floorplanId}`,
        floorplanId: data?.floorplanId || data?.floorplan_id || fallbackMeta.floorplanId,
        status: data?.status || 'succeeded',
        source: fallbackMeta.source,
        floorName: fallbackMeta.floorName,
        imageWidth: data?.imageWidth || data?.image_width || fallbackMeta.imageWidth,
        imageHeight: data?.imageHeight || data?.image_height || fallbackMeta.imageHeight,
        detectionCount: data?.detectionCount || data?.detection_count || detections.length,
        detections,
    }
}

export async function analyzeFloorplan({
    floorplanId,
    floorName,
    imageWidth,
    imageHeight,
    allowMockFallback = true,
} = {}) {
    const baseUrl = import.meta.env.VITE_AI_API_BASE_URL?.trim()
    const useMock = import.meta.env.VITE_USE_MOCK_AI !== 'false'

    const fallbackMeta = {
        floorplanId: floorplanId || 'preview-only-floorplan',
        floorName: floorName || '도면',
        imageWidth,
        imageHeight,
        source: 'mock',
    }

    if (useMock || !baseUrl || !floorplanId) {
        await sleep(MOCK_DELAY_MS)
        return createMockAiAnalysisResult(fallbackMeta)
    }

    try {
        const response = await fetch(`${baseUrl}/api/ai/floorplans/${floorplanId}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`AI analysis request failed with status ${response.status}`)
        }

        const payload = await response.json()
        return normalizeAiAnalysisResult(payload, {
            ...fallbackMeta,
            source: 'api',
        })
    } catch (error) {
        if (!allowMockFallback) {
            throw error
        }

        await sleep(400)
        return {
            ...createMockAiAnalysisResult(fallbackMeta),
            source: 'mock-fallback',
        }
    }
}
