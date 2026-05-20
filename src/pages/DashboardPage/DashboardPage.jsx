import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TenantModal from '../../components/Modal/TenantModal'
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

const mockData = [
    { id: 1, name: '동국대학교', buildingCount: 9, visitors: 45, status: '승인' },
    { id: 2, name: '신세계백화점 본점', buildingCount: 4, visitors: 30, status: '대기중' },
    { id: 3, name: '한양대학교', buildingCount: 15, visitors: 120, status: '승인' },
]

export default function DashboardPage() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <PageWrapper>
            <Container>
                <StatsGrid>
                    <StatCard>
                        <StatLabel>등록된 총 단지 수</StatLabel>
                        <StatValueRow>
                            <StatNumber>3</StatNumber>
                            <StatUnit>개</StatUnit>
                        </StatValueRow>
                    </StatCard>
                    <StatCard>
                        <StatLabel>일일 방문자수</StatLabel>
                        <StatValueRow>
                            <StatNumber>195</StatNumber>
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
                            {mockData.map((item) => (
                                <Tr key={item.id} onClick={() => navigate(`/tenant/${item.id}`)}>
                                    <Td style={{ fontWeight: 'var(--fw-bold)', color: 'var(--black-900)' }}>
                                        {item.name}
                                    </Td>
                                    <Td>{item.buildingCount}개</Td>
                                    <Td>{item.visitors}명</Td>
                                    <Td>
                                        <StatusBadge $status={item.status}>{item.status}</StatusBadge>
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
            </Container>

            <TenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </PageWrapper>
    )
}
