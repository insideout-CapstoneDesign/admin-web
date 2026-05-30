import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import BuildingModal from '../../components/Modal/BuildingModal'
import CampusModal from '../../components/Modal/CampusModal'
import FloorplanUploadView from '../../components/Upload/FloorplanUploadView'
import Button from '../../components/Button/Button'
import { getCampusesApi, createCampusApi } from '../../api/campusApi'
import { getMyTenantsApi } from '../../api/tenantApi'
import { getBuildingsApi } from '../../api/buildingApi'
import styled from 'styled-components'

const NoCampusContainer = styled.div`
    background: var(--white);
    border: 1px dashed var(--gray-300);
    border-radius: var(--radius-12);
    padding: 40px;
    text-align: center;
    max-width: 600px;
    margin: 40px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    h3 {
        margin: 0;
        font-size: 18px;
        color: var(--black-900);
    }

    p {
        margin: 0;
        font-size: 14px;
        color: var(--gray-500);
        line-height: 1.6;
    }
`

const CampusSummaryCard = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12, 12px);
    padding: 20px 24px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.05);
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fadeIn 0.2s ease-out;
`

const SummaryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-100);
    padding-bottom: 12px;
`

const SummaryTitle = styled.h3`
    font-size: 15.5px;
    font-weight: 700;
    color: var(--black-900);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
`

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;

    @media (max-width: 980px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`

const SummaryItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
        font-size: 12px;
        color: var(--gray-500);
        font-weight: 500;
    }

    .value {
        font-size: 14px;
        color: var(--black-900);
        font-weight: 600;
    }
`

const FlowInfoCard = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12, 12px);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);

    h4 {
        margin: 0;
        font-size: 18px;
        color: var(--black-900);
    }

    p {
        margin: 0;
        color: var(--gray-600);
        line-height: 1.7;
        font-size: 14px;
    }
`

const FlowBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: ${({ $variant }) => ($variant === 'floorplan' ? 'rgba(59, 130, 246, 0.10)' : 'rgba(16, 185, 129, 0.10)')};
    color: ${({ $variant }) => ($variant === 'floorplan' ? 'var(--blue-600)' : 'var(--green-700)')};
`

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: ${({ $status }) => ($status === 'active' ? 'rgba(16, 185, 129, 0.10)' : 'rgba(245, 158, 11, 0.12)')};
    color: ${({ $status }) => ($status === 'active' ? 'var(--green-700)' : 'var(--orange-700, #b45309)')};
`

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

export default function TenantDetailPage() {
    const { tenantId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCampusModalOpen, setIsCampusModalOpen] = useState(false)
    const [campus, setCampus] = useState(null)
    const [buildings, setBuildings] = useState([])
    const [tenantName, setTenantName] = useState(location.state?.tenantName || '')
    const [loading, setLoading] = useState(true)
    const [buildingsLoading, setBuildingsLoading] = useState(true)
    const [error, setError] = useState('')

    const loadCampus = async () => {
        setLoading(true)
        setError('')
        setActiveTab('map')
        try {
            const campuses = await getCampusesApi(tenantId)
            if (campuses && campuses.length > 0) {
                setCampus(campuses[0])
                setActiveTab('buildings')
            } else {
                setCampus(null)
            }
        } catch (err) {
            console.error(err)
            setError('캠퍼스 정보를 불러오는 중 오류가 발생했습니다: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchTenantAndBuildings = async () => {
        setBuildingsLoading(true)
        try {
            if (!tenantName) {
                const tenants = await getMyTenantsApi()
                const currentTenant = tenants.find(t => t.tenantId === tenantId)
                if (currentTenant) {
                    setTenantName(currentTenant.displayName)
                }
            }
            const buildingData = await getBuildingsApi(tenantId)
            setBuildings(buildingData || [])
        } catch (err) {
            console.error('건물 목록 또는 테넌트 상세 로드 실패:', err)
        } finally {
            setBuildingsLoading(false)
        }
    }

    useEffect(() => {
        loadCampus()
        fetchTenantAndBuildings()
    }, [tenantId])

    const isCampusFlowReady = activeTab !== null

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

                {isCampusFlowReady ? (
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
                ) : (
                    <div
                        style={{
                            height: '49px',
                            borderBottom: '1px solid var(--gray-200)',
                            marginBottom: '36px',
                        }}
                    />
                )}

                {isCampusFlowReady && activeTab === 'buildings' && (
                    <>
                        {!campus ? (
                            <NoCampusContainer>
                                <h3>먼저 단지를 등록해주세요</h3>
                                <p>건물은 단지 지리 정보와 Gate를 먼저 등록한 뒤 추가할 수 있습니다.</p>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setActiveTab('map')
                                        setIsCampusModalOpen(true)
                                    }}
                                >
                                    단지 등록하기
                                </Button>
                            </NoCampusContainer>
                        ) : (
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
                                        <Th>운영 방식</Th>
                                        <Th>활성화 상태</Th>
                                        <Th>등록된 도면 수</Th>
                                        <Th>관리</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buildingsLoading ? (
                                        <Tr>
                                            <Td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                                                건물 목록 로딩 중...
                                            </Td>
                                        </Tr>
                                    ) : buildings.length === 0 ? (
                                        <Tr>
                                            <Td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                                                등록된 건물이 없습니다.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        buildings.map((item) => (
                                            <Tr
                                                key={item.id}
                                                onClick={() => navigate(`/building/${item.id}?tenantId=${tenantId}`, { state: { building: item, campus } })}
                                            >
                                                <Td style={{ color: 'var(--black-900)' }}>
                                                    <BuildingLink
                                                        to={`/building/${item.id}?tenantId=${tenantId}`}
                                                        state={{ building: item, campus }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {item.name}
                                                    </BuildingLink>
                                                </Td>
                                                <Td>
                                                    <FlowBadge $variant={item.requiresFloorplan ? 'floorplan' : 'manual'}>
                                                        {item.requiresFloorplan ? '도면 기반' : '도면 없음'}
                                                    </FlowBadge>
                                                </Td>
                                                <Td>
                                                    <StatusBadge $status={item.activationStatus}>
                                                        {item.activationStatus === 'active' ? '활성' : '준비 중'}
                                                    </StatusBadge>
                                                </Td>
                                                <Td>{item.floors?.length || 0}개</Td>
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
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </TableContainer>
                            </>
                        )}
                    </>
                )}
 
                {isCampusFlowReady && activeTab === 'map' && (
                    <MapPanel>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                로딩 중...
                            </div>
                        ) : error ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
                                {error}
                            </div>
                        ) : !campus ? (
                            <NoCampusContainer>
                                <h3>단지 지리 정보 등록 필요</h3>
                                <p>먼저 지도에서 단지 경계와 여러 Gate를 등록하고, 이 단지가 도면 기반 길찾기가 필요한지 여부를 선택해주세요.</p>
                                <Button variant="primary" onClick={() => setIsCampusModalOpen(true)}>
                                    단지 지리 정보 등록하기
                                </Button>
                            </NoCampusContainer>
                        ) : (
                            <>
                                <CampusSummaryCard>
                                        <SummaryHeader>
                                            <SummaryTitle>
                                            등록된 단지 지리 정보
                                            </SummaryTitle>
                                        <Button 
                                            variant="outlineGray" 
                                            size="sm" 
                                            onClick={() => setIsCampusModalOpen(true)}
                                            style={{ height: '32px', fontSize: '12.5px', padding: '0 12px' }}
                                        >
                                            지리 정보 수정
                                        </Button>
                                    </SummaryHeader>
                                    <SummaryGrid>
                                        <SummaryItem>
                                            <span className="label">단지/캠퍼스명</span>
                                            <span className="value">{campus.name}</span>
                                        </SummaryItem>
                                        <SummaryItem>
                                            <span className="label">대표 주소</span>
                                            <span className="value">{campus.address || '주소 없음'}</span>
                                        </SummaryItem>
                                        <SummaryItem>
                                            <span className="label">등록된 Gate</span>
                                            <span className="value">{campus.gates?.length || 0}개</span>
                                        </SummaryItem>
                                        <SummaryItem>
                                            <span className="label">도면 기반 길찾기</span>
                                            <span className="value">{campus.requiresFloorplan ? '필요' : '불필요'}</span>
                                        </SummaryItem>
                                    </SummaryGrid>
                                </CampusSummaryCard>

                                {campus.requiresFloorplan ? (
                                    <FloorplanUploadView
                                        floorName="캠퍼스 맵"
                                        isCampus={true}
                                        campusId={campus.id}
                                        campusMapId={campus.currentMapId}
                                        tenantId={tenantId}
                                        campus={campus}
                                    />
                                ) : (
                                    <FlowInfoCard>
                                        <h4>이 단지는 도면 업로드 없이 운영되는 흐름입니다.</h4>
                                        <p>
                                            현재 등록된 Campus Gate를 기준으로 이후 <strong>건물 등록</strong>과
                                            <strong> 건물 출입구 매핑</strong>을 진행하면 됩니다.
                                            캠퍼스 맵 AI 분석은 이 단지에서 필수 단계가 아닙니다.
                                        </p>
                                        <p>
                                            다음 구현 단계에서는 각 건물 1층 출입구를 만들고,
                                            여기서 등록한 Gate와 1:1로 연결한 뒤 길찾기를 활성화하게 됩니다.
                                        </p>
                                        <div>
                                            <Button variant="primary" onClick={() => setActiveTab('buildings')}>
                                                건물 등록 단계로 이동
                                            </Button>
                                        </div>
                                    </FlowInfoCard>
                                )}

                            </>
                        )}
                    </MapPanel>
                )}
            </Container>
 
            <BuildingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tenantId={tenantId}
                campusId={campus?.id}
                campus={campus}
                onSubmitSuccess={(building) => {
                    fetchTenantAndBuildings();
                    navigate(`/building/${building.id}?tenantId=${tenantId}`, { state: { building } });
                }}
            />

            <CampusModal
                isOpen={isCampusModalOpen}
                onClose={() => setIsCampusModalOpen(false)}
                tenantId={tenantId}
                initialCampus={campus}
                onSuccess={(savedCampus) => {
                    setCampus(savedCampus);
                    setActiveTab('buildings');
                }}
            />
        </PageWrapper>
    )
}
