import styled from 'styled-components'

const PageBackground = styled.div`
  min-height: 100vh;
  background-color: var(--white);
`

const Container = styled.main`
  width: 100%;
  min-height: 100vh;
  background-color: var(--white);
  padding: 40px;
`

function WebLayout({ children }) {
    return (
        <PageBackground>
            <Container>{children}</Container>
        </PageBackground>
    )
}

export default WebLayout
