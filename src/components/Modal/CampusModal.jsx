import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../Button/Button'
import AddressSearchModal from './AddressSearchModal'
import { createCampusApi } from '../../api/campusApi'

// --- Zod Schema ---
const coordSchema = z.object({
    longitude: z.string().min(1, '경도를 입력해주세요.'),
    latitude: z.string().min(1, '위도를 입력해주세요.'),
})

const gateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, '출입구 이름을 입력해주세요.'),
    longitude: z.string().min(1, '출입구 경도를 지정해주세요.'),
    latitude: z.string().min(1, '출입구 위도를 지정해주세요.'),
})

const campusSchema = z.object({
    name: z.string().min(1, '캠퍼스/단지명을 입력해주세요.'),
    address: z.string().min(1, '주소를 검색해주세요.'),
    longitude: z.string().min(1, '경도 정보가 필요합니다.'),
    latitude: z.string().min(1, '위도 정보가 필요합니다.'),
    gates: z.array(gateSchema).min(1, '출입구는 최소 1개 이상 등록해야 합니다.'),
    requiresFloorplan: z.boolean(),
    boundary: z.array(coordSchema).min(3, '경계 꼭짓점은 최소 3개 이상 등록해야 합니다.'),
    description: z.string().optional(),
})

const defaultValues = {
    name: '',
    address: '',
    longitude: '',
    latitude: '',
    gates: [],
    requiresFloorplan: false,
    boundary: [],
    description: '',
}

// --- Styled Components (Wow Aesthetics: 2-Column Responsive Layout) ---
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.25s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`

const ModalContainer = styled.div`
    background-color: var(--white);
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: var(--radius-16, 16px);
    padding: 28px;
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.02);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    gap: 20px;

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
        max-width: 95%;
        padding: 20px;
    }
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-100);
    padding-bottom: 14px;
`

const Title = styled.h2`
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 700;
    color: var(--black-900);
    margin: 0;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: color 0.2s;

    &:hover {
        color: var(--gray-700);
    }
`

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1.1fr 1.9fr;
    gap: 24px;
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }
`

const FormPanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`

const MapPanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`

const Label = styled.label`
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--black-900);
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const Description = styled.p`
    margin: 0;
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.55;
`

const InputWrapper = styled.div`
    display: flex;
    gap: 8px;
`

const GridRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`

const Input = styled.input`
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8, 8px);
    font-family: var(--font-sans);
    font-size: var(--text-14);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
        border-color: var(--blue-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }

    &::placeholder {
        color: var(--gray-400);
    }

    &:disabled,
    &:read-only {
        background-color: var(--gray-50);
        cursor: not-allowed;
        color: var(--gray-500);
    }
`

const ErrorMessage = styled.span`
    color: var(--red-500, #ef4444);
    font-size: 11.5px;
    font-family: var(--font-sans);
    margin-top: 2px;
`

// --- Map Canvas Styling ---
const MapWrapper = styled.div`
    width: 100%;
    position: relative;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12, 12px);
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
`

const MapContainer = styled.div`
    width: 100%;
    height: 380px;
    background: #f1f5f9;

    @media (max-width: 768px) {
        height: 280px;
    }
`

const MapToolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--gray-50);
    padding: 10px 14px;
    border-bottom: 1px solid var(--gray-200);
    gap: 12px;
    flex-wrap: wrap;
`

const ToolModeGroup = styled.div`
    display: flex;
    gap: 6px;
`

const ToolButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-6, 6px);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${({ $active }) => ($active ? 'var(--blue-500)' : 'var(--gray-300)')};
    background: ${({ $active }) => ($active ? 'var(--blue-500)' : 'var(--white)')};
    color: ${({ $active }) => ($active ? 'var(--white)' : 'var(--gray-700)')};
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--blue-500);
        background: ${({ $active }) => ($active ? 'var(--blue-600)' : 'var(--gray-50)')};
    }
`

const StatusBadge = styled.span`
    font-size: 12px;
    color: ${({ $valid }) => ($valid ? '#16a34a' : 'var(--gray-500)')};
    background: ${({ $valid }) => ($valid ? '#f0fdf4' : 'var(--gray-100)')};
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
`

const BoundaryPreviewBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #f8fafc;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8, 8px);
    padding: 12px;
    max-height: 120px;
    overflow-y: auto;
    font-size: 12.5px;
`

const BoundaryPreviewItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--gray-600);
    font-family: monospace;

    .index {
        font-weight: 700;
        color: var(--black-900);
        font-family: var(--font-sans);
    }
`

const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid var(--gray-100);
    padding-top: 16px;
    margin-top: 10px;
`

const ActionButton = styled.button`
    background: none;
    border: none;
    color: var(--red-500, #ef4444);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-4, 4px);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--red-50, #fef2f2);
        color: var(--red-600, #dc2626);
    }
`

const ChoiceGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`

const ChoiceCard = styled.button`
    border: 1px solid ${({ $active }) => ($active ? 'var(--blue-500)' : 'var(--gray-200)')};
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.08)' : 'var(--white)')};
    border-radius: var(--radius-12, 12px);
    padding: 14px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;

    .title {
        font-size: 14px;
        font-weight: 700;
        color: var(--black-900);
        margin-bottom: 6px;
    }

    .desc {
        font-size: 12.5px;
        line-height: 1.5;
        color: var(--gray-500);
    }
`

const GateList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const GateCard = styled.div`
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-10, 10px);
    padding: 12px;
    background: var(--gray-50);
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const GateCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    .title {
        font-size: 13px;
        font-weight: 700;
        color: var(--black-900);
    }
`

export default function CampusModal({ isOpen, onClose, tenantId, onSuccess }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [mapMode, setMapMode] = useState('GATE') // 'GATE' | 'BOUNDARY'
    
    // Kakao Map Hooks & Refs
    const mapRef = useRef(null)
    const mapInstance = useRef(null)
    const gateMarkersRef = useRef([])
    const centroidMarkerRef = useRef(null)
    const boundaryPolygonRef = useRef(null)
    const boundaryMarkersRef = useRef([])

    const mapModeRef = useRef(mapMode)
    const gateCountRef = useRef(0)
    useEffect(() => {
        mapModeRef.current = mapMode
    }, [mapMode])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(campusSchema),
        mode: 'onChange',
        defaultValues,
    })

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'boundary',
    })

    const {
        fields: gateFields,
        append: appendGate,
        remove: removeGate,
        replace: replaceGates,
    } = useFieldArray({
        control,
        name: 'gates',
    })

    useEffect(() => {
        gateCountRef.current = gateFields.length
    }, [gateFields.length])

    const boundaryCoords = watch('boundary')
    const centroidLng = watch('longitude')
    const centroidLat = watch('latitude')
    const gateCoords = watch('gates')
    const requiresFloorplan = watch('requiresFloorplan')

    // 1. 모달이 열리면 기본 초기화
    useEffect(() => {
        if (isOpen) {
            reset(defaultValues)
            // 지도가 그려질 시점에 kakao 객체 셋업
            setTimeout(initMap, 150)
        } else {
            cleanupMap()
        }
    }, [isOpen, reset])

    // 2. 중심 좌표가 설정되면 지도 이동
    useEffect(() => {
        updateCentroidMarker()
    }, [centroidLng, centroidLat])

    // 3. 정문 좌표가 변경되면 지도 핀 업데이트
    useEffect(() => {
        drawGateMarkers()
    }, [gateCoords])

    // 4. 경계선(꼭짓점 배열) 좌표가 변경되면 다각형 폴리곤 다시 그리기
    useEffect(() => {
        drawBoundary()
    }, [boundaryCoords])

    const updateCentroidMarker = () => {
        if (!mapInstance.current || !centroidLng || !centroidLat) return
        const center = new window.kakao.maps.LatLng(Number(centroidLat), Number(centroidLng))
        mapInstance.current.setCenter(center)
        mapInstance.current.setLevel(3)

        if (centroidMarkerRef.current) {
            centroidMarkerRef.current.setPosition(center)
            centroidMarkerRef.current.setMap(mapInstance.current)
        } else {
            centroidMarkerRef.current = new window.kakao.maps.Marker({
                position: center,
                map: mapInstance.current,
                title: '단지 중심점'
            })
        }
    }

    const updatePrimaryMarker = () => {
        // no-op: replaced by multiple gate markers
    }

    const drawGateMarkers = () => {
        if (!mapInstance.current || !window.kakao?.maps) return

        gateMarkersRef.current.forEach((marker) => marker.setMap(null))
        gateMarkersRef.current = []

        if (!gateCoords || gateCoords.length === 0) return

        gateCoords.forEach((gate, index) => {
            if (!gate?.longitude || !gate?.latitude) {
                return
            }

            const pos = new window.kakao.maps.LatLng(Number(gate.latitude), Number(gate.longitude))
            const marker = new window.kakao.maps.Marker({
                position: pos,
                map: mapInstance.current,
                title: gate.name || `Gate ${index + 1}`,
            })

            const infoWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;">${gate.name || `Gate ${index + 1}`}</div>`,
            })
            infoWindow.open(mapInstance.current, marker)
            gateMarkersRef.current.push(marker)
        })
    }

    // --- 카카오 지도 초기화 ---
    const initMap = () => {
        if (!mapRef.current) return

        // 1. 이미 kakao 객체가 전역에 존재하거나 로드 진행 중인 경우 (중복 스크립트 생성 방지)
        if (window.kakao && window.kakao.maps) {
            const tryLoad = () => {
                if (window.kakao.maps.load) {
                    try {
                        window.kakao.maps.load(() => {
                            initMapInstance()
                        })
                    } catch (e) {
                        console.warn('kakao.maps.load 호출 실패, 재시도합니다:', e)
                        setTimeout(tryLoad, 100)
                    }
                } else {
                    setTimeout(tryLoad, 50)
                }
            }
            tryLoad()
            return
        }

        // 2. 동적으로 스크립트 로드 시도
        const apiKey = (import.meta.env.VITE_KAKAO_JS_KEY || '').trim()
        console.log('[DEBUG] 로드 시도할 카카오 JS API 키 (VITE_KAKAO_JS_KEY):', apiKey ? `"${apiKey}"` : '없음')
        
        if (!apiKey) {
            console.error('카카오 JS API 키(VITE_KAKAO_JS_KEY)가 설정되지 않았습니다. .env 파일을 확인하고 Vite 개발 서버를 재기동해주세요.')
            return
        }
        
        // 이미 DOM에 등록된 카카오 맵 스크립트 엘리먼트가 있는지 확인
        let script = document.querySelector(`script[src*="dapi.kakao.com"]`)
        if (!script) {
            script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,drawing&autoload=false`
            script.async = true
            console.log('[DEBUG] 카카오 맵 SDK 스크립트 태그 생성 및 추가:', script.src)
            document.head.appendChild(script)
        }
        
        script.onload = () => {
            console.log('[DEBUG] 카카오 맵 SDK 스크립트 로드 완료')
            const tryLoad = () => {
                if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
                    try {
                        window.kakao.maps.load(() => {
                            console.log('[DEBUG] kakao.maps.load 완료, 지도 인스턴스 초기화 시작')
                            initMapInstance()
                        })
                    } catch (e) {
                        setTimeout(tryLoad, 100)
                    }
                } else {
                    setTimeout(tryLoad, 50)
                }
            }
            tryLoad()
        }
        
        script.onerror = (err) => {
            console.error('카카오 지도 SDK 스크립트 동적 로드 실패. 요청 URL:', script.src, err)
        }
    }

    const initMapInstance = () => {
        if (!mapRef.current) return
        if (mapInstance.current) return // 중복 생성 방지

        const container = mapRef.current
        const initialLat = Number(centroidLat) || 37.560948
        const initialLng = Number(centroidLng) || 126.981089

        const options = {
            center: new window.kakao.maps.LatLng(initialLat, initialLng),
            level: 3,
        }

        const map = new window.kakao.maps.Map(container, options)
        mapInstance.current = map

        // 지도 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl()
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

        // 클릭 이벤트 핸들러
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
            const latlng = mouseEvent.latLng
            const lng = latlng.getLng().toFixed(6)
            const lat = latlng.getLat().toFixed(6)

            if (mapModeRef.current === 'GATE') {
                appendGate({
                    id: crypto.randomUUID(),
                    name: `Gate ${gateCountRef.current + 1}`,
                    longitude: lng,
                    latitude: lat,
                })
            } else if (mapModeRef.current === 'BOUNDARY') {
                append({ longitude: lng, latitude: lat })
            }
        })

        // 마운트 후 혹시 이미 셋팅된 상태가 있으면 그려줌 (템플릿 등)
        updateCentroidMarker()
        drawGateMarkers()
        drawBoundary()
    }


    const cleanupMap = () => {
        gateMarkersRef.current = []
        centroidMarkerRef.current = null
        boundaryPolygonRef.current = null
        boundaryMarkersRef.current = []
        mapInstance.current = null
    }

    // --- 경계선 그리기 ---
    const drawBoundary = () => {
        if (!mapInstance.current || !window.kakao || !window.kakao.maps) return

        // 1. 기존 다각형 삭제
        if (boundaryPolygonRef.current) {
            boundaryPolygonRef.current.setMap(null)
        }

        // 2. 기존 꼭짓점 점 마커들 삭제
        boundaryMarkersRef.current.forEach(m => m.setMap(null))
        boundaryMarkersRef.current = []

        if (!boundaryCoords || boundaryCoords.length === 0) return

        const path = boundaryCoords.map(coord => {
            const pos = new window.kakao.maps.LatLng(Number(coord.latitude), Number(coord.longitude))

            const markerContent = document.createElement('div')
            markerContent.style.width = '24px'
            markerContent.style.height = '24px'
            markerContent.style.borderRadius = '999px'
            markerContent.style.background = '#2563eb'
            markerContent.style.color = '#ffffff'
            markerContent.style.fontSize = '12px'
            markerContent.style.fontWeight = '700'
            markerContent.style.display = 'flex'
            markerContent.style.alignItems = 'center'
            markerContent.style.justifyContent = 'center'
            markerContent.style.boxShadow = '0 6px 12px rgba(37, 99, 235, 0.28)'
            markerContent.style.border = '2px solid #ffffff'
            markerContent.textContent = String(boundaryMarkersRef.current.length + 1)

            const marker = new window.kakao.maps.CustomOverlay({
                position: pos,
                content: markerContent,
                yAnchor: 0.5,
                zIndex: 3,
            })
            marker.setMap(mapInstance.current)
            boundaryMarkersRef.current.push(marker)
            return pos
        })

        // 3. 다각형 그리기
        if (path.length >= 3) {
            boundaryPolygonRef.current = new window.kakao.maps.Polygon({
                path: path,
                strokeWeight: 3,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
                fillColor: '#3b82f6',
                fillOpacity: 0.18,
            })
            boundaryPolygonRef.current.setMap(mapInstance.current)
        }
    }

    const resetBoundary = () => {
        replace([])
    }

    const resetGates = () => {
        replaceGates([])
    }

    if (!isOpen) return null

    const handleClose = () => {
        onClose()
    }

    const handlePlaceSelect = (place) => {
        setValue('address', place.road_address_name || place.address_name || '', { shouldValidate: true })
        if (place.x) setValue('longitude', String(place.x), { shouldValidate: true })
        if (place.y) setValue('latitude', String(place.y), { shouldValidate: true })
    }

    const onSubmit = async (data) => {
        const payload = {
            name: data.name,
            address: data.address,
            boundary: data.boundary.map((b) => ({
                longitude: Number(b.longitude),
                latitude: Number(b.latitude),
            })),
            centroid: {
                longitude: Number(data.longitude),
                latitude: Number(data.latitude),
            },
            gates: data.gates.map((gate) => ({
                id: gate.id || crypto.randomUUID(),
                name: gate.name,
                location: {
                    longitude: Number(gate.longitude),
                    latitude: Number(gate.latitude),
                },
            })),
            requiresFloorplan: data.requiresFloorplan,
            meta: {
                description: data.description || '',
            },
        }

        try {
            const savedCampus = await createCampusApi(tenantId, payload)
            alert('캠퍼스 지리 정보가 성공적으로 등록되었습니다.')
            if (onSuccess) {
                onSuccess(savedCampus)
            }
            handleClose()
        } catch (err) {
            console.error('캠퍼스 등록 실패:', err)
            alert('캠퍼스 등록 중 오류가 발생했습니다: ' + err.message)
        }
    }

    const onError = (formErrors) => {
        console.error('폼 검증 실패:', formErrors)
        alert('필수 입력 항목을 정확히 작성해 주세요.')
    }

    return (
        <>
            <Overlay onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                <ModalContainer>
                    <Header>
                        <Title>캠퍼스 지리 정보 등록</Title>
                        <CloseButton type="button" onClick={handleClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </CloseButton>
                    </Header>

                    <Form onSubmit={handleSubmit(onSubmit, onError)}>
                        <ContentGrid>
                            {/* --- 좌측 폼 패널 --- */}
                            <FormPanel>
                                <FieldGroup>
                                    <Label htmlFor="address">캠퍼스 대표 주소</Label>
                                    <InputWrapper>
                                        <Input
                                            id="address"
                                            type="text"
                                            placeholder="[검색] 버튼을 눌러 주소를 검색하세요"
                                            readOnly
                                            {...register('address')}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setIsSearchOpen(true)}
                                            style={{ flexShrink: 0, padding: '0 12px', height: '40px' }}
                                        >
                                            검색
                                        </Button>
                                    </InputWrapper>
                                    {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
                                </FieldGroup>

                                <GridRow>
                                    <FieldGroup>
                                        <Label htmlFor="longitude">대표 경도</Label>
                                        <Input
                                            id="longitude"
                                            type="text"
                                            placeholder="검색시 자동 입력"
                                            readOnly
                                            {...register('longitude')}
                                        />
                                    </FieldGroup>
                                    <FieldGroup>
                                        <Label htmlFor="latitude">대표 위도</Label>
                                        <Input
                                            id="latitude"
                                            type="text"
                                            placeholder="검색시 자동 입력"
                                            readOnly
                                            {...register('latitude')}
                                        />
                                    </FieldGroup>
                                </GridRow>

                                <FieldGroup>
                                    <Label htmlFor="name">캠퍼스/단지 이름</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="예: 신세계백화점 본점 더 리저브"
                                        {...register('name')}
                                    />
                                    {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                                </FieldGroup>

                                <FieldGroup>
                                    <Label>도면 기반 길찾기 필요 여부</Label>
                                    <ChoiceGrid>
                                        <ChoiceCard
                                            type="button"
                                            $active={!requiresFloorplan}
                                            onClick={() => setValue('requiresFloorplan', false, { shouldValidate: true })}
                                        >
                                            <div className="title">도면 없이 진행</div>
                                            <div className="desc">지도 상 출입구와 건물 출입구를 수동 매핑하는 흐름입니다.</div>
                                        </ChoiceCard>
                                        <ChoiceCard
                                            type="button"
                                            $active={requiresFloorplan}
                                            onClick={() => setValue('requiresFloorplan', true, { shouldValidate: true })}
                                        >
                                            <div className="title">도면 등록 필요</div>
                                            <div className="desc">층별 도면 업로드, AI 분석, 맵 에디터 보정까지 진행합니다.</div>
                                        </ChoiceCard>
                                    </ChoiceGrid>
                                </FieldGroup>

                                <FieldGroup>
                                    <Label>등록된 Campus Gate ({gateFields.length}개)</Label>
                                    <Description>지도에서 게이트 추가 모드로 클릭하면 출입구가 하나씩 등록됩니다. 각 Gate 이름은 아래에서 수정할 수 있습니다.</Description>
                                    <GateList>
                                        {gateFields.length === 0 ? (
                                            <BoundaryPreviewBox>
                                                <div style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '12px 0' }}>
                                                    아직 등록된 출입구가 없습니다. 지도에서 출입구를 클릭해 추가해주세요.
                                                </div>
                                            </BoundaryPreviewBox>
                                        ) : (
                                            gateFields.map((gate, index) => (
                                                <GateCard key={gate.id}>
                                                    <input type="hidden" {...register(`gates.${index}.id`)} />
                                                    <GateCardHeader>
                                                        <span className="title">Gate #{index + 1}</span>
                                                        <ActionButton type="button" onClick={() => removeGate(index)}>
                                                            삭제
                                                        </ActionButton>
                                                    </GateCardHeader>
                                                    <Input
                                                        type="text"
                                                        placeholder={`예: Gate ${index + 1}`}
                                                        {...register(`gates.${index}.name`)}
                                                    />
                                                    <GridRow>
                                                        <Input
                                                            type="text"
                                                            readOnly
                                                            placeholder="경도"
                                                            {...register(`gates.${index}.longitude`)}
                                                        />
                                                        <Input
                                                            type="text"
                                                            readOnly
                                                            placeholder="위도"
                                                            {...register(`gates.${index}.latitude`)}
                                                        />
                                                    </GridRow>
                                                </GateCard>
                                            ))
                                        )}
                                    </GateList>
                                    {errors.gates && <ErrorMessage>{errors.gates.message}</ErrorMessage>}
                                </FieldGroup>

                                <FieldGroup>
                                    <Label htmlFor="description">상세 설명</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        placeholder="예: 신세계백화점 본점 구역 지리 정보입니다."
                                        {...register('description')}
                                    />
                                </FieldGroup>
                            </FormPanel>

                            {/* --- 우측 지도 및 다각형 그리기 패널 --- */}
                            <MapPanel>
                                    <Label>
                                        단지 위치 지정 및 경계 드로잉
                                    <StatusBadge $valid={boundaryCoords.length >= 3 && gateFields.length >= 1}>
                                        {boundaryCoords.length >= 3 && gateFields.length >= 1 ? '등록 가능' : '정보 미완료'}
                                    </StatusBadge>
                                </Label>
                                
                                <MapWrapper>
                                    <MapToolbar>
                                        <ToolModeGroup>
                                            <ToolButton
                                                type="button"
                                                $active={mapMode === 'GATE'}
                                                onClick={() => setMapMode('GATE')}
                                            >
                                                Gate 추가
                                            </ToolButton>
                                            <ToolButton
                                                type="button"
                                                $active={mapMode === 'BOUNDARY'}
                                                onClick={() => setMapMode('BOUNDARY')}
                                            >
                                                🔷 경계 꼭짓점 추가
                                            </ToolButton>
                                        </ToolModeGroup>
                                        <Button
                                            type="button"
                                            variant="outlineGray"
                                            onClick={resetGates}
                                            style={{ height: '30px', fontSize: '12px', padding: '0 10px' }}
                                        >
                                            Gate 리셋
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outlineGray"
                                            onClick={resetBoundary}
                                            style={{ height: '30px', fontSize: '12px', padding: '0 10px' }}
                                        >
                                            경계선 리셋
                                        </Button>
                                    </MapToolbar>
                                    
                                    <MapContainer ref={mapRef} />
                                </MapWrapper>

                                <FieldGroup>
                                    <Label>꼭짓점 좌표 프리뷰 ({boundaryCoords.length}개 찍힘)</Label>
                                    <BoundaryPreviewBox>
                                        {boundaryCoords.length === 0 ? (
                                            <div style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '12px 0' }}>
                                                지도를 클릭해 꼭짓점들을 시계방향 순서로 찍어주세요.
                                            </div>
                                        ) : (
                                            boundaryCoords.map((coord, index) => (
                                                <BoundaryPreviewItem key={index}>
                                                    <div>
                                                        <span className="index">#{index + 1}</span> {Number(coord.longitude).toFixed(5)}, {Number(coord.latitude).toFixed(5)}
                                                    </div>
                                                    <ActionButton type="button" onClick={() => remove(index)}>
                                                        삭제
                                                    </ActionButton>
                                                </BoundaryPreviewItem>
                                            ))
                                        )}
                                    </BoundaryPreviewBox>
                                    {errors.boundary && <ErrorMessage>{errors.boundary.message}</ErrorMessage>}
                                </FieldGroup>
                            </MapPanel>
                        </ContentGrid>

                        <Footer>
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                취소
                            </Button>
                            <Button type="submit" variant="primary">
                                등록
                            </Button>
                        </Footer>
                    </Form>
                </ModalContainer>
            </Overlay>

            <AddressSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handlePlaceSelect}
            />
        </>
    )
}
