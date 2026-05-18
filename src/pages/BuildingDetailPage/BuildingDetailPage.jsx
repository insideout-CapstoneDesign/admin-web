import { useState } from 'react'
import styled from 'styled-components'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FloorplanUploadView from '../../components/Upload/FloorplanUploadView'

/* ── Layout ── */
const PageWrapper = styled.div`
    width: 100%;
    min-height: calc(100vh - 65px);
    background-color: var(--white);
`

const Container = styled.div`
    width: 100%;
    max-width: 1520px;
    margin: 0 auto;
    padding: 32px 28px 40px;
`

/* ── Header ── */
const HeaderArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
`

const BackButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-medium);
    color: var(--gray-500);
    cursor: pointer;
    align-self: flex-start;
    transition: color 0.2s;

    &:hover {
        color: var(--blue-500);
    }
`

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const Title = styled.h1`
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 800;
    color: var(--black-900);
    margin: 0;
`

/* ── Main Content Area ── */
const ContentLayout = styled.div`
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 24px;
    align-items: start;

    @media (max-width: 1120px) {
        grid-template-columns: 1fr;
    }
`

/* ── Left: Floor List Panel ── */
const SidePanel = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    min-height: 420px;
`

const PanelHeader = styled.div`
    padding: 16px 20px;
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: var(--black-900);
    }
`

const AddFloorBtn = styled.button`
    background: none;
    border: none;
    color: var(--blue-500);
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 0 4px;
    
    &:hover {
        color: var(--blue-700);
    }
`

const FloorList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const FloorItem = styled.button`
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--radius-8);
    border: none;
    background-color: ${({ $active }) => ($active ? 'var(--blue-50)' : 'transparent')};
    color: ${({ $active }) => ($active ? 'var(--blue-600)' : 'var(--gray-700)')};
    font-weight: ${({ $active }) => ($active ? '700' : '500')};
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;

    &:hover {
        background-color: ${({ $active }) => ($active ? 'var(--blue-50)' : 'var(--gray-50)')};
    }
`

const StatusDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $hasMap }) => ($hasMap ? 'var(--green-500)' : 'var(--gray-300)')};
`

/* ── Right: Map Viewer ── */
const MainViewer = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
`

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

function createFloorViewModel({ buildingId, level, name, hasMap = false, floorId, floorplanId }) {
    const mockIds = createMockFloorIds(buildingId, level)

    return {
        level,
        name: name || formatFloorLabel(level),
        hasMap,
        floorId: floorId || mockIds.floorId,
        floorplanId: floorplanId || null,
    }
}

const fallbackFloors = [
    createFloorViewModel({ buildingId: '101', level: 3, name: '3층', hasMap: false, floorplanId: 'mock-floorplan-101-3f' }),
    createFloorViewModel({ buildingId: '101', level: 2, name: '2층', hasMap: true, floorplanId: 'mock-floorplan-101-2f' }),
    createFloorViewModel({ buildingId: '101', level: 1, name: '1층', hasMap: false, floorplanId: 'mock-floorplan-101-1f' }),
    createFloorViewModel({ buildingId: '101', level: -1, name: 'B1층', hasMap: false, floorplanId: 'mock-floorplan-101-b1' }),
]

export default function BuildingDetailPage() {
    const { buildingId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const submittedBuilding = location.state?.building
    const [floors] = useState(() => {
        if (submittedBuilding?.floors == null) {
            return fallbackFloors
        }

        return [...submittedBuilding.floors]
            .sort((a, b) => b.level - a.level)
            .map((floor) => createFloorViewModel({
                buildingId: submittedBuilding.id || buildingId || 'new-building',
                level: floor.level,
                name: formatFloorLabel(floor.level),
                hasMap: floor.floorplanId != null,
                floorId: floor.floorId,
                floorplanId: floor.floorplanId,
            }))
    })
    const [activeFloorLevel, setActiveFloorLevel] = useState(() => floors[0]?.level ?? 1)

    const buildingName = submittedBuilding?.name || (buildingId === '101' ? '신공학관' : '새 건물')
    const activeFloor = floors.find((floor) => floor.level === activeFloorLevel) || floors[0]

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
                        />
                    </MainViewer>
                </ContentLayout>
            </Container>
        </PageWrapper>
    )
}
