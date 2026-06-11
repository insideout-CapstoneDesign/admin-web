import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TenantModal from '../../components/Modal/TenantModal'
import { getMyTenantsApi, activateTenantApi, deactivateTenantApi } from '../../api/tenantApi'
import { getBuildingsApi } from '../../api/buildingApi'
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
    const [pendingSubscriptionByTenant, setPendingSubscriptionByTenant] = useState({})

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

    const totalTenants = tenants.length

    const handleSubscriptionToggle = async (e, tenant) => {
        e.stopPropagation()
        if (!tenant?.tenantId || pendingSubscriptionByTenant[tenant.tenantId]) {
            return
        }

        setPendingSubscriptionByTenant((current) => ({
            ...current,
            [tenant.tenantId]: true,
        }))

        const isApproved = tenant.status === 'approved'

        try {
            if (isApproved) {
                const buildings = await getBuildingsApi(tenant.tenantId)
                const activeBuildings = buildings.filter(b => b.activationStatus === 'active')

                if (activeBuildings.length > 0) {
                    const activeNames = activeBuildings.map(b => b.name).join(', ')
                    alert(`단지 내에 활성화된 건물(${activeNames})이 존재합니다.\n건물들을 먼저 비활성화한 뒤 구독을 취소해 주세요.`)
                    return
                }

                const confirmCancel = window.confirm(`"${tenant.displayName}" 단지의 구독을 취소하시겠습니까?\n구독 취소 시 실시간 내비게이션 기능 이용이 제한될 수 있습니다.`)
                if (!confirmCancel) return

                await deactivateTenantApi(tenant.tenantId)
                alert('구독이 취소되었습니다.')
            } else {
                const confirmActivate = window.confirm(`"${tenant.displayName}" 단지의 구독을 활성화하시겠습니까?`)
                if (!confirmActivate) return

                await activateTenantApi(tenant.tenantId)
                alert('구독이 활성화되었습니다.')
            }
            await fetchTenants()
        } catch (err) {
            console.error(isApproved ? '구독 취소 실패:' : '구독 활성화 실패:', err)
            alert(err.message || (isApproved ? '구독 취소 처리 중 오류가 발생했습니다.' : '구독 활성화 처리 중 오류가 발생했습니다.'))
        } finally {
            setPendingSubscriptionByTenant((current) => ({
                ...current,
                [tenant.tenantId]: false,
            }))
        }
    }

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
                                    <Th>관리</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((item) => {
                                    const isPending = Boolean(pendingSubscriptionByTenant[item.tenantId])
                                    const isApproved = item.status === 'approved'

                                    return (
                                        <Tr key={item.tenantId} onClick={() => navigate(`/tenant/${item.tenantId}`, { state: { tenantName: item.displayName } })}>
                                            <Td style={{ fontWeight: 'var(--fw-bold)', color: 'var(--black-900)' }}>
                                                {item.displayName}
                                            </Td>
                                            <Td>{item.buildingCount ?? 0}개</Td>
                                            <Td>
                                                <ActionButtons onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        className={isApproved ? 'cancel-sub disabled' : 'cancel-sub activate-btn'}
                                                        onClick={(e) => handleSubscriptionToggle(e, item)}
                                                        disabled={isPending}
                                                    >
                                                        {isPending
                                                            ? (isApproved ? '처리 중...' : '활성화 중...')
                                                            : (isApproved ? '구독 취소' : '구독 활성화')}
                                                    </button>
                                                </ActionButtons>
                                            </Td>
                                        </Tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </TableContainer>
                )}
            </Container>

            <TenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTenants} />
        </PageWrapper>
    )
}
