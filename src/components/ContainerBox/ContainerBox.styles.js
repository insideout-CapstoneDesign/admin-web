import styled from 'styled-components'

export const Article = styled.article`
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-16);
    padding: 12px 16px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    background-color: var(--white);

    ${({ $selected }) =>
        $selected &&
        `
        background-color: var(--blue-50);
        border-color: var(--green-500);
    `}
`

export const Content = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
`

export const Title = styled.strong`
    color: var(--black-900);
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    line-height: 1.35;
`

export const SubText = styled.span`
    color: var(--gray-500);
    font-size: var(--text-14);
    font-weight: var(--fw-semibold);
    line-height: 1.35;
`

export const Actions = styled.div`
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
`

export const IconButton = styled.button.attrs({ type: 'button' })`
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: ${({ $color }) => $color || 'inherit'};

    svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentcolor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
`
