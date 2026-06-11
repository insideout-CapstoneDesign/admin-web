import { useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Button from '../Button/Button'
import { analyzeFloorplan, getFloorplanDetections } from '../../services/aiAnalysis'
import { uploadCampusMapApi } from '../../api/campusApi'
import { uploadBuildingFloorplanApi } from '../../api/buildingApi'
import { analyzeCampusMap, getCampusDetections } from '../../services/campusAi'
import CalibrationModal from '../Modal/CalibrationModal'



const DETECTION_TYPE_META = {
    // Floorplan types
    wall: { label: '벽', color: '#111827', bg: 'rgba(17, 24, 39, 0)' },
    corridor: { label: '통행 구역', color: '#15803d', bg: 'rgba(34, 197, 94, 0.05)' },
    room: { label: '공간', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.06)' },
    text: { label: '텍스트', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
    poi_candidate: { label: 'POI 후보', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
    node: { label: '노드', color: '#166534', bg: 'rgba(22, 101, 52, 0.16)' },
    edge: { label: '엣지', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.12)' },
    door: { label: '문', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.16)' },
    restroom_sign: { label: '화장실', color: '#db2777', bg: 'rgba(219, 39, 119, 0.16)' },
    elevator: { label: '엘리베이터', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.16)' },
    stair: { label: '계단', color: '#65a30d', bg: 'rgba(101, 163, 13, 0.16)' },
    escalator: { label: '에스컬레이터', color: '#b45309', bg: 'rgba(180, 83, 9, 0.16)' },
    entrance: { label: '출입구', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.16)' },
    unknown: { label: '미분류', color: '#475569', bg: 'rgba(71, 85, 105, 0.16)' },

    // Campus map types
    campus_gate: { label: '정문 게이트', color: '#b91c1c', bg: 'rgba(185, 28, 28, 0.16)' },
    campus_road: { label: '도로', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.16)' },
    building_footprint: { label: '건물 영역', color: '#0f766e', bg: 'rgba(15, 118, 110, 0.16)' },
    obstacle: { label: '장애물', color: '#b45309', bg: 'rgba(180, 83, 9, 0.16)' },
    node_candidate: { label: '노드 후보', color: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.16)' },
    edge_candidate: { label: '엣지 후보', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.16)' },
}

const ViewContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;

    @media (max-width: 980px) {
        flex-direction: column;
        align-items: stretch;
    }
`

const HeaderCopy = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 760px;
`

const Title = styled.h2`
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 700;
    color: var(--black-900);
    margin: 0;
`

const ActionRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
`

const ToggleChip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.25)' : 'var(--gray-200)')};
    background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.10)' : 'var(--white)')};
    color: ${({ $active }) => ($active ? '#1d4ed8' : 'var(--gray-600)')};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
`

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    background: ${({ $tone }) => {
        if ($tone === 'api') return 'rgba(5, 150, 105, 0.12)'
        if ($tone === 'mock-fallback') return 'rgba(234, 88, 12, 0.12)'
        return 'rgba(37, 99, 235, 0.12)'
    }};
    color: ${({ $tone }) => {
        if ($tone === 'api') return '#047857'
        if ($tone === 'mock-fallback') return '#c2410c'
        return '#1d4ed8'
    }};
    font-size: 12px;
    font-weight: 700;
`

const ContentLayout = styled.div`
    display: block;
`

const UploadZone = styled.div`
    min-height: 540px;
    border: 2px dashed ${({ $isDragging }) => ($isDragging ? 'var(--blue-500)' : 'var(--gray-300)')};
    border-radius: var(--radius-12);
    background-color: ${({ $isDragging }) => ($isDragging ? '#eff6ff' : 'var(--gray-50)')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 16px;

    &:hover {
        border-color: var(--blue-400);
        background-color: #f8fafc;
    }
`

const HiddenInput = styled.input`
    display: none;
`

const EmptyStateContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--gray-500);
`

const UploadIcon = styled.svg`
    width: 48px;
    height: 48px;
    color: var(--gray-400);
`

const PreviewContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`

const ImageStage = styled.div`
    width: min(100%, 980px);
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const ImageCanvas = styled.div`
    position: relative;
    display: inline-block;
    align-self: center;
    width: fit-content;
    max-width: 100%;
    overflow: hidden;
    border-radius: var(--radius-12);
    background: var(--white);
    line-height: 0;
`

const PreviewImage = styled.img`
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 68vh;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.18);
`

const DetectionLayer = styled.div`
    position: absolute;
    inset: 0;
    overflow: hidden;
`

const DetectionSvg = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`

const DetectionTag = styled.button`
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
    color: var(--white);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    max-width: min(240px, calc(100% - 16px));
    overflow: hidden;
    text-overflow: ellipsis;
    border: none;
    pointer-events: auto;
    cursor: pointer;
    box-shadow: 0 10px 18px -12px rgba(15, 23, 42, 0.42);
`

const PreviewFooter = styled.div`
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-12);
    background: var(--white);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--gray-200);
    box-shadow: 0 10px 18px -12px rgba(15, 23, 42, 0.18);

    @media (max-width: 760px) {
        flex-direction: column;
        align-items: stretch;
    }
`

const FileInfo = styled.div`
    color: var(--black-900);
    font-family: var(--font-sans);

    .name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
    }

    .size {
        font-size: 13px;
        color: var(--gray-500);
    }
`

const OverlayActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`

const CalibrationBanner = styled.div`
    background-color: ${({ $isCalibrated }) => ($isCalibrated ? '#f0fdf4' : '#fffbeb')};
    border: 1px solid ${({ $isCalibrated }) => ($isCalibrated ? '#bbf7d0' : '#fef3c7')};
    border-radius: var(--radius-8, 8px);
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin-bottom: 8px;
    font-family: var(--font-sans);
    animation: bannerFade 0.25s ease-out;

    @keyframes bannerFade {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .message {
        display: flex;
        align-items: center;
        gap: 8px;
        color: ${({ $isCalibrated }) => ($isCalibrated ? '#15803d' : '#b45309')};
        font-size: 13.5px;
        font-weight: 500;
        line-height: 1.4;
    }

    .warning-icon {
        color: ${({ $isCalibrated }) => ($isCalibrated ? '#16a34a' : '#d97706')};
        flex-shrink: 0;
    }

    @media (max-width: 760px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
`

const SidebarSection = styled.div`
    border-top: 1px solid var(--gray-200);
    padding-top: 16px;
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const ServiceToggleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const ToggleLabel = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: var(--black-900);
`

const Switch = styled.label`
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    
    input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    span {
        position: absolute;
        cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${({ $checked }) => ($checked ? '#10b981' : '#cbd5e1')};
        transition: .3s;
        border-radius: 24px;
        opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
    }
    
    span:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        transform: ${({ $checked }) => ($checked ? 'translateX(20px)' : 'none')};
    }
`

const HelperText = styled.p`
    margin: 0;
    font-size: 12px;
    color: ${({ $error }) => ($error ? '#ef4444' : 'var(--gray-500)')};
    line-height: 1.55;
`


const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`

const LoadingOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.92);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 10;
`

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid var(--gray-200);
    border-top-color: var(--blue-500);
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`

const LoadingText = styled.div`
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 600;
    color: var(--black-900);
    text-align: center;

    .sub {
        font-size: 14px;
        color: var(--gray-500);
        margin-top: 8px;
        font-weight: 400;
    }
`

const TypeSummaryList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

const TypeSummaryBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 999px;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    font-size: 12px;
    font-weight: 700;
`

const OverlayLegend = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
`

const EmptyResult = styled.div`
    border: 1px dashed var(--gray-200);
    border-radius: var(--radius-12);
    background: var(--gray-50);
    padding: 18px;
    color: var(--gray-500);
    font-size: 13px;
    line-height: 1.55;
`

function getTypeMeta(type) {
    return DETECTION_TYPE_META[type] || DETECTION_TYPE_META.unknown
}

function hasValidBoundingBox(detection) {
    return Array.isArray(detection?.bboxPx) && detection.bboxPx.length === 4
}

function getDetectionLabel(detection, meta) {
    return detection.label || detection.ocrText || meta.label
}

function shouldShowPersistentLabel(detection, shape) {
    const type = detection.detectType || 'unknown'

    if (
        type === 'text' ||
        type === 'poi_candidate' ||
        type === 'node_candidate' ||
        type === 'edge_candidate' ||
        type === 'node' ||
        type === 'edge'
    ) {
        return true
    }

    return shape.kind === 'point'
}

function getBadgeAnchor(detection) {
    const geometry = detection.geomPx
    if (!geometry) {
        if (hasValidBoundingBox(detection)) {
            const [x, y, width, height] = detection.bboxPx
            return {
                x: x + (width / 2),
                y: y + (height / 2),
            }
        }

        return null
    }

    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
        const [x, y] = geometry.coordinates
        return { x, y }
    }

    if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0) {
        const middleIndex = Math.floor(geometry.coordinates.length / 2)
        const [x, y] = geometry.coordinates[middleIndex]
        return { x, y }
    }

    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates?.[0]) && geometry.coordinates[0].length > 0) {
        const ring = geometry.coordinates[0]
        const validPoints = ring.slice(0, -1)
        if (!validPoints.length) {
            return null
        }

        const { x, y } = validPoints.reduce(
            (accumulator, [px, py]) => ({
                x: accumulator.x + px,
                y: accumulator.y + py,
            }),
            { x: 0, y: 0 }
        )

        return {
            x: x / validPoints.length,
            y: y / validPoints.length,
        }
    }

    if (hasValidBoundingBox(detection)) {
        const [x, y, width, height] = detection.bboxPx
        return {
            x: x + (width / 2),
            y: y + (height / 2),
        }
    }

    return null
}

function ringsToSvgPath(rings) {
    return rings
        .filter((ring) => Array.isArray(ring) && ring.length > 1)
        .map((ring) => {
            const [first, ...rest] = ring
            const segments = rest.map((point) => `L ${point[0]} ${point[1]}`).join(' ')
            return `M ${first[0]} ${first[1]} ${segments} Z`
        })
        .join(' ')
}

function createOverlayShape(detection, meta) {
    const geometry = detection.geomPx

    if (geometry?.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
        const path = ringsToSvgPath(geometry.coordinates)
        if (!path) {
            return null
        }

        return {
            kind: 'polygon',
            path,
            meta,
            detection,
        }
    }

    if (geometry?.type === 'LineString' && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 1) {
        return {
            kind: 'line',
            points: geometry.coordinates.map((point) => point.join(',')).join(' '),
            meta,
            detection,
        }
    }

    if (geometry?.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2) {
        return {
            kind: 'point',
            cx: geometry.coordinates[0],
            cy: geometry.coordinates[1],
            meta,
            detection,
        }
    }

    if (hasValidBoundingBox(detection)) {
        const [x, y, width, height] = detection.bboxPx
        return {
            kind: 'bbox',
            x,
            y,
            width,
            height,
            meta,
            detection,
        }
    }

    return null
}

function getOverlayRenderPriority(shape) {
    const type = shape?.detection?.detectType || 'unknown'

    if (type === 'room') return 10
    if (type === 'corridor') return 20
    if (type === 'door') return 24
    if (type === 'poi_candidate') return 26
    if (type === 'edge') return 27
    if (type === 'elevator' || type === 'stair' || type === 'escalator' || type === 'restroom_sign') return 28
    if (type === 'node') return 29
    if (type === 'wall') return 40

    if (shape?.kind === 'line') return 34
    if (shape?.kind === 'point') return 36
    if (shape?.kind === 'bbox') return 18

    return 30
}

function extractDisplayFileName(rawValue, fallbackName) {
    if (!rawValue) {
        return fallbackName
    }

    const withoutQuery = String(rawValue).split('?')[0]
    const normalized = withoutQuery.replace(/\/+$/, '')
    const candidate = normalized.split('/').pop()

    if (!candidate) {
        return fallbackName
    }

    try {
        return decodeURIComponent(candidate)
    } catch {
        return candidate
    }
}

function readImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const image = new window.Image()
        const objectUrl = URL.createObjectURL(file)

        image.onload = () => {
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight,
            })
            URL.revokeObjectURL(objectUrl)
        }

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('이미지 크기를 불러오지 못했습니다.'))
        }

        image.src = objectUrl
    })
}

function readImageDimensionsFromUrl(src) {
    return new Promise((resolve, reject) => {
        const image = new window.Image()

        image.onload = () => {
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight,
            })
        }

        image.onerror = () => {
            reject(new Error('이미지 크기를 불러오지 못했습니다.'))
        }

        image.src = src
    })
}

export default function FloorplanUploadView({
    floorName,
    floorplanId = null,
    buildingId = null,
    floorId = null,
    isCampus = false,
    campusId = null,
    campusMapId = null,
    imageUrl = null,
    tenantId = null,
    campus = null,
    onFloorplanUploaded = null,
    onAnalysisCompleted = null,
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(campus?.currentMapImageUrl || imageUrl || null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileInfo, setFileInfo] = useState(null)
    const [imageDimensions, setImageDimensions] = useState(null)
    const [status, setStatus] = useState('idle')
    const [analysisResult, setAnalysisResult] = useState(null)
    const [analysisError, setAnalysisError] = useState('')
    const [selectedDetectionId, setSelectedDetectionId] = useState(null)
    const [activeCampusMapId, setActiveCampusMapId] = useState(campusMapId)
    const [activeFloorplanId, setActiveFloorplanId] = useState(floorplanId)
    const [visibleDetectionTypes, setVisibleDetectionTypes] = useState({})
    const [expandedDetectionTypes, setExpandedDetectionTypes] = useState({})
    const [showOverlay, setShowOverlay] = useState(true)
    const [showTextLabels, setShowTextLabels] = useState(true)


    const inputRef = useRef(null)

    const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false)
    const [calibrationMapping, setCalibrationMapping] = useState(() => {
        const key = isCampus ? `calibration_${campusId}` : `calibration_floor_${floorplanId}`
        try {
            const saved = localStorage.getItem(key)
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })
    const [isServiceActive, setIsServiceActive] = useState(() => {
        const key = isCampus ? `service_active_${campusId}` : `service_active_floor_${floorplanId}`
        return localStorage.getItem(key) === 'true'
    })

    useEffect(() => {
        setActiveFloorplanId(floorplanId)
    }, [floorplanId])

    useEffect(() => {
        const key = isCampus ? `calibration_${campusId}` : `calibration_floor_${activeFloorplanId}`
        if (campusId || activeFloorplanId) {
            localStorage.setItem(key, JSON.stringify(calibrationMapping))
        }
    }, [calibrationMapping, isCampus, campusId, activeFloorplanId])

    useEffect(() => {
        const key = isCampus ? `service_active_${campusId}` : `service_active_floor_${activeFloorplanId}`
        if (campusId || activeFloorplanId) {
            localStorage.setItem(key, isServiceActive ? 'true' : 'false')
        }
    }, [isServiceActive, isCampus, campusId, activeFloorplanId])

    useEffect(() => {
        if (!selectedFile && previewUrl) {
            setStatus('preview')
            setFileInfo((current) => current || {
                name: extractDisplayFileName(previewUrl, isCampus ? 'campus_map.png' : 'floorplan.png'),
                size: '기존 업로드됨',
                resolution: imageDimensions ? `${imageDimensions.width} x ${imageDimensions.height}` : '해상도 확인 중',
            })
        }
    }, [selectedFile, previewUrl, imageDimensions, isCampus])

    useEffect(() => {
        return () => {
            if (previewUrl && String(previewUrl).startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const analysisDetections = useMemo(
        () => analysisResult?.detections || [],
        [analysisResult?.detections]
    )

    useEffect(() => {
        const nextTypes = [...new Set(analysisDetections.map((detection) => detection.detectType || 'unknown'))]

        if (nextTypes.length === 0) {
            setVisibleDetectionTypes((current) => (Object.keys(current).length === 0 ? current : {}))
            setExpandedDetectionTypes((current) => (Object.keys(current).length === 0 ? current : {}))
            return
        }

        const nextVisibleState = nextTypes.reduce((accumulator, type) => {
            accumulator[type] = true
            return accumulator
        }, {})

        const nextExpandedState = nextTypes.reduce((accumulator, type) => {
            accumulator[type] = true
            return accumulator
        }, {})

        setVisibleDetectionTypes(nextVisibleState)
        setExpandedDetectionTypes(nextExpandedState)
    }, [analysisDetections])

    const actualGates = useMemo(() => {
        if (!isCampus || !campus) return []
        if (Array.isArray(campus.gates) && campus.gates.length > 0) {
            return campus.gates.map((gate, index) => ({
                id: gate.id || `gate-${index + 1}`,
                name: gate.name || `Gate ${index + 1}`,
                location: gate.location
                    ? `POINT(${gate.location.longitude} ${gate.location.latitude})`
                    : 'POINT(WGS84)',
            }))
        }

        const primaryEntranceName = campus.primaryEntranceName || campus.primary_entrance_name || '대표 출입구'
        const primaryEntranceGeom = campus.primaryEntrance || campus.primary_entrance

        let coordsString = 'POINT(WGS84)'
        if (primaryEntranceGeom) {
            if (typeof primaryEntranceGeom === 'string') {
                coordsString = primaryEntranceGeom
            } else if (primaryEntranceGeom.coordinates) {
                coordsString = `POINT(${primaryEntranceGeom.coordinates[0]} ${primaryEntranceGeom.coordinates[1]})`
            } else if (primaryEntranceGeom.x && primaryEntranceGeom.y) {
                coordsString = `POINT(${primaryEntranceGeom.x} ${primaryEntranceGeom.y})`
            }
        }

        return [{
            id: 'primary-gate',
            name: primaryEntranceName,
            location: coordsString,
        }]
    }, [isCampus, campus])

    const detectedEntrances = useMemo(() => {
        if (!analysisResult?.detections) return []
        return analysisResult.detections.filter(d => 
            d.detectType === 'entrance' || 
            d.detectType === 'campus_gate' ||
            d.detectType === 'poi_candidate' ||
            d.detectType === 'node_candidate'
        )
    }, [analysisResult])

    const isCalibrated = useMemo(() => {
        if (actualGates.length === 0) return false
        // 매핑된 AI 검출 출입구가 현재 화면에 실제로 로드된 목록에 존재할 때만 완료로 판정합니다.
        return actualGates.every(gate => {
            const mappedId = calibrationMapping[gate.id]
            if (!mappedId) return false
            return detectedEntrances.some(det => det.id === mappedId)
        })
    }, [actualGates, calibrationMapping, detectedEntrances])

    useEffect(() => {
        if (!isCalibrated && isServiceActive) {
            setIsServiceActive(false)
        }
    }, [isCalibrated, isServiceActive])

    useEffect(() => {
        let isMounted = true
        
        const loadExistingDetections = async () => {
            if (!tenantId) return
            
            try {
                let result = null
                if (isCampus && activeCampusMapId && !String(activeCampusMapId).startsWith('mock-')) {
                    result = await getCampusDetections({ campusMapId: activeCampusMapId, tenantId })
                } else if (!isCampus && activeFloorplanId && !String(activeFloorplanId).startsWith('mock-')) {
                    result = await getFloorplanDetections({ floorplanId: activeFloorplanId, tenantId, floorName })
                }
                
                if (isMounted && result) {
                    setAnalysisResult(result)
                    if (!isCampus && typeof onAnalysisCompleted === 'function' && activeFloorplanId) {
                        onAnalysisCompleted(activeFloorplanId)
                    }
                    
                    const currentImgUrl = isCampus ? campus?.currentMapImageUrl : imageUrl
                    if (currentImgUrl) {
                        let resolvedDimensions = null
                        if (result.imageWidth && result.imageHeight) {
                            resolvedDimensions = {
                                width: result.imageWidth,
                                height: result.imageHeight,
                            }
                        } else {
                            try {
                                resolvedDimensions = await readImageDimensionsFromUrl(currentImgUrl)
                            } catch (dimensionErr) {
                                console.warn('기존 도면 해상도 로드 실패:', dimensionErr)
                            }
                        }

                        setPreviewUrl(currentImgUrl)
                        setImageDimensions(resolvedDimensions)
                        setFileInfo({
                            name: extractDisplayFileName(currentImgUrl, isCampus ? 'campus_map.png' : 'floorplan.png'),
                            size: '기존 업로드됨',
                            resolution: resolvedDimensions
                                ? `${resolvedDimensions.width} x ${resolvedDimensions.height}`
                                : '해상도 확인 중',
                        })
                        setStatus('preview')
                    }
                }
            } catch (err) {
                console.error("기존 AI 분석 결과 로드 실패:", err)
            }
        }
        
        loadExistingDetections()
        
        return () => {
            isMounted = false
        }
    }, [isCampus, activeCampusMapId, activeFloorplanId, tenantId, floorName, campus, imageUrl])



    const detectionGroups = useMemo(() => {
        if (analysisDetections.length === 0) {
            return []
        }

        const grouped = analysisDetections.reduce((accumulator, detection) => {
            const type = detection.detectType || 'unknown'
            if (!accumulator[type]) {
                accumulator[type] = []
            }
            accumulator[type].push(detection)
            return accumulator
        }, {})

        return Object.entries(grouped).sort((left, right) => {
            if (right[1].length !== left[1].length) {
                return right[1].length - left[1].length
            }

            return getTypeMeta(left[0]).label.localeCompare(getTypeMeta(right[0]).label, 'ko')
        })
    }, [analysisDetections])

    const visibleOverlayDetections = useMemo(
        () => analysisDetections.filter((detection) => visibleDetectionTypes[detection.detectType] !== false),
        [analysisDetections, visibleDetectionTypes]
    )

    const overlayDetections = useMemo(() => {
        if (!showOverlay || !visibleOverlayDetections.length) {
            return []
        }

        return visibleOverlayDetections
            .map((detection) => {
                const meta = getTypeMeta(detection.detectType)
                return createOverlayShape(detection, meta)
            })
            .filter(Boolean)
            .sort((left, right) => getOverlayRenderPriority(left) - getOverlayRenderPriority(right))
    }, [visibleOverlayDetections, showOverlay])

    const textLabelDetections = useMemo(() => {
        if (!showOverlay || !showTextLabels || visibleDetectionTypes.text === false) {
            return []
        }

        return analysisDetections
            .filter((detection) => detection.detectType === 'text' && hasValidBoundingBox(detection))
            .map((detection) => {
                const [x, y, width, height] = detection.bboxPx
                const label = detection.ocrText || detection.label || getTypeMeta(detection.detectType).label
                const meta = getTypeMeta(detection.detectType)
                const labelWidth = Math.max(88, label.length * 16 + 34)
                const centeredX = x + (width / 2)
                const clampedCenterX = imageDimensions
                    ? Math.min(
                        Math.max(centeredX, (labelWidth / 2) + 8),
                        imageDimensions.width - (labelWidth / 2) - 8
                    )
                    : centeredX

                return {
                    detection,
                    meta,
                    label,
                    width: labelWidth,
                    centerX: clampedCenterX,
                    centerY: y + (height / 2),
                }
            })
    }, [analysisDetections, imageDimensions, showOverlay, showTextLabels, visibleDetectionTypes])

    const toggleDetectionTypeVisibility = (type) => {
        setVisibleDetectionTypes((current) => ({
            ...current,
            [type]: current[type] === false,
        }))
    }

    const toggleDetectionGroup = (type) => {
        setExpandedDetectionTypes((current) => ({
            ...current,
            [type]: current[type] === false,
        }))
    }

    const handleDragOver = (event) => {
        event.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const resetAnalysisState = () => {
        setAnalysisResult(null)
        setAnalysisError('')
        setSelectedDetectionId(null)
    }


    const handleFileSelect = async (file) => {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
        }

        try {
            const nextDimensions = await readImageDimensions(file)
            let nextPreviewUrl = URL.createObjectURL(file)
            let uploadedMapId = null

            if (isCampus && campusId && tenantId) {
                setStatus('processing')
                try {
                    const campusMapData = await uploadCampusMapApi(tenantId, campusId, file)
                    uploadedMapId = campusMapData.id
                    // 백엔드가 s3:// 형식의 URL을 반환하는 경우 브라우저 렌더링이 실패하므로, 
                    // 로컬 Object URL(blob)인 nextPreviewUrl을 유지합니다.
                    if (campusMapData.imageUrl && !campusMapData.imageUrl.startsWith('s3://')) {
                        nextPreviewUrl = campusMapData.imageUrl
                    }
                } catch (uploadErr) {
                    alert('캠퍼스 도면 업로드 실패: ' + uploadErr.message)
                    setStatus('idle')
                    return
                }
            } else if (!isCampus && tenantId && buildingId && floorId) {
                setStatus('processing')
                try {
                    const floorplanData = await uploadBuildingFloorplanApi(tenantId, buildingId, floorId, file)
                    setActiveFloorplanId(floorplanData.id)
                    if (floorplanData.imageUrl && !floorplanData.imageUrl.startsWith('s3://')) {
                        nextPreviewUrl = floorplanData.imageUrl
                    }
                    if (typeof onFloorplanUploaded === 'function') {
                        onFloorplanUploaded(floorplanData)
                    }
                } catch (uploadErr) {
                    alert('층 도면 업로드 실패: ' + uploadErr.message)
                    setStatus('idle')
                    return
                }
            }

            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl)
            }

            setSelectedFile(file)
            setPreviewUrl(nextPreviewUrl)
            setActiveCampusMapId(uploadedMapId)
            setImageDimensions(nextDimensions)
            setFileInfo({
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                resolution: `${nextDimensions.width} x ${nextDimensions.height}`,
            })
            resetAnalysisState()
            setStatus('preview')
        } catch (error) {
            alert(error.message)
            setStatus('idle')
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        setIsDragging(false)

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileSelect(event.dataTransfer.files[0])
        }
    }

    const handleAiRequest = async () => {
        if (!isCampus && !activeFloorplanId) {
            alert('먼저 이 층의 도면을 업로드해주세요.')
            return
        }

        if (isCampus && !selectedFile && !activeCampusMapId) {
            return
        }

        setStatus('processing')
        setAnalysisError('')

        try {
            let result
            if (isCampus) {
                result = await analyzeCampusMap({
                    campusMapId: activeCampusMapId,
                    tenantId,
                    imageWidth: imageDimensions?.width,
                    imageHeight: imageDimensions?.height,
                })
            } else {
                result = await analyzeFloorplan({
                    floorplanId: activeFloorplanId,
                    floorName,
                    tenantId,
                    imageWidth: imageDimensions?.width,
                    imageHeight: imageDimensions?.height,
                })
            }

            setAnalysisResult(result)
            setSelectedDetectionId(result.detections[0]?.id || null)
            if (!isCampus && typeof onAnalysisCompleted === 'function' && activeFloorplanId) {
                onAnalysisCompleted(activeFloorplanId)
            }
            setStatus('preview')
        } catch (error) {
            setStatus('preview')
            setAnalysisError('AI 분석 요청에 실패했습니다. 백엔드 연결 상태를 확인해주세요: ' + error.message)
        }
    }

    const triggerFileSelect = () => {
        if (status === 'processing') return
        inputRef.current?.click()
    }

    const handleCalibrationClick = (event) => {
        event.stopPropagation()
        setIsCalibrationModalOpen(true)
    }

    const activeSourceTone = analysisResult?.source || 'mock'
    const activeFloorLabel = floorName ? `${floorName} 도면` : '도면'
    const summaryTargetName = isCampus ? (campus?.name || '캠퍼스 맵') : (floorName || '미지정')

    return (
        <ViewContainer>
            <Header>
                <HeaderCopy>
                    <Title>도면 업로드</Title>
                </HeaderCopy>

                <ActionRow>
                    {analysisResult && (
                        <>
                            <ToggleChip
                                type="button"
                                $active={showOverlay}
                                onClick={() => setShowOverlay((current) => !current)}
                            >
                                {showOverlay ? '오버레이 보기' : '오버레이 숨기기'}
                            </ToggleChip>
                            <ToggleChip
                                type="button"
                                $active={showTextLabels}
                                onClick={() => setShowTextLabels((current) => !current)}
                            >
                                {showTextLabels ? '텍스트 보기' : '텍스트 숨기기'}
                            </ToggleChip>
                        </>
                    )}
                    {status === 'preview' && (
                        <>
                            <Button variant="primary" onClick={handleAiRequest} disabled={isCampus ? !activeCampusMapId : !activeFloorplanId}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                                AI 도면 분석 요청
                            </Button>
                        </>
                    )}
                </ActionRow>
            </Header>

            {previewUrl && actualGates.length > 0 && (
                <CalibrationBanner $isCalibrated={isCalibrated}>
                    <div className="message">
                        {isCalibrated ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#16a34a' }}>
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>
                                    <strong>지리 정보 정합(Calibration) 완료:</strong> 실제 지도 출입구와 도면의 실내 출입구 간의 보정이 정상 적용되었습니다. 길찾기를 활성화할 수 있습니다.
                                </span>
                            </>
                        ) : (
                            <>
                                <svg className="warning-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <span>
                                    <strong>지리 정보 정합(Calibration) 미완료:</strong> 실내외 연동 길찾기를 위해, 실제 지도 상의 출입구와 도면 내 출입구 위치의 1:1 보정이 필요합니다.
                                </span>
                            </>
                        )}
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleCalibrationClick} 
                        style={{ 
                            flexShrink: 0, 
                            border: isCalibrated ? '1px solid #16a34a' : '1px solid #d97706', 
                            color: isCalibrated ? '#15803d' : '#b45309', 
                            background: isCalibrated ? '#f0fdf4' : '#fffbeb' 
                        }}
                    >
                        {isCalibrated ? '정합(Calibration) 재설정' : '정합(Calibration) 설정'}
                    </Button>
                </CalibrationBanner>
            )}


            <ContentLayout>
                {analysisResult && detectionGroups.length > 0 && (
                    <OverlayLegend>
                        {detectionGroups.map(([type, detections]) => {
                            const meta = getTypeMeta(type)
                            const isVisible = visibleDetectionTypes[type] !== false

                            return (
                                <TypeSummaryBadge
                                    key={type}
                                    as="button"
                                    type="button"
                                    $bg={isVisible ? meta.bg : 'var(--gray-100)'}
                                    $color={isVisible ? meta.color : 'var(--gray-500)'}
                                    style={{
                                        border: '1px solid rgba(148, 163, 184, 0.24)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => toggleDetectionTypeVisibility(type)}
                                >
                                    <span>{meta.label}</span>
                                    <span>{detections.length}</span>
                                </TypeSummaryBadge>
                            )
                        })}
                    </OverlayLegend>
                )}

                {analysisError && <EmptyResult style={{ marginBottom: '12px' }}>{analysisError}</EmptyResult>}

                {!analysisError && !analysisResult && (
                    <EmptyResult style={{ marginBottom: '12px' }}>
                        도면을 업로드하고 AI 분석을 요청하면, 검출 결과가 도면 위에 바로 그려집니다.
                    </EmptyResult>
                )}

                <UploadZone
                    $isDragging={isDragging}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                >
                    <HiddenInput
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            if (event.target.files && event.target.files[0]) {
                                handleFileSelect(event.target.files[0])
                            }
                        }}
                    />

                    {status === 'idle' && (
                        <EmptyStateContent>
                            <UploadIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </UploadIcon>
                            <div style={{ textAlign: 'center', lineHeight: '1.6' }}>
                                <strong>클릭하거나 이미지를 여기로 드래그하세요.</strong><br />
                                <span style={{ fontSize: '14px' }}>PNG, JPG 최대 10MB</span>
                            </div>
                        </EmptyStateContent>
                    )}

                    {status !== 'idle' && previewUrl && (
                        <PreviewContainer>
                            <ImageStage onClick={(event) => event.stopPropagation()}>
                                <ImageCanvas>
                                    <PreviewImage
                                        src={previewUrl}
                                        alt={`${activeFloorLabel} 미리보기`}
                                        onLoad={(event) => {
                                            const nextWidth = event.currentTarget.naturalWidth
                                            const nextHeight = event.currentTarget.naturalHeight

                                            if (!nextWidth || !nextHeight) {
                                                return
                                            }

                                            setImageDimensions((current) => {
                                                if (current?.width === nextWidth && current?.height === nextHeight) {
                                                    return current
                                                }

                                                return {
                                                    width: nextWidth,
                                                    height: nextHeight,
                                                }
                                            })

                                            setFileInfo((current) => {
                                                if (!current) {
                                                    return current
                                                }

                                                const nextResolution = `${nextWidth} x ${nextHeight}`
                                                if (current.resolution === nextResolution) {
                                                    return current
                                                }

                                                return {
                                                    ...current,
                                                    resolution: nextResolution,
                                                }
                                            })
                                        }}
                                    />

                                    {overlayDetections.length > 0 && imageDimensions && (
                                        <DetectionLayer>
                                            <DetectionSvg
                                                viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                                                preserveAspectRatio="xMidYMid meet"
                                            >
                                                {overlayDetections.map((shape) => {
                                                    const isActive = selectedDetectionId === shape.detection.id
                                                    const commonProps = {
                                                        onClick: () => setSelectedDetectionId(shape.detection.id),
                                                        style: {
                                                            pointerEvents: 'auto',
                                                            cursor: 'pointer',
                                                        },
                                                    }

                                                    if (shape.kind === 'polygon') {
                                                        return (
                                                            <path
                                                                key={shape.detection.id}
                                                                {...commonProps}
                                                                d={shape.path}
                                                                fill={shape.meta.bg}
                                                                fillRule="evenodd"
                                                                stroke={shape.meta.color}
                                                                strokeWidth={isActive ? 4 : 2}
                                                                strokeLinejoin="round"
                                                            />
                                                        )
                                                    }

                                                    if (shape.kind === 'line') {
                                                        return (
                                                            <polyline
                                                                key={shape.detection.id}
                                                                {...commonProps}
                                                                points={shape.points}
                                                                fill="none"
                                                                stroke={shape.meta.color}
                                                                strokeWidth={isActive ? 5 : 3}
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        )
                                                    }

                                                    if (shape.kind === 'point') {
                                                        return (
                                                            <g key={shape.detection.id} {...commonProps}>
                                                                <circle
                                                                    cx={shape.cx}
                                                                    cy={shape.cy}
                                                                    r={isActive ? 9 : 7}
                                                                    fill={shape.meta.bg}
                                                                    stroke={shape.meta.color}
                                                                    strokeWidth={3}
                                                                />
                                                                <circle
                                                                    cx={shape.cx}
                                                                    cy={shape.cy}
                                                                    r={3}
                                                                    fill={shape.meta.color}
                                                                />
                                                            </g>
                                                        )
                                                    }

                                                    if (shape.detection.detectType === 'text') {
                                                        return (
                                                            <g key={shape.detection.id} {...commonProps}>
                                                                <rect
                                                                    x={shape.x}
                                                                    y={shape.y}
                                                                    width={shape.width}
                                                                    height={shape.height}
                                                                    rx={Math.min(10, shape.height / 4)}
                                                                    fill="rgba(255, 255, 255, 0.78)"
                                                                    stroke={shape.meta.color}
                                                                    strokeWidth={isActive ? 2.5 : 1.75}
                                                                />
                                                            </g>
                                                        )
                                                    }

                                                    return (
                                                        <rect
                                                            key={shape.detection.id}
                                                            {...commonProps}
                                                            x={shape.x}
                                                            y={shape.y}
                                                            width={shape.width}
                                                            height={shape.height}
                                                            rx={8}
                                                            fill={shape.meta.bg}
                                                            stroke={shape.meta.color}
                                                            strokeWidth={isActive ? 4 : 2}
                                                        />
                                                    )
                                                })}
                                            </DetectionSvg>
                                            {textLabelDetections.length > 0 && (
                                                <DetectionSvg
                                                    viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                                                    preserveAspectRatio="xMidYMid meet"
                                                >
                                                    {textLabelDetections.map(({ detection, meta, label, width, centerX, centerY }) => (
                                                        <g
                                                            key={`text-label-${detection.id}`}
                                                            onClick={() => setSelectedDetectionId(detection.id)}
                                                            style={{
                                                                pointerEvents: 'auto',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <rect
                                                                x={centerX - (width / 2)}
                                                                y={centerY - 17}
                                                                width={width}
                                                                height={34}
                                                                rx={17}
                                                                fill="rgba(255, 255, 255, 0.98)"
                                                                stroke={meta.color}
                                                                strokeWidth="2.25"
                                                            />
                                                            <text
                                                                x={centerX}
                                                                y={centerY}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                                fill={meta.color}
                                                                fontSize="18"
                                                                fontWeight="800"
                                                                stroke="rgba(255, 255, 255, 0.98)"
                                                                strokeWidth="2.75"
                                                                paintOrder="stroke"
                                                            >
                                                                {label}
                                                            </text>
                                                        </g>
                                                    ))}
                                                </DetectionSvg>
                                            )}
                                        </DetectionLayer>
                                    )}
                                </ImageCanvas>

                                <PreviewFooter>
                                    <FileInfo>
                                        <div className="name">{fileInfo?.name}</div>
                                        <div className="size">{fileInfo?.size} · {fileInfo?.resolution}</div>
                                    </FileInfo>
                                    <OverlayActions>
                                        <Button
                                            variant="outlineGray"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setStatus('idle')
                                                setSelectedFile(null)
                                                setPreviewUrl(null)
                                                setFileInfo(null)
                                                setImageDimensions(null)
                                                resetAnalysisState()
                                            }}
                                        >
                                            이미지 변경
                                        </Button>
                                    </OverlayActions>
                                </PreviewFooter>
                            </ImageStage>
                        </PreviewContainer>
                    )}

                    {status === 'processing' && (
                        <LoadingOverlay onClick={(event) => event.stopPropagation()}>
                            <Spinner />
                            <LoadingText>
                                AI가 도면을 분석하고 있습니다...
                                <div className="sub">벽, 출입구, 텍스트, POI 후보를 추출하는 중입니다.</div>
                            </LoadingText>
                        </LoadingOverlay>
                    )}
                </UploadZone>

            </ContentLayout>

            <CalibrationModal
                isOpen={isCalibrationModalOpen}
                onClose={() => setIsCalibrationModalOpen(false)}
                actualGates={actualGates}
                detectedEntrances={detectedEntrances}
                initialMapping={calibrationMapping}
                onSave={(newMapping) => setCalibrationMapping(newMapping)}
            />
        </ViewContainer>
    )
}
