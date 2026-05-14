import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

const StyledHeader = styled.header`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background-color: var(--white);
    border-bottom: 1px solid var(--gray-200);
    cursor: pointer;
    
    &:focus-visible {
        outline: 2px solid var(--blue-500);
        outline-offset: -2px;
    }
`

const Logo = styled.img`
    width: 32px;
    height: auto;
`

const Title = styled.span`
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 800;
    color: var(--blue-500);
    letter-spacing: 1px;
`

export default function Header() {
    const navigate = useNavigate()

    return (
        <StyledHeader
            role="button"
            tabIndex={0}
            onClick={() => navigate('/')}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate('/')
                }
            }}
        >
            <Logo src="/logo.svg" alt="INSIDE OUT" />
            <Title>INSIDE OUT</Title>
        </StyledHeader>
    )
}
