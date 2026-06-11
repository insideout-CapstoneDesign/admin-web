import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import FloorplanUploadView from '../../components/Upload/FloorplanUploadView'
import Button from '../../components/Button/Button'
import { getBuildingByIdApi, initializeBuildingDraftApi, addBuildingFloorApi } from '../../api/buildingApi'
import {
    AddFloorBtn,
    BackButton,
    Container,
    ContentLayout,
    FloorItem,
    FloorList,
    HeaderArea,
    MainViewer,
    PanelHint,
    PageWrapper,
    PanelHeader,
    SidePanel,
    StatusDot,
    Title,
    TitleRow,
} from './BuildingDetailPage.styles'
import styled from 'styled-components'

function formatFloorLabel(level) {
    return level < 0 ? `B${Math.abs(level)}층` : `${level}층`
}

function createFloorViewModel({ buildingId, level, name, hasMap = false, floorId, floorplanId, floorplanImageUrl = null, analysisCompleted = false }) {
    const resolvedHasMap = Boolean(floorplanImageUrl) || hasMap

    return {
        level,
        name: name || formatFloorLabel(level),
        hasMap: resolvedHasMap,
        floorId,
        floorplanId: floorplanId || null,
        floorplanImageUrl: floorplanImageUrl || null,
        analysisCompleted: Boolean(analysisCompleted),
    }
}

function mapBuildingFloors(building, fallbackBuildingId) {
    if (!building?.floors?.length) {
        return []
    }

    return [...building.floors]
        .sort((a, b) => b.level - a.level)
        .map((floor) => createFloorViewModel({
            buildingId: building.id || fallbackBuildingId || 'new-building',
            level: floor.level,
            name: floor.name || formatFloorLabel(floor.level),
            hasMap: Boolean(floor.floorplanImageUrl),
            floorId: floor.floorId || floor.id,
            floorplanId: floor.floorplanId,
            floorplanImageUrl: floor.floorplanImageUrl,
            analysisCompleted: floor.analysisCompleted,
        }))
}

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`

const ModalContainer = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12, 12px);
    width: 100%;
    max-width: 400px;
    padding: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 16px;

    h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--black-900);
    }
`

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
        font-size: 12px;
        font-weight: 600;
        color: var(--gray-600);
        text-align: left;
    }

    input {
        padding: 10px 12px;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-8, 8px);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
            border-color: var(--blue-500);
        }
    }
`

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
`

const SummaryCard = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12, 12px);
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);

    h3 {
        margin: 0;
        font-size: 18px;
        color: var(--black-900);
    }

    p {
        margin: 0;
        color: var(--gray-600);
        line-height: 1.6;
        font-size: 13px;
    }
`

const MetaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`

const MetaCard = styled.div`
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-10, 10px);
    padding: 14px 16px 16px;
    background: var(--white);

    .label {
        display: block;
        font-size: 12px;
        color: var(--gray-500);
        margin-bottom: 6px;
    }

    .value {
        font-size: 14px;
        font-weight: 700;
        color: var(--black-900);
    }
`

const ProgressRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`

const SummaryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
`

const SummaryHeaderCopy = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const ProgressPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 999px;
    border: 1px solid ${({ $done }) => ($done ? 'rgba(16, 185, 129, 0.18)' : 'var(--gray-200)')};
    background: ${({ $done }) => ($done ? 'rgba(16, 185, 129, 0.08)' : 'var(--gray-50)')};
    color: ${({ $done }) => ($done ? 'var(--green-700)' : 'var(--gray-700)')};
    font-size: 13px;
    font-weight: 600;

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${({ $done }) => ($done ? 'var(--green-500)' : 'var(--orange-500, #f59e0b)')};
    }
`

export default function BuildingDetailPage() {
    const { buildingId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [submittedBuilding, setSubmittedBuilding] = useState(location.state?.building || null)
    const [floors, setFloors] = useState(() => mapBuildingFloors(location.state?.building, buildingId))
    const [activeFloorLevel, setActiveFloorLevel] = useState(() => mapBuildingFloors(location.state?.building, buildingId)[0]?.level ?? null)
    const [loading, setLoading] = useState(!location.state?.building?.floors?.length)
    const [error, setError] = useState('')
    const [initializingMapEditor, setInitializingMapEditor] = useState(false)
    const [isAddFloorOpen, setIsAddFloorOpen] = useState(false)
    const [newFloorLevel, setNewFloorLevel] = useState('')
    const [newFloorName, setNewFloorName] = useState('')

    const handleLevelChange = (val) => {
        setNewFloorLevel(val)
        const levelNum = parseInt(val, 10)
        if (!isNaN(levelNum)) {
            if (levelNum < 0) {
                setNewFloorName(`B${Math.abs(levelNum)}`)
            } else if (levelNum > 0) {
                setNewFloorName(`${levelNum}F`)
            } else {
                setNewFloorName('')
            }
        } else {
            setNewFloorName('')
        }
    }

    const handleAddFloorSubmit = async (e) => {
        e.preventDefault()

        if (isBuildingActive) {
            window.alert('활성 건물은 층 추가를 바로 반영하지 않도록 현재 막아두었습니다.')
            return
        }

        const trimmedLevel = (newFloorLevel || '').toString().trim()
        const trimmedFloorName = (newFloorName || '').trim()
        if (!trimmedLevel || !trimmedFloorName) {
            window.alert('층 레벨과 이름을 입력해 주세요.')
            return
        }

        const levelNum = parseInt(trimmedLevel, 10)
        if (isNaN(levelNum)) {
            window.alert('층 레벨은 숫자여야 합니다.')
            return
        }

        try {
            const updatedBuilding = await addBuildingFloorApi(tenantId, submittedBuilding?.id || buildingId, {
                level: levelNum,
                name: trimmedFloorName,
            })

            // 빌딩 정보 및 층 목록 갱신
            setSubmittedBuilding(updatedBuilding)
            const mappedFloors = mapBuildingFloors(updatedBuilding, buildingId)
            setFloors(mappedFloors)
            
            // 새로 추가된 층이 활성화되도록
            setActiveFloorLevel(levelNum)
            
            // 모달 상태 초기화 및 닫기
            setNewFloorLevel('')
            setNewFloorName('')
            setIsAddFloorOpen(false)
            
            window.alert('층이 성공적으로 추가되었습니다.')
        } catch (err) {
            window.alert(err.message || '층 추가 중 오류가 발생했습니다.')
        }
    }

    const tenantId = submittedBuilding?.tenantId || searchParams.get('tenantId')
    const buildingName = submittedBuilding?.name || '건물'
    const isBuildingActive = (submittedBuilding?.activationStatus || '').toLowerCase() === 'active'
    const activeFloor = floors.find((floor) => floor.level === activeFloorLevel) || floors[0] || null
    const uploadedFloorCount = floors.filter((floor) => Boolean(floor.floorplanImageUrl)).length
    const totalFloorCount = floors.length
    const analyzedFloorCount = floors.filter((floor) => Boolean(floor.floorplanImageUrl) && floor.analysisCompleted).length
    const isAllFloorsReady = totalFloorCount > 0 &&
        uploadedFloorCount === totalFloorCount &&
        analyzedFloorCount === totalFloorCount

    const canStartMapEditor = Boolean(
        activeFloor?.floorId &&
        tenantId &&
        isAllFloorsReady
    )
    const isCurrentFloorUploaded = Boolean(activeFloor?.floorplanImageUrl)
    const isCurrentFloorAnalyzed = Boolean(activeFloor?.analysisCompleted)

    useEffect(() => {
        if (!buildingId || !tenantId) {
            if (!tenantId) {
                setError('건물 정보를 다시 불러오려면 tenantId가 필요합니다. 건물 목록에서 다시 진입해주세요.')
            }
            setLoading(false)
            return
        }

        if (submittedBuilding?.floors?.length) {
            const mappedFloors = mapBuildingFloors(submittedBuilding, buildingId)
            setFloors(mappedFloors)
            setActiveFloorLevel((current) => current ?? mappedFloors[0]?.level ?? null)
            setLoading(false)
            return
        }

        let isCancelled = false

        async function fetchBuilding() {
            setLoading(true)
            setError('')

            try {
                const building = await getBuildingByIdApi(tenantId, buildingId)
                if (isCancelled) return

                const mappedFloors = mapBuildingFloors(building, buildingId)
                setSubmittedBuilding(building)
                setFloors(mappedFloors)
                setActiveFloorLevel(mappedFloors[0]?.level ?? null)
            } catch (err) {
                if (isCancelled) return
                setError(err.message || '건물 상세 정보를 불러오는 중 오류가 발생했습니다.')
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchBuilding()

        return () => {
            isCancelled = true
        }
    }, [buildingId, submittedBuilding, tenantId])

    const progressSteps = useMemo(() => {
        return [
            { done: Boolean(activeFloor), label: '층 준비' },
            { done: isCurrentFloorUploaded, label: '도면 업로드' },
            { done: isCurrentFloorAnalyzed, label: 'AI 분석' },
            { done: canStartMapEditor, label: '맵 에디터' },
        ]
    }, [activeFloor, canStartMapEditor, isCurrentFloorAnalyzed, isCurrentFloorUploaded])

    const handleFloorplanUploaded = (uploadedFloorplan) => {
        if (!activeFloor?.floorId) return

        setFloors((current) => current.map((floor) => (
            floor.floorId === activeFloor.floorId
                ? {
                    ...floor,
                    hasMap: Boolean(uploadedFloorplan.imageUrl),
                    floorplanId: uploadedFloorplan.id,
                    floorplanImageUrl: uploadedFloorplan.imageUrl,
                    analysisCompleted: false,
                }
                : floor
        )))
    }

    const handleFloorAnalysisCompleted = (floorplanId) => {
        if (!floorplanId) return

        setFloors((current) => current.map((floor) => (
            floor.floorplanId === floorplanId
                ? { ...floor, analysisCompleted: true }
                : floor
        )))
    }

    const handleOpenMapEditor = async () => {
        if (!activeFloor?.floorId || !tenantId || initializingMapEditor) {
            return
        }

        try {
            setInitializingMapEditor(true)
            await initializeBuildingDraftApi(tenantId, submittedBuilding?.id || buildingId)
            navigate(`/building/${submittedBuilding?.id || buildingId}/floors/${activeFloor.floorId}/editor?tenantId=${tenantId}`, {
                state: {
                    building: submittedBuilding,
                    floor: activeFloor,
                },
            })
        } catch (err) {
            window.alert(err.message || '맵 에디터 draft를 초기화하지 못했습니다.')
        } finally {
            setInitializingMapEditor(false)
        }
    }

    const handleBackToTenant = () => {
        if (tenantId) {
            navigate(`/tenant/${tenantId}`)
            return
        }
        navigate(-1)
    }

    return (
        <PageWrapper>
            <Container>
                <HeaderArea>
                    <BackButton onClick={handleBackToTenant}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        건물 목록으로 돌아가기
                    </BackButton>
                    <TitleRow>
                        <Title>{buildingName} 도면 관리</Title>
                    </TitleRow>
                </HeaderArea>

                {loading ? (
                    <SummaryCard style={{ marginBottom: '24px' }}>
                        <h3>도면 준비</h3>
                        <p>건물 정보를 불러오는 중입니다.</p>
                    </SummaryCard>
                ) : error ? (
                    <SummaryCard style={{ marginBottom: '24px' }}>
                        <h3>도면 준비</h3>
                        <p>{error}</p>
                    </SummaryCard>
                ) : (
                    <>
                        <SummaryCard style={{ marginBottom: '22px' }}>
                            <SummaryHeader>
                                <SummaryHeaderCopy>
                                    <h3>도면 준비</h3>
                                </SummaryHeaderCopy>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {!canStartMapEditor && totalFloorCount > 0 && (
                                        <span style={{ fontSize: '12.5px', color: 'var(--red-500)', fontWeight: '600', textAlign: 'right' }}>
                                            모든 층의 도면 업로드 및 AI 분석 완료가 필요합니다.
                                        </span>
                                    )}
                                    <Button
                                        variant="primary"
                                        onClick={handleOpenMapEditor}
                                        disabled={!canStartMapEditor || initializingMapEditor}
                                    >
                                        {initializingMapEditor ? '맵 에디터 준비 중...' : '맵 에디터 시작'}
                                    </Button>
                                </div>
                            </SummaryHeader>
                            <MetaGrid>
                                <MetaCard>
                                    <span className="label">등록된 층</span>
                                    <span className="value">{totalFloorCount}개</span>
                                </MetaCard>
                                <MetaCard>
                                    <span className="label">업로드된 도면</span>
                                    <span className="value">{uploadedFloorCount} / {totalFloorCount}개</span>
                                </MetaCard>
                                <MetaCard>
                                    <span className="label">다음 단계</span>
                                    <span className="value">맵 에디터</span>
                                </MetaCard>
                            </MetaGrid>
                            <ProgressRow>
                                {progressSteps.map((step) => (
                                    <ProgressPill key={step.label} $done={step.done}>
                                        <span className="dot" />
                                        {step.label}
                                    </ProgressPill>
                                ))}
                            </ProgressRow>
                        </SummaryCard>

                        <ContentLayout>
                            <SidePanel>
                                <PanelHeader>
                                    <h3>층 목록</h3>
                                    {!isBuildingActive && (
                                        <AddFloorBtn
                                            aria-label="층 추가"
                                            onClick={() => setIsAddFloorOpen(true)}
                                        >
                                            +
                                        </AddFloorBtn>
                                    )}
                                </PanelHeader>
                                {isBuildingActive && (
                                    <PanelHint>
                                        활성 건물은 빈 층이 사용자에게 먼저 보일 수 있어 여기서 층 추가를 숨겨두었습니다.
                                    </PanelHint>
                                )}
                                <FloorList>
                                    {floors.map((floor) => (
                                        <FloorItem
                                            key={floor.floorId || `${floor.level}-${floor.name}`}
                                            $active={activeFloorLevel === floor.level}
                                            onClick={() => setActiveFloorLevel(floor.level)}
                                        >
                                            {floor.name}
                                            <StatusDot $hasMap={floor.hasMap} title={floor.hasMap ? '도면 있음' : '도면 없음'} />
                                        </FloorItem>
                                    ))}
                                </FloorList>
                            </SidePanel>

                            <MainViewer>
                                {activeFloor ? (
                                    <FloorplanUploadView
                                        key={activeFloor.floorId || activeFloorLevel}
                                        floorName={activeFloor.name}
                                        floorplanId={activeFloor.floorplanId}
                                        buildingId={submittedBuilding?.id || buildingId}
                                        floorId={activeFloor.floorId}
                                        imageUrl={activeFloor.floorplanImageUrl}
                                        tenantId={tenantId}
                                        onFloorplanUploaded={handleFloorplanUploaded}
                                        onAnalysisCompleted={handleFloorAnalysisCompleted}
                                    />
                                ) : (
                                    <SummaryCard>
                                        <h3>층 정보 없음</h3>
                                        <p>이 건물에는 아직 등록된 층 정보가 없습니다.</p>
                                    </SummaryCard>
                                )}
                            </MainViewer>
                        </ContentLayout>
                    </>
                )}
            </Container>
            {isAddFloorOpen && (
                <ModalOverlay onClick={() => setIsAddFloorOpen(false)}>
                    <ModalContainer onClick={(e) => e.stopPropagation()}>
                        <h4>층 추가</h4>
                        <form onSubmit={handleAddFloorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <FormField>
                                <label htmlFor="newFloorLevel">층 레벨 (숫자)</label>
                                <input
                                    id="newFloorLevel"
                                    type="number"
                                    placeholder="예: 2 (지하는 -1)"
                                    value={newFloorLevel}
                                    onChange={(e) => handleLevelChange(e.target.value)}
                                    required
                                />
                            </FormField>
                            <FormField>
                                <label htmlFor="newFloorName">층 이름 (표시 이름)</label>
                                <input
                                    id="newFloorName"
                                    type="text"
                                    placeholder="예: 2F, B1"
                                    value={newFloorName}
                                    onChange={(e) => setNewFloorName(e.target.value)}
                                    required
                                />
                            </FormField>
                            <ButtonRow>
                                <Button type="button" variant="secondary" onClick={() => setIsAddFloorOpen(false)}>
                                    취소
                                </Button>
                                <Button type="submit" variant="primary">
                                    추가
                                </Button>
                            </ButtonRow>
                        </form>
                    </ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    )
}
