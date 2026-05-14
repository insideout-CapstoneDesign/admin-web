import { useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button/Button'
import ContainerBox from '../../components/ContainerBox/ContainerBox'
import DeletableTextBox from '../../components/DeletableTextBox/DeletableTextBox'
import TextInput from '../../components/TextInput/TextInput'
import {
    containerMocks,
    deletableTextBoxMocks,
    textInputMock,
} from '../../mocks/componentTest.mock'

const Page = styled.main`
    width: 100%;
    max-width: 424px;
    margin: 0 auto;
    padding: 32px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const SectionTitle = styled.h2`
    color: var(--black-900);
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    margin: 24px 0 4px;
`

const ThreeCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-8);
`

const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
`

const Section = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
`

export default function ComponentTestPage() {
    const [placeName, setPlaceName] = useState('')

    return (
        <Page>
            {/* ── 버튼 데모 ── */}
            <SectionTitle>[공통 사용할 button 구현]</SectionTitle>

            <Button variant="primary" size="lg" full>
                회원가입
            </Button>

            <Button variant="outlineBlue" size="lg" full>
                POI 배치 중...
            </Button>

            <ThreeCol>
                <Button variant="outlineGray" size="sm" full>
                    네모
                </Button>
                <Button variant="outlineGray" size="sm" full>
                    원형
                </Button>
                <Button variant="primary" size="sm" full>
                    곡선
                </Button>
            </ThreeCol>

            <Button variant="curveComplete" size="lg" full>
                곡선 완료
            </Button>

            <Button variant="outlineGray" size="lg" full>
                파일 첨부 (JPG/PNG)
            </Button>

            <Button variant="primary" size="lg" full>
                외부 노드 설정
            </Button>

            <TwoCol>
                <Button variant="success" size="lg" full>
                    저장
                </Button>
                <Button variant="danger" size="lg" full>
                    초기화
                </Button>
            </TwoCol>

            <Button variant="dangerOutline" size="lg" full>
                뒤로가기
            </Button>

            <Button variant="routeReset" size="lg" full>
                경로 초기화
            </Button>

            {/* ── 컨테이너 데모 ── */}
            <SectionTitle>[ContainerBox / Input / DeletableTextBox]</SectionTitle>

            {containerMocks.map((container) => (
                <Section key={container.id}>
                    <ContainerBox
                        title={container.title}
                        description={container.description}
                        meta={container.meta}
                        selected={container.selected}
                    />
                </Section>
            ))}

            <Section>
                <TextInput
                    value={placeName}
                    onChange={setPlaceName}
                    placeholder={textInputMock.placeholder}
                    aria-label={textInputMock.ariaLabel}
                />
            </Section>

            {deletableTextBoxMocks.map((textBox) => (
                <Section key={textBox.id}>
                    <DeletableTextBox text={textBox.text} />
                </Section>
            ))}
        </Page>
    )
}
