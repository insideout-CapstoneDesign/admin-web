import styled from 'styled-components'
import Button from '../../components/Button/Button'

export const PageWrapper = styled.div`
    width: 100%;
    min-height: calc(100vh - 65px);
    background-color: var(--white);
`

export const Container = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 32px;
`

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 32px;
`

export const StatCard = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
`

export const StatLabel = styled.span`
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-semibold);
    color: var(--gray-600);
`

export const StatValueRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 4px;
`

export const StatNumber = styled.span`
    font-family: var(--font-sans);
    font-size: 36px;
    font-weight: var(--fw-bold);
    color: var(--blue-500);
`

export const StatUnit = styled.span`
    font-family: var(--font-sans);
    font-size: var(--text-16);
    font-weight: var(--fw-medium);
    color: var(--gray-500);
`

export const Toolbar = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
`

export const SearchContainer = styled.div`
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
`

export const SearchIcon = styled.svg`
    position: absolute;
    left: 16px;
    width: 20px;
    height: 20px;
    color: var(--gray-400);
`

export const SearchInput = styled.input`
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

export const AddButton = styled(Button)`
    width: 48px;
    height: 48px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-8);
    font-size: 24px;
`

export const TableContainer = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
`

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`

export const Th = styled.th`
    background: var(--gray-50);
    padding: 16px 24px;
    text-align: left;
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-bold);
    color: var(--black-900);
    border-bottom: 1px solid var(--gray-200);
`

export const Td = styled.td`
    padding: 16px 24px;
    text-align: left;
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-medium);
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-100);
`

export const Tr = styled.tr`
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--gray-50);
    }

    &:last-child ${Td} {
        border-bottom: none;
    }
`

export const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: var(--fw-bold);
    background-color: ${({ $status }) => ($status === '승인' ? '#dcfce7' : '#fef08a')};
    color: ${({ $status }) => ($status === '승인' ? '#166534' : '#854d0e')};
`

export const ActionButtons = styled.div`
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

        &:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }

        &:hover {
            color: var(--blue-500);
        }

        &.delete:hover {
            color: var(--red-500, #ef4444);
        }

        &.cancel-sub {
            font-family: var(--font-sans);
            font-size: 13px;
            font-weight: var(--fw-semibold);
            padding: 6px 12px;
            border: 1px solid var(--gray-200);
            border-radius: var(--radius-6, 6px);
            background-color: var(--gray-50);
            color: var(--gray-500);
            cursor: pointer;
            transition: all 0.2s ease;
            
            &.disabled {
                opacity: 0.6;
                background-color: var(--gray-100);
                color: var(--gray-400);
                border-color: var(--gray-200);
                cursor: pointer;
                
                &:hover {
                    background-color: var(--gray-200);
                    color: var(--gray-600);
                }
            }

            &.activate-btn {
                background-color: var(--blue-500);
                color: var(--white);
                border-color: var(--blue-500);
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);

                &:hover {
                    background-color: var(--blue-600);
                    border-color: var(--blue-600);
                    color: var(--white);
                }
            }
        }
    }
`
