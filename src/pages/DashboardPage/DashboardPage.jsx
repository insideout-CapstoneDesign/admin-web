import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TenantModal from '../../components/Modal/TenantModal'
import { getMyTenantsApi } from '../../api/tenantApi'
import {
    ActionButtons,
    AddButton,
    Container,
    PageWrapper,
    SearchContainer,
    SearchIcon,
    SearchInput,
    StatCard,
    StatLabel,
    StatNumber,
    StatsGrid,
    StatusBadge,
    StatUnit,
    StatValueRow,
    Table,
    TableContainer,
    Td,
    Th,
    Toolbar,
    Tr,
} from './DashboardPage.styles'

export default function DashboardPage() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tenants, setTenants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchTenants = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getMyTenantsApi()
            setTenants(data || [])
        } catch (err) {
            console.error('단지 목록 로드 실패:', err)
            setError(err.message || '단지 목록을 불러오는 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTenants()
    }, [])

    const getStatusLabel = (status) => {
        if (status === 'approved') return '승인'
        if (status === 'pending') return '대기중'
        return status || '대기중'
    }

    // Dynamic Stats
    const totalTenants = tenants.length
    const totalVisitors = tenants.reduce((acc, cur) => acc + (cur.visitors ?? 0), 0)

    return (
        <PageWrapper>
            <Container>
                <StatsGrid>
                    <StatCard>
                        <StatLabel>등록된 총 단지 수</StatLabel>
                        <StatValueRow>
                            <StatNumber>{totalTenants}</StatNumber>
                            <StatUnit>개</StatUnit>
                        </StatValueRow>
                    </StatCard>
                    <StatCard>
                        <StatLabel>일일 방문자수</StatLabel>
                        <StatValueRow>
                            <StatNumber>{totalVisitors}</StatNumber>
                            <StatUnit>명</StatUnit>
                        </StatValueRow>
                    </StatCard>
                </StatsGrid>

                <Toolbar>
                    <SearchContainer>
                        <SearchIcon fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </SearchIcon>
                        <SearchInput type="text" placeholder="단지 검색" />
                    </SearchContainer>
                    <AddButton variant="primary" onClick={() => setIsModalOpen(true)}>+</AddButton>
                </Toolbar>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--gray-500)' }}>
                        단지 목록 로딩 중...
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--red-500)' }}>
                        {error}
                    </div>
                ) : tenants.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--gray-500)' }}>
                        등록된 단지가 존재하지 않습니다. 우측 상단의 + 버튼을 눌러 새 단지를 등록해 보세요!
                    </div>
                ) : (
                    <TableContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>단지명</Th>
                                    <Th>건물 수</Th>
                                    <Th>방문자수</Th>
                                    <Th>승인여부</Th>
                                    <Th>관리</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((item) => (
                                    <Tr key={item.tenantId} onClick={() => navigate(`/tenant/${item.tenantId}`, { state: { tenantName: item.displayName } })}>
                                        <Td style={{ fontWeight: 'var(--fw-bold)', color: 'var(--black-900)' }}>
                                            {item.displayName}
                                        </Td>
                                        <Td>{item.buildingCount ?? 0}개</Td>
                                        <Td>{item.visitors ?? 0}명</Td>
                                        <Td>
                                            <StatusBadge $status={getStatusLabel(item.status)}>{getStatusLabel(item.status)}</StatusBadge>
                                        </Td>
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
                )}
            </Container>

            <TenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTenants} />
        </PageWrapper>
    )
}

