const mockDetections = [
    {
        id: 'mock-wall-1',
        detectType: 'wall',
        confidence: 0.98,
        label: '복도 벽체',
        ocrText: null,
        bboxPx: [180, 120, 1100, 60],
        status: 'pending',
    },
    {
        id: 'mock-text-1',
        detectType: 'text',
        confidence: 0.91,
        label: '101호',
        ocrText: '101',
        bboxPx: [320, 280, 120, 60],
        status: 'pending',
    },
    {
        id: 'mock-poi-1',
        detectType: 'poi_candidate',
        confidence: 0.88,
        label: '엘리베이터',
        ocrText: null,
        bboxPx: [920, 360, 100, 100],
        status: 'pending',
    },
    {
        id: 'mock-door-1',
        detectType: 'door',
        confidence: 0.84,
        label: '출입문 후보',
        ocrText: null,
        bboxPx: [720, 240, 80, 80],
        status: 'pending',
    },
    {
        id: 'mock-restroom-1',
        detectType: 'restroom_sign',
        confidence: 0.86,
        label: '화장실',
        ocrText: 'WC',
        bboxPx: [1110, 540, 90, 80],
        status: 'pending',
    },
]

export function createMockAiAnalysisResult({
    floorplanId = 'mock-floorplan-id',
    width = 1600,
    height = 900,
    imageWidth,
    imageHeight,
    floorName = '도면',
} = {}) {
    const resolvedWidth = imageWidth || width
    const resolvedHeight = imageHeight || height

    return {
        jobId: `mock-job-${floorplanId}`,
        floorplanId,
        status: 'succeeded',
        source: 'mock',
        floorName,
        imageWidth: resolvedWidth,
        imageHeight: resolvedHeight,
        detectionCount: mockDetections.length,
        detections: mockDetections,
    }
}
