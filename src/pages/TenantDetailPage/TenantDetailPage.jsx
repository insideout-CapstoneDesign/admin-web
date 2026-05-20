import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BuildingModal from '../../components/Modal/BuildingModal'
import FloorplanUploadView from '../../components/Upload/FloorplanUploadView'
import {
    ActionButtons,
    AddButton,
    BackButton,
    BuildingLink,
    Container,
    HeaderArea,
    MapPanel,
    PageWrapper,
    SearchContainer,
    SearchIcon,
    SearchInput,
    TabBar,
    TabButton,
    Table,
    TableContainer,
    Td,
    Th,
    Title,
    Toolbar,
    Tr,
} from './TenantDetailPage.styles'

const mockBuildings = [
    { id: 101, name: '신공학관', floors: 9, plans: 4 },
    { id: 102, name: '명진관', floors: 4, plans: 4 },
    { id: 103, name: '중앙도서관', floors: 5, plans: 2 },
]

const tenantNameById = {
    1: '동국대학교',
    2: '신세계백화점 본점',
    3: '한양대학교',
}

export default function TenantDetailPage() {
    const { tenantId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('buildings')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const tenantName = tenantNameById[tenantId] ?? '알 수 없는 단지'

    return (
        <PageWrapper>
            <Container>
                <HeaderArea>
                    <BackButton onClick={() => navigate('/dashboard')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        대시보드로 돌아가기
                    </BackButton>
                    <Title>{tenantName} 단지 관리</Title>
                </HeaderArea>

                <TabBar>
                    <TabButton
                        $active={activeTab === 'buildings'}
                        onClick={() => setActiveTab('buildings')}
                    >
                        건물 목록
                    </TabButton>
                    <TabButton
                        $active={activeTab === 'map'}
                        onClick={() => setActiveTab('map')}
                    >
                        단지 전도(캠퍼스 맵) 관리
                    </TabButton>
                </TabBar>

                {activeTab === 'buildings' && (
                    <>
                        <Toolbar>
                            <SearchContainer>
                                <SearchIcon fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </SearchIcon>
                                <SearchInput type="text" placeholder="건물명 검색" />
                            </SearchContainer>
                            <AddButton variant="primary" onClick={() => setIsModalOpen(true)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                건물 추가
                            </AddButton>
                        </Toolbar>

                        <TableContainer>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>건물명</Th>
                                        <Th>층 수</Th>
                                        <Th>등록된 도면 수</Th>
                                        <Th>관리</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockBuildings.map((item) => (
                                        <Tr key={item.id} onClick={() => navigate(`/building/${item.id}`)}>
                                            <Td style={{ color: 'var(--black-900)' }}>
                                                <BuildingLink
                                                    to={`/building/${item.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {item.name}
                                                </BuildingLink>
                                            </Td>
                                            <Td>{item.floors}층</Td>
                                            <Td>{item.plans}개</Td>
                                            <Td>
                                                <ActionButtons onClick={(e) => e.stopPropagation()}>
                                                    <button aria-label="수정">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button className="delete" aria-label="삭제">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </ActionButtons>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {activeTab === 'map' && (
                    <MapPanel>
                        <FloorplanUploadView floorName="캠퍼스 맵" />
                    </MapPanel>
                )}
            </Container>

            <BuildingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitSuccess={(building) => navigate(`/building/${building.id}`, {
                    state: { building },
                })}
            />
        </PageWrapper>
    )
}
