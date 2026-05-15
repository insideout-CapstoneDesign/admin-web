import { useState } from 'react'
import styled from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import BuildingModal from '../../components/Modal/BuildingModal'
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

const Title = styled.h1`
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 800;
    color: var(--black-900);
    margin: 0;
`

/* ── Tabs ── */
const TabBar = styled.div`
    display: flex;
    gap: 32px;
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 24px;
`

const TabButton = styled.button`
    background: none;
    border: none;
    padding: 12px 0;
    font-family: var(--font-sans);
    font-size: var(--text-16);
    font-weight: var(--fw-semibold);
    color: ${({ $active }) => ($active ? 'var(--blue-500)' : 'var(--gray-500)')};
    cursor: pointer;
    position: relative;
    transition: color 0.2s;

    &:after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--blue-500);
        display: ${({ $active }) => ($active ? 'block' : 'none')};
    }

    &:hover {
        color: ${({ $active }) => ($active ? 'var(--blue-500)' : 'var(--gray-900)')};
    }
`

/* ── Tab: Building List ── */
const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
`

const SearchContainer = styled.div`
    flex: 1;
    max-width: 400px;
    position: relative;
    display: flex;
    align-items: center;
`

const SearchIcon = styled.svg`
    position: absolute;
    left: 16px;
    width: 20px;
    height: 20px;
    color: var(--gray-400);
`

const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 16px 0 44px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    font-family: var(--font-sans);
    font-size: var(--text-14);
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: var(--blue-500);
    }
    &::placeholder {
        color: var(--gray-400);
    }
`

const AddButton = styled(Button)`
    height: 48px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: var(--radius-8);
    font-size: 16px;
`

const TableContainer = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
`

const MapPanel = styled.div`
    background-color: var(--white);
    padding: 20px;
    border-radius: var(--radius-12);
    border: 1px solid var(--gray-200);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
`

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`

const Th = styled.th`
    background: var(--gray-50);
    padding: 16px 24px;
    text-align: left;
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-bold);
    color: var(--black-900);
    border-bottom: 1px solid var(--gray-200);
`

const Td = styled.td`
    padding: 16px 24px;
    text-align: left;
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-medium);
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-100);
`

const Tr = styled.tr`
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
        background-color: var(--gray-50);
    }
    &:last-child ${Td} {
        border-bottom: none;
    }
`

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    color: var(--gray-400);

    button {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;

        &:hover {
            color: var(--blue-500);
        }
        &.delete:hover {
            color: var(--red-500, #ef4444);
        }
    }
`

/* ── Mock Data ── */
const mockBuildings = [
    { id: 101, name: '신공학관', floors: 9, plans: 4 },
    { id: 102, name: '명진관', floors: 4, plans: 4 },
    { id: 103, name: '중앙도서관', floors: 5, plans: 2 },
]

export default function TenantDetailPage() {
    const { tenantId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('buildings') // 'buildings' | 'map'
    const [isModalOpen, setIsModalOpen] = useState(false)

    // 실제로는 tenantId로 단지 정보를 조회함. 여기선 더미 처리
    const tenantName = tenantId === '3' ? '한양대학교' : '동국대학교'

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
                                            <Td style={{ fontWeight: 'var(--fw-bold)', color: 'var(--black-900)' }}>
                                                {item.name}
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
