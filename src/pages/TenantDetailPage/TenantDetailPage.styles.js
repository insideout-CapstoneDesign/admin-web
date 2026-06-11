import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'

export const PageWrapper = styled.div`
    width: 100%;
    min-height: calc(100vh - 65px);
    background-color: var(--white);
`

export const Container = styled.div`
    width: 100%;
    max-width: 1520px;
    margin: 0 auto;
    padding: 32px 28px 40px;
`

export const HeaderArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
`

export const BackButton = styled.button`
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

export const Title = styled.h1`
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 800;
    color: var(--black-900);
    margin: 0;
`

export const TabBar = styled.div`
    display: flex;
    gap: 32px;
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 24px;
`

export const TabButton = styled.button`
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

export const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
`

export const SearchContainer = styled.div`
    flex: 1;
    max-width: 400px;
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
    height: 48px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: var(--radius-8);
    font-size: 16px;
`

export const TableContainer = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
`

export const MapPanel = styled.div`
    background-color: var(--white);
    padding: 20px;
    border-radius: var(--radius-12);
    border: 1px solid var(--gray-200);
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

export const BuildingLink = styled(Link)`
    color: inherit;
    text-decoration: none;
    font-weight: var(--fw-bold);

    &:hover {
        color: var(--blue-500);
    }

    &:focus-visible {
        outline: 2px solid var(--blue-500);
        outline-offset: 3px;
        border-radius: 4px;
    }
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

        &:hover {
            color: var(--blue-500);
        }

        &.delete:hover {
            color: var(--red-500, #ef4444);
        }

        &.disabled {
            opacity: 0.4;
            cursor: not-allowed;

            &:hover {
                color: inherit;
            }

            &.delete:hover {
                color: inherit;
            }
        }

        &.status-btn {
            font-family: var(--font-sans);
            font-size: 12.5px;
            font-weight: var(--fw-semibold);
            padding: 5px 12px;
            border-radius: var(--radius-6, 6px);
            border: 1px solid transparent;
            transition: all 0.18s ease;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            color: inherit;

            &.activate {
                background-color: var(--blue-500);
                color: white;
                border-color: var(--blue-500);
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);

                &:hover {
                    background-color: var(--blue-600, #2563eb);
                    border-color: var(--blue-600, #2563eb);
                    color: white;
                }
            }

            &.deactivate {
                background-color: transparent;
                color: var(--gray-500);
                border-color: var(--gray-300);

                &:hover {
                    background-color: rgba(239, 68, 68, 0.06);
                    border-color: var(--red-400, #f87171);
                    color: var(--red-500, #ef4444);
                }
            }
        }
    }
`
