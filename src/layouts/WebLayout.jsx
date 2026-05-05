import styled from 'styled-components'

const PageBackground = styled.div`
  min-height: 100vh;
  background-color: var(--gray-200);
`

const Container = styled.main`
  width: 100%;
  max-width: var(--web-max-width);
  min-width: var(--web-min-width);
  min-height: 100vh;
  margin: 0 auto;
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