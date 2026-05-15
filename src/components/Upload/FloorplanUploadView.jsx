import { useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Button from '../Button/Button'
import { analyzeFloorplan } from '../../services/aiAnalysis'

const DETECTION_TYPE_META = {
    wall: { label: '벽', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.16)' },
    text: { label: '텍스트', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.16)' },
    poi_candidate: { label: 'POI 후보', color: '#059669', bg: 'rgba(5, 150, 105, 0.16)' },
    door: { label: '문', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.16)' },
    restroom_sign: { label: '화장실', color: '#db2777', bg: 'rgba(219, 39, 119, 0.16)' },
    elevator: { label: '엘리베이터', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.16)' },
    stair: { label: '계단', color: '#65a30d', bg: 'rgba(101, 163, 13, 0.16)' },
    entrance: { label: '출입구', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.16)' },
    unknown: { label: '미분류', color: '#475569', bg: 'rgba(71, 85, 105, 0.16)' },
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

const Subtitle = styled.p`
    margin: 0;
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.5;
`

const ActionRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 20px;
    align-items: start;

    @media (max-width: 1200px) {
        grid-template-columns: minmax(0, 1fr) 320px;
    }

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
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
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-12);
    background: var(--white);
`

const PreviewImage = styled.img`
    display: block;
    width: 100%;
    height: auto;
    max-height: 68vh;
    object-fit: contain;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.18);
`

const DetectionLayer = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
`

const DetectionBox = styled.button`
    position: absolute;
    border: 2px solid ${({ $color }) => $color};
    background: ${({ $bg }) => $bg};
    border-radius: 10px;
    box-shadow: ${({ $active }) => ($active ? '0 0 0 3px rgba(15, 23, 42, 0.18)' : 'none')};
    pointer-events: auto;
    cursor: pointer;
`

const DetectionTag = styled.span`
    position: absolute;
    top: 8px;
    left: 8px;
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
    max-width: calc(100% - 16px);
    overflow: hidden;
    text-overflow: ellipsis;
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

const AnalysisSidebar = styled.aside`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12);
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 10px 18px -12px rgba(15, 23, 42, 0.22);
`

const SidebarTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    color: var(--black-900);
`

const SidebarText = styled.p`
    margin: 0;
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.55;
`

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`

const SummaryCard = styled.div`
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12);
    padding: 14px 16px;
    background: var(--gray-50);

    .label {
        display: block;
        font-size: 12px;
        color: var(--gray-500);
        margin-bottom: 6px;
    }

    .value {
        font-size: 20px;
        font-weight: 700;
        color: var(--black-900);
    }
`

const DetectionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 520px;
    overflow-y: auto;
`

const DetectionItem = styled.button`
    width: 100%;
    text-align: left;
    border: 1px solid ${({ $active }) => ($active ? 'var(--blue-300)' : 'var(--gray-200)')};
    background: ${({ $active }) => ($active ? 'var(--blue-50)' : 'var(--white)')};
    border-radius: var(--radius-12);
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--blue-300);
        background: var(--blue-50);
    }
`

const DetectionItemTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
`

const DetectionPill = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    font-size: 12px;
    font-weight: 700;
`

const Confidence = styled.span`
    font-size: 12px;
    font-weight: 700;
    color: var(--gray-500);
`

const DetectionName = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: var(--black-900);
    margin-bottom: 4px;
`

const DetectionMeta = styled.div`
    font-size: 12px;
    color: var(--gray-500);
    line-height: 1.5;
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

function formatConfidence(value) {
    return `${Math.round((value || 0) * 100)}%`
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

export default function FloorplanUploadView({ floorName, floorplanId = null }) {
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileInfo, setFileInfo] = useState(null)
    const [imageDimensions, setImageDimensions] = useState(null)
    const [status, setStatus] = useState('idle')
    const [analysisResult, setAnalysisResult] = useState(null)
    const [analysisError, setAnalysisError] = useState('')
    const [selectedDetectionId, setSelectedDetectionId] = useState(null)
    const inputRef = useRef(null)

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const overlayDetections = useMemo(() => {
        if (!analysisResult?.detections?.length || !imageDimensions) {
            return []
        }

        return analysisResult.detections.filter(hasValidBoundingBox).map((detection) => {
            const [x1, y1, x2, y2] = detection.bboxPx
            const meta = getTypeMeta(detection.detectType)

            return {
                ...detection,
                meta,
                left: `${(x1 / imageDimensions.width) * 100}%`,
                top: `${(y1 / imageDimensions.height) * 100}%`,
                width: `${((x2 - x1) / imageDimensions.width) * 100}%`,
                height: `${((y2 - y1) / imageDimensions.height) * 100}%`,
            }
        })
    }, [analysisResult, imageDimensions])

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
            const nextPreviewUrl = URL.createObjectURL(file)

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }

            setSelectedFile(file)
            setPreviewUrl(nextPreviewUrl)
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
        if (!selectedFile || !imageDimensions) {
            return
        }

        setStatus('processing')
        setAnalysisError('')

        try {
            const result = await analyzeFloorplan({
                floorplanId,
                floorName,
                imageWidth: imageDimensions.width,
                imageHeight: imageDimensions.height,
            })

            setAnalysisResult(result)
            setSelectedDetectionId(result.detections[0]?.id || null)
            setStatus('preview')
        } catch {
            setStatus('preview')
            setAnalysisError('AI 분석 요청에 실패했습니다. 백엔드 연결 상태를 확인해주세요.')
        }
    }

    const triggerFileSelect = () => {
        if (status === 'processing') return
        inputRef.current?.click()
    }

    const activeSourceTone = analysisResult?.source || 'mock'
    const activeFloorLabel = floorName ? `${floorName} 도면` : '도면'

    return (
        <ViewContainer>
            <Header>
                <HeaderCopy>
                    <Title>도면 업로드</Title>
                </HeaderCopy>

                <ActionRow>
                    {analysisResult && (
                        <StatusBadge $tone={activeSourceTone}>
                            {activeSourceTone === 'api' && 'API 응답'}
                            {activeSourceTone === 'mock' && 'Mock 응답'}
                            {activeSourceTone === 'mock-fallback' && 'Mock Fallback'}
                        </StatusBadge>
                    )}
                    {status === 'preview' && (
                        <Button variant="primary" onClick={handleAiRequest} disabled={!selectedFile}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            AI 도면 분석 요청
                        </Button>
                    )}
                </ActionRow>
            </Header>

            <ContentLayout>
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
                                    <PreviewImage src={previewUrl} alt={`${activeFloorLabel} 미리보기`} />

                                    {overlayDetections.length > 0 && (
                                        <DetectionLayer>
                                            {overlayDetections.map((detection) => (
                                                <DetectionBox
                                                    key={detection.id}
                                                    type="button"
                                                    $color={detection.meta.color}
                                                    $bg={detection.meta.bg}
                                                    $active={selectedDetectionId === detection.id}
                                                    style={{
                                                        left: detection.left,
                                                        top: detection.top,
                                                        width: detection.width,
                                                        height: detection.height,
                                                    }}
                                                    onClick={() => setSelectedDetectionId(detection.id)}
                                                >
                                                    <DetectionTag $color={detection.meta.color}>
                                                        {detection.meta.label}
                                                        {detection.label ? ` · ${detection.label}` : ''}
                                                    </DetectionTag>
                                                </DetectionBox>
                                            ))}
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

                <AnalysisSidebar>
                    <SidebarTitle>분석 결과</SidebarTitle>
                    <SummaryGrid>
                        <SummaryCard>
                            <span className="label">대상 도면</span>
                            <span className="value">{floorName || '미지정'}</span>
                        </SummaryCard>
                        <SummaryCard>
                            <span className="label">검출 개수</span>
                            <span className="value">{analysisResult?.detectionCount || 0}</span>
                        </SummaryCard>
                    </SummaryGrid>

                    {analysisError && <EmptyResult>{analysisError}</EmptyResult>}

                    {!analysisError && !analysisResult && (
                        <EmptyResult>
                            도면을 업로드하고 AI 분석을 요청하면, 벽/텍스트/POI 후보가 도면 위와 이 패널에 함께 표시됩니다.
                        </EmptyResult>
                    )}

                    {analysisResult && (
                        <DetectionList>
                            {analysisResult.detections.map((detection) => {
                                const meta = getTypeMeta(detection.detectType)

                                return (
                                    <DetectionItem
                                        key={detection.id}
                                        type="button"
                                        $active={selectedDetectionId === detection.id}
                                        onClick={() => setSelectedDetectionId(detection.id)}
                                    >
                                        <DetectionItemTop>
                                            <DetectionPill $bg={meta.bg} $color={meta.color}>
                                                {meta.label}
                                            </DetectionPill>
                                            <Confidence>{formatConfidence(detection.confidence)}</Confidence>
                                        </DetectionItemTop>
                                        <DetectionName>{detection.label || detection.ocrText || '이름 없음'}</DetectionName>
                                        <DetectionMeta>
                                            상태: {detection.status || 'pending'}<br />
                                            OCR: {detection.ocrText || '없음'}
                                        </DetectionMeta>
                                    </DetectionItem>
                                )
                            })}
                        </DetectionList>
                    )}
                </AnalysisSidebar>
            </ContentLayout>
        </ViewContainer>
    )
}
