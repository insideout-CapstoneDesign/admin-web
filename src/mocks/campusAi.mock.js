const mockCampusDetections = [
    {
        id: 'mock-gate-1',
        detectType: 'campus_gate',
        confidence: 0.95,
        label: '정문 게이트',
        ocrText: '정문',
        bboxPx: [200, 150, 100, 100],
        status: 'pending',
    },
    {
        id: 'mock-road-1',
        detectType: 'campus_road',
        confidence: 0.92,
        label: '중앙로',
        ocrText: null,
        bboxPx: [300, 400, 500, 100],
        status: 'pending',
    },
    {
        id: 'mock-footprint-1',
        detectType: 'building_footprint',
        confidence: 0.89,
        label: '본관 영역',
        ocrText: '본관',
        bboxPx: [400, 200, 200, 150],
        status: 'pending',
    },
    {
        id: 'mock-obstacle-1',
        detectType: 'obstacle',
        confidence: 0.87,
        label: '볼라드 장애물',
        ocrText: null,
        bboxPx: [1000, 600, 50, 50],
        status: 'pending',
    },
    {
        id: 'mock-poi-candidate-1',
        detectType: 'poi_candidate',
        confidence: 0.85,
        label: '학생회관 후보',
        ocrText: '학생회관',
        bboxPx: [1200, 300, 200, 150],
        status: 'pending',
    }
]

export function createMockCampusAiResult({
    campusMapId = 'mock-campus-map-id',
    width = 1600,
    height = 900,
    imageWidth,
    imageHeight,
} = {}) {
    const resolvedWidth = imageWidth || width
    const resolvedHeight = imageHeight || height
    const scaleX = resolvedWidth / width
    const scaleY = resolvedHeight / height

    const scaledDetections = mockCampusDetections.map((detection) => ({
        ...detection,
        bboxPx: Array.isArray(detection.bboxPx) && detection.bboxPx.length === 4
            ? [
                Math.round(detection.bboxPx[0] * scaleX),
                Math.round(detection.bboxPx[1] * scaleY),
                Math.round(detection.bboxPx[2] * scaleX),
                Math.round(detection.bboxPx[3] * scaleY),
            ]
            : detection.bboxPx,
    }))

    return {
        jobId: `mock-job-${campusMapId}`,
        campusMapId,
        status: 'succeeded',
        source: 'mock',
        imageWidth: resolvedWidth,
        imageHeight: resolvedHeight,
        detectionCount: scaledDetections.length,
        detections: scaledDetections,
    }
}
