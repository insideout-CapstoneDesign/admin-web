import styled from 'styled-components'
import Button from '../../components/Button/Button'

export const Page = styled.div`
    width: 100%;
    min-height: 100vh;
    background-color: var(--white);
`

export const Hero = styled.section`
    width: 100%;
    padding: 140px 32px 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background: linear-gradient(180deg, var(--blue-50) 0%, var(--white) 100%);
    border-bottom: 1px solid var(--blue-100);
`

export const HeroHeading = styled.h1`
    font-family: var(--font-sans);
    font-size: 40px;
    font-weight: 800;
    color: var(--black-950);
    line-height: 1.35;
    margin: 0 0 64px;
`

export const StartButton = styled(Button)`
    min-width: 200px;
    height: 52px;
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    border-radius: var(--radius-8);
`

export const Features = styled.section`
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    padding: 64px 32px 80px;
`

export const FeaturesTitle = styled.h2`
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 700;
    color: var(--black-950);
    text-align: center;
    margin: 0 0 40px;
`

export const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

export const Card = styled.article`
    padding: 28px 24px;
    border: 1px solid var(--gray-200);
    border-radius: 16px;
    background: var(--white);
`

export const CardIcon = styled.div`
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 20px;
    background-color: ${({ $bg }) => $bg || 'var(--blue-50)'};
`

export const CardTitle = styled.h3`
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 700;
    color: var(--black-950);
    margin: 0 0 8px;
`

export const CardDesc = styled.p`
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 400;
    color: var(--gray-500);
    line-height: 1.6;
    margin: 0;
`
