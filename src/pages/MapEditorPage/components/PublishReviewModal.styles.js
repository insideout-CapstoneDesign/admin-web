import styled from 'styled-components'

export const PublishReviewOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.48);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1200;
`

export const PublishReviewModalShell = styled.div`
    width: min(1200px, 100%);
    max-height: calc(100vh - 48px);
    background: #ffffff;
    border-radius: 28px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 40px 120px -48px rgba(15, 23, 42, 0.55);
    display: flex;
    flex-direction: column;
    overflow: hidden;
`

export const PublishReviewHeader = styled.div`
    padding: 24px 28px 18px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;

    h3 {
        margin: 0;
        font-size: 28px;
        color: var(--black-900);
    }

    p {
        margin: 8px 0 0;
        font-size: 14px;
        line-height: 1.6;
        color: var(--gray-600);
        max-width: 760px;
    }
`

export const PublishReviewBody = styled.div`
    display: grid;
    grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
    min-height: 0;
    flex: 1;

    @media (max-width: 1080px) {
        grid-template-columns: 1fr;
    }
`

export const PublishReviewSidebar = styled.div`
    border-right: 1px solid rgba(148, 163, 184, 0.16);
    padding: 22px;
    overflow: auto;

    @media (max-width: 1080px) {
        border-right: none;
        border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    }
`

export const PublishReviewContent = styled.div`
    padding: 22px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
`

export const PublishReviewSummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`

export const PublishReviewSummaryCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 18px;
    padding: 16px;
    background: ${({ $tone }) => {
        if ($tone === 'danger') return 'rgba(254, 242, 242, 0.92)'
        if ($tone === 'success') return 'rgba(236, 253, 245, 0.92)'
        return 'rgba(248, 250, 252, 0.92)'
    }};

    strong {
        display: block;
        font-size: 24px;
        line-height: 1;
        color: var(--black-900);
        margin-bottom: 8px;
    }

    span {
        font-size: 13px;
        font-weight: 700;
        color: var(--gray-600);
    }
`

export const PublishRequirementNotice = styled.div`
    border-radius: 18px;
    padding: 16px 18px;
    border: 1px solid ${({ $tone }) => ($tone === 'danger' ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.2)')};
    background: ${({ $tone }) => ($tone === 'danger' ? 'rgba(254, 242, 242, 0.9)' : 'rgba(236, 253, 245, 0.9)')};
    color: ${({ $tone }) => ($tone === 'danger' ? '#b91c1c' : '#047857')};
    font-size: 13px;
    line-height: 1.6;
    font-weight: 700;
`

export const PublishPoiList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 14px;
`

export const PublishPoiItem = styled.button`
    width: 100%;
    text-align: left;
    border-radius: 18px;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.24)' : 'rgba(148, 163, 184, 0.16)')};
    background: ${({ $active }) => ($active ? 'rgba(239, 246, 255, 0.92)' : 'rgba(255,255,255,0.98)')};
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
`

export const PublishPoiItemTop = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;

    strong {
        font-size: 15px;
        color: var(--black-900);
    }
`

export const PublishPoiMeta = styled.div`
    font-size: 12px;
    line-height: 1.5;
    color: var(--gray-600);
`

export const PublishStatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    background: ${({ $status }) => {
        if ($status === 'confirmed') return 'rgba(16, 185, 129, 0.12)'
        if ($status === 'excluded') return 'rgba(148, 163, 184, 0.16)'
        return 'rgba(245, 158, 11, 0.14)'
    }};
    color: ${({ $status }) => {
        if ($status === 'confirmed') return '#047857'
        if ($status === 'excluded') return '#475569'
        return '#b45309'
    }};
`

export const PublishDetailCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 22px;
    background: rgba(248, 250, 252, 0.96);
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`

export const PublishDetailHeader = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;

    h4 {
        margin: 0;
        font-size: 22px;
        color: var(--black-900);
    }

    p {
        margin: 8px 0 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--gray-600);
    }
`

export const PublishActionRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`

export const PublishSearchRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
`

export const PublishSearchInput = styled.input`
    height: 46px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.24);
    padding: 0 14px;
    font-size: 14px;
    color: var(--black-900);
    background: #ffffff;
    outline: none;

    &:focus {
        border-color: rgba(59, 130, 246, 0.34);
    }
`

export const PublishSearchResults = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`

export const PublishSearchResultCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: #ffffff;
    border-radius: 18px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`

export const PublishSearchResultMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        font-size: 15px;
        color: var(--black-900);
    }

    span {
        font-size: 12px;
        line-height: 1.5;
        color: var(--gray-600);
    }
`

export const PublishReviewFooter = styled.div`
    border-top: 1px solid rgba(148, 163, 184, 0.16);
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    background: rgba(255,255,255,0.98);

    @media (max-width: 860px) {
        flex-direction: column;
        align-items: stretch;
    }
`

export const PublishFooterHint = styled.div`
    font-size: 13px;
    line-height: 1.6;
    color: var(--gray-600);
`

export const PublishSectionTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    h3 {
        margin: 0;
        font-size: 18px;
        color: var(--black-900);
    }

    span {
        font-size: 13px;
        font-weight: 700;
        color: var(--gray-500);
    }
`

export const PublishHelpText = styled.div`
    font-size: 13px;
    line-height: 1.6;
    color: var(--gray-600);
`

export const PublishDetailGrid = styled.div`
    display: grid;
    grid-template-columns: 140px minmax(0, 1fr);
    gap: 10px 18px;
`

export const PublishDetailLabel = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-500);
`

export const PublishDetailValue = styled.div`
    font-size: 14px;
    color: var(--black-900);
    line-height: 1.6;
`

export const PublishLoadingCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 22px;
    background: rgba(248, 250, 252, 0.96);
    padding: 28px 18px;
    text-align: center;
    font-size: 14px;
    color: var(--gray-600);
`

export const PublishErrorCard = styled(PublishLoadingCard)`
    color: #b91c1c;
`
