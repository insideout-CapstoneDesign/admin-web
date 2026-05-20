import { useState } from 'react'
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
