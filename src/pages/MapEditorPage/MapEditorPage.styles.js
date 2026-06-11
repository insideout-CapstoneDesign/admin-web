import styled from 'styled-components'
import Button from '../../components/Button/Button'

export const PageWrapper = styled.div`
    min-height: calc(100vh - 72px);
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    padding: 32px 24px 48px;
`

export const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
`

export const HeaderCard = styled.div`
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 24px;
    padding: 24px 28px;
    box-shadow: 0 24px 60px -44px rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(8px);
`

export const BackButton = styled.button`
    border: none;
    background: none;
    color: var(--gray-600);
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 16px;
`

export const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
`

export const TitleGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;

    h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1.1;
        color: var(--black-900);
    }

    p {
        margin: 0;
        color: var(--gray-600);
        font-size: 14px;
        line-height: 1.6;
        max-width: 820px;
    }
`

export const StatusRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`

export const FloorSwitcher = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
`

export const HeaderUtilityRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-top: 14px;
    width: 100%;
`

export const QuickLayerPanel = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: nowrap;
    padding: 16px 18px;
    border-radius: 20px;
    background: rgba(248, 250, 252, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.18);
    width: 100%;
    overflow-x: auto;
`

export const LayerScaleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    flex: none;
`

export const LayerScaleLabel = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: #475569;
`

export const LayerToggleGroup = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    margin-left: auto;
    justify-content: flex-end;
    flex: 1 1 auto;
    min-width: max-content;
`

export const ScaleButtonGroup = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
`

export const ScaleValueButton = styled(Button)`
    width: 120px;
    min-width: 120px;
`

export const FloorChip = styled.button`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.28)' : 'rgba(148, 163, 184, 0.24)')};
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.92)')};
    color: ${({ $active }) => ($active ? '#1d4ed8' : '#475569')};
    border-radius: 999px;
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
`

export const StatusBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: 999px;
    background: ${({ $tone }) => {
        if ($tone === 'draft') return 'rgba(37, 99, 235, 0.12)'
        if ($tone === 'published') return 'rgba(5, 150, 105, 0.12)'
        if ($tone === 'success') return 'rgba(16, 185, 129, 0.12)'
        return 'rgba(148, 163, 184, 0.12)'
    }};
    color: ${({ $tone }) => {
        if ($tone === 'draft') return '#1d4ed8'
        if ($tone === 'published') return '#047857'
        if ($tone === 'success') return '#047857'
        return '#475569'
    }};
    font-size: 12px;
    font-weight: 700;
`

export const ToggleChip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.26)' : 'rgba(148, 163, 184, 0.24)')};
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.92)')};
    color: ${({ $active }) => ($active ? '#1d4ed8' : '#475569')};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
`

export const CanvasCard = styled.div`
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 28px;
    padding: 14px;
    box-shadow: 0 24px 60px -44px rgba(15, 23, 42, 0.42);
    display: flex;
    flex-direction: column;
    gap: 12px;
`

export const WorkspaceLayout = styled.div`
    display: grid;
    grid-template-columns: ${({ $collapsed }) => ($collapsed ? '1fr' : 'minmax(0, 1.85fr) minmax(320px, 420px)')};
    gap: 20px;
    align-items: start;

    @media (max-width: 1180px) {
        grid-template-columns: 1fr;
    }
`

export const EditorCard = styled(CanvasCard)`
    position: sticky;
    top: 24px;
    height: calc(min(82vh, 960px) + 28px);
    min-height: calc(680px + 28px);
    overflow: hidden;

    @media (max-width: 1180px) {
        height: auto;
        min-height: 0;
    }
`

export const EditorHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;

    h2 {
        margin: 0;
        font-size: 24px;
        color: var(--black-900);
    }

    p {
        margin: 0;
        color: var(--gray-600);
        font-size: 13px;
        line-height: 1.6;
    }
`

export const EditorTabs = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
`

export const EditorTabButton = styled.button`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.28)' : 'rgba(148, 163, 184, 0.22)')};
    background: ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.08)' : '#f8fafc')};
    color: ${({ $active }) => ($active ? '#4338ca' : '#475569')};
    border-radius: 14px;
    padding: 12px 10px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        font-size: 13px;
        font-weight: 800;
    }

    span {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.82;
    }
`

export const EditorBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-right: 2px;
`

export const EditorTopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`

export const UnsavedBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
    font-size: 11px;
    font-weight: 800;
`

export const DetailActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`

export const ErrorCard = styled.div`
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(239, 68, 68, 0.18);
    border-radius: 24px;
    padding: 20px 24px;
    color: #b91c1c;
    font-size: 14px;
    line-height: 1.6;
`

export const LoadingCard = styled.div`
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px dashed rgba(148, 163, 184, 0.3);
    color: var(--gray-500);
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
`
