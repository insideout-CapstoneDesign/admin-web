import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Button from '../../components/Button/Button'
import TenantModal from '../../components/Modal/TenantModal'

/* ── Layout ── */
const PageWrapper = styled.div`
    width: 100%;
    min-height: calc(100vh - 65px);
    background-color: var(--white);
`

const Container = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 32px;
`

/* ── Stats Section ── */
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 32px;
`

const StatCard = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
`

const StatLabel = styled.span`
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-semibold);
    color: var(--gray-600);
`

const StatValueRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 4px;
`

const StatNumber = styled.span`
    font-family: var(--font-sans);
    font-size: 36px;
    font-weight: var(--fw-bold);
    color: var(--blue-500);
`

const StatUnit = styled.span`
    font-family: var(--font-sans);
    font-size: var(--text-16);
    font-weight: var(--fw-medium);
    color: var(--gray-500);
`

/* ── Toolbar Section ── */
const Toolbar = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
`

const SearchContainer = styled.div`
    flex: 1;
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
    width: 48px;
    height: 48px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-8);
    font-size: 24px;
`

/* ── Table Section ── */
const TableContainer = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    overflow: hidden;
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

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: var(--fw-bold);
    background-color: ${({ $status }) => ($status === '승인' ? '#dcfce7' : '#fef08a')};
    color: ${({ $status }) => ($status === '승인' ? '#166534' : '#854d0e')};
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
