import { useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FloorplanUploadView from '../../components/Upload/FloorplanUploadView'
import {
    AddFloorBtn,
    BackButton,
    Container,
    ContentLayout,
    FloorItem,
    FloorList,
    HeaderArea,
    MainViewer,
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

function createMockFloorIds(buildingId, level) {
    const normalizedLevel = level < 0 ? `b${Math.abs(level)}` : `${level}f`

    return {
        floorId: `mock-floor-${buildingId}-${normalizedLevel}`,
        floorplanId: `mock-floorplan-${buildingId}-${normalizedLevel}`,
    }
}

function createFloorViewModel({ buildingId, level, name, hasMap = false, floorId, floorplanId, floorplanImageUrl = null }) {
    const mockIds = createMockFloorIds(buildingId, level)
    const resolvedHasMap = Boolean(floorplanImageUrl) || hasMap

    return {
        level,
        name: name || formatFloorLabel(level),
        hasMap: resolvedHasMap,
        floorId: floorId || mockIds.floorId,
        floorplanId: floorplanId || null,
        floorplanImageUrl: floorplanImageUrl || null,
    }
}

const fallbackFloors = [
    createFloorViewModel({ buildingId: '101', level: 3, name: '3층', hasMap: false, floorplanId: 'mock-floorplan-101-3f' }),
    createFloorViewModel({ buildingId: '101', level: 2, name: '2층', hasMap: true, floorplanId: 'mock-floorplan-101-2f' }),
    createFloorViewModel({ buildingId: '101', level: 1, name: '1층', hasMap: false, floorplanId: 'mock-floorplan-101-1f' }),
    createFloorViewModel({ buildingId: '101', level: -1, name: 'B1층', hasMap: false, floorplanId: 'mock-floorplan-101-b1' }),
]

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

    const submittedBuilding = location.state?.building
    const [floors, setFloors] = useState(() => {
        if (submittedBuilding?.floors == null) {
            return fallbackFloors
        }

        return [...submittedBuilding.floors]
            .sort((a, b) => b.level - a.level)
            .map((floor) => createFloorViewModel({
                buildingId: submittedBuilding.id || buildingId || 'new-building',
                level: floor.level,
                name: formatFloorLabel(floor.level),
                hasMap: Boolean(floor.floorplanImageUrl),
                floorId: floor.floorId || floor.id,
                floorplanId: floor.floorplanId,
                floorplanImageUrl: floor.floorplanImageUrl,
            }))
    })
    const [activeFloorLevel, setActiveFloorLevel] = useState(() => floors[0]?.level ?? 1)

    const buildingName = submittedBuilding?.name || (buildingId === '101' ? '신공학관' : '새 건물')
    const activeFloor = floors.find((floor) => floor.level === activeFloorLevel) || floors[0]
    const uploadedFloorCount = floors.filter((floor) => Boolean(floor.floorplanImageUrl)).length
    const totalFloorCount = floors.length
    const progressSteps = useMemo(() => {
        return [
            { done: totalFloorCount > 0, label: '층 준비' },
            { done: totalFloorCount > 0 && uploadedFloorCount === totalFloorCount, label: '도면 업로드' },
            { done: false, label: 'AI 분석' },
            { done: false, label: '맵 에디터' },
        ]
    }, [totalFloorCount, uploadedFloorCount])

    const handleFloorplanUploaded = (uploadedFloorplan) => {
        if (!activeFloor?.floorId) return

        setFloors((current) => current.map((floor) => (
            floor.floorId === activeFloor.floorId
                ? {
                    ...floor,
                    hasMap: Boolean(uploadedFloorplan.imageUrl),
                    floorplanId: uploadedFloorplan.id,
                    floorplanImageUrl: uploadedFloorplan.imageUrl,
                }
                : floor
        )))
    }

    return (
        <PageWrapper>
            <Container>
                <HeaderArea>
                    <BackButton onClick={() => navigate(-1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        이전으로 돌아가기
                    </BackButton>
                    <TitleRow>
                        <Title>{buildingName} 도면 관리</Title>
                    </TitleRow>
                </HeaderArea>

                <SummaryCard style={{ marginBottom: '24px' }}>
                    <h3>도면 준비</h3>
                    <p>층별 도면을 올리고 AI 분석까지 마치면 다음 단계에서 맵 에디터로 이어집니다.</p>
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
                            <AddFloorBtn aria-label="층 추가">+</AddFloorBtn>
                        </PanelHeader>
                        <FloorList>
                            {floors.map((floor) => (
                                <FloorItem
                                    key={floor.floorId}
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
                        <FloorplanUploadView
                            key={activeFloor?.floorId || activeFloorLevel}
                            floorName={activeFloor?.name}
                            floorplanId={activeFloor?.floorplanId}
                            buildingId={submittedBuilding?.id || buildingId}
                            floorId={activeFloor?.floorId}
                            imageUrl={activeFloor?.floorplanImageUrl}
                            tenantId={submittedBuilding?.tenantId}
                            onFloorplanUploaded={handleFloorplanUploaded}
                        />
                    </MainViewer>
                </ContentLayout>
            </Container>
        </PageWrapper>
    )
}
