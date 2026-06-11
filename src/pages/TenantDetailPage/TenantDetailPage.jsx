import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import BuildingModal from '../../components/Modal/BuildingModal'
import CampusModal from '../../components/Modal/CampusModal'
import FloorplanUploadView from '../../components/Upload/FloorplanUploadView'
import Button from '../../components/Button/Button'
import { getCampusesApi, createCampusApi } from '../../api/campusApi'
import { getMyTenantsApi } from '../../api/tenantApi'
import { getBuildingsApi, deactivateBuildingApi } from '../../api/buildingApi'
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

const ACTIVATION_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: ${({ $status }) => ($status === ACTIVATION_STATUS.ACTIVE ? 'rgba(16, 185, 129, 0.10)' : 'rgba(245, 158, 11, 0.12)')};
    color: ${({ $status }) => ($status === ACTIVATION_STATUS.ACTIVE ? 'var(--green-700)' : 'var(--orange-700, #b45309)')};
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
        setActiveTab(null)
        try {
            const campuses = await getCampusesApi(tenantId)
            if (campuses && campuses.length > 0) {
                setCampus(campuses[0])
                setActiveTab('buildings')
            } else {
                setCampus(null)
                setActiveTab('map')
            }
        } catch (err) {
            console.error(err)
            setCampus(null)
            setActiveTab('map')
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

    const handleStatusToggle = async (e, building) => {
        e.stopPropagation()
        // 활성 상태인 경우만 비활성화 가능 (활성화는 최종 배포를 통해서만 가능)
        if (building.activationStatus !== 'active') return

        const ok = window.confirm(`"${building.name}" 건물을 비활성화하시겠습니까?\n비활성화 시 실시간 서비스 이용이 일시 중단됩니다.`)
        if (!ok) return
        try {
            await deactivateBuildingApi(tenantId, building.id)
            fetchTenantAndBuildings()
        } catch (err) {
            console.error('건물 비활성화 오류:', err)
            alert('비활성화 처리 중 오류가 발생했습니다: ' + err.message)
        }
    }

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
                            단지 관리
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
                                        <Th>활성화 상태</Th>
                                        <Th>등록된 도면 수</Th>
                                        <Th>관리</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buildingsLoading ? (
                                        <Tr>
                                            <Td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                                                건물 목록 로딩 중...
                                            </Td>
                                        </Tr>
                                    ) : buildings.length === 0 ? (
                                        <Tr>
                                            <Td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
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
                                                    <StatusBadge $status={item.activationStatus || ACTIVATION_STATUS.INACTIVE}>
                                                        {(item.activationStatus || ACTIVATION_STATUS.INACTIVE) === ACTIVATION_STATUS.ACTIVE ? '활성' : '준비 중'}
                                                    </StatusBadge>
                                                </Td>
                                                <Td>{item.floors?.length || 0}개</Td>
                                                <Td>
                                                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                                                        {item.activationStatus === 'active' && (
                                                            <button
                                                                className="status-btn deactivate"
                                                                onClick={(e) => handleStatusToggle(e, item)}
                                                            >
                                                                비활성화
                                                            </button>
                                                        )}
                                                        {item.activationStatus === 'inactive' && (
                                                            <span className="status-hint">
                                                                다시 배포 시 활성화
                                                            </span>
                                                        )}
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
                                        <h4>Gate 기반으로 운영되는 단지입니다.</h4>
                                        <p>
                                            캠퍼스 Gate를 등록한 뒤 <strong>건물 등록</strong>과
                                            <strong> 건물 출입구 매핑</strong>만 진행하면 됩니다.
                                        </p>
                                        <p>
                                            캠퍼스 맵 업로드나 AI 분석은 필요하지 않습니다.
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
