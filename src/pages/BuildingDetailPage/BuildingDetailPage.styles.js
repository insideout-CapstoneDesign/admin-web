import styled from 'styled-components'

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

export const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

export const Title = styled.h1`
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 800;
    color: var(--black-900);
    margin: 0;
`

export const ContentLayout = styled.div`
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 24px;
    align-items: start;

    @media (max-width: 1120px) {
        grid-template-columns: 1fr;
    }
`

export const SidePanel = styled.div`
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    min-height: 420px;
`

export const PanelHeader = styled.div`
    padding: 16px 20px;
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: var(--black-900);
    }
`

export const AddFloorBtn = styled.button`
    background: none;
    border: none;
    color: var(--blue-500);
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 0 4px;

    &:hover {
        color: var(--blue-700);
    }
`

export const FloorList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

export const FloorItem = styled.button`
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--radius-8);
    border: none;
    background-color: ${({ $active }) => ($active ? 'var(--blue-50)' : 'transparent')};
    color: ${({ $active }) => ($active ? 'var(--blue-600)' : 'var(--gray-700)')};
    font-weight: ${({ $active }) => ($active ? '700' : '500')};
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;

    &:hover {
        background-color: ${({ $active }) => ($active ? 'var(--blue-50)' : 'var(--gray-50)')};
    }
`

export const StatusDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $hasMap }) => ($hasMap ? 'var(--green-500)' : 'var(--gray-300)')};
`

export const MainViewer = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
`
