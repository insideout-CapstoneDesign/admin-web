import styled from 'styled-components'

export const Page = styled.main`
    width: 100%;
    max-width: 424px;
    margin: 0 auto;
    padding: 32px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

export const SectionTitle = styled.h2`
    color: var(--black-900);
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    margin: 24px 0 4px;
`

export const ThreeCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-8);
`

export const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
`

export const Section = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
`
