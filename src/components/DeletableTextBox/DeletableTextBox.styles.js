import styled from 'styled-components'

export const Wrapper = styled.div`
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-16);
    padding: 6px 10px 6px 12px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    background-color: var(--white);
`

export const Text = styled.span`
    min-width: 0;
    color: var(--black-900);
    font-size: var(--text-16);
    font-weight: var(--fw-medium);
    line-height: 1.3;
    overflow-wrap: anywhere;
`
