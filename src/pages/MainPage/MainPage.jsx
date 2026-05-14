import styled from 'styled-components'
import Button from '../../components/Button/Button'
import { useNavigate } from 'react-router-dom'

/* ── Layout ── */
const Page = styled.div`
    width: 100%;
    min-height: 100vh;
    background-color: var(--white);
`


/* ── Hero Section ── */
const Hero = styled.section`
    width: 100%;
    padding: 140px 32px 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background: linear-gradient(180deg, var(--blue-50) 0%, var(--white) 100%);
    border-bottom: 1px solid var(--blue-100);
`

const HeroHeading = styled.h1`
    font-family: var(--font-sans);
    font-size: 40px;
    font-weight: 800;
    color: var(--black-950);
    line-height: 1.35;
    margin: 0 0 64px;
`

const StartButton = styled(Button)`
    min-width: 200px;
    height: 52px;
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    border-radius: var(--radius-8);
`

/* ── Features Section ── */
const Features = styled.section`
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    padding: 64px 32px 80px;
`

const FeaturesTitle = styled.h2`
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 700;
    color: var(--black-950);
    text-align: center;
    margin: 0 0 40px;
`

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const Card = styled.article`
    padding: 28px 24px;
    border: 1px solid var(--gray-200);
    border-radius: 16px;
    background: var(--white);
`

const CardIcon = styled.div`
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

const CardTitle = styled.h3`
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 700;
    color: var(--black-950);
    margin: 0 0 8px;
`

const CardDesc = styled.p`
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 400;
    color: var(--gray-500);
    line-height: 1.6;
    margin: 0;
`

/* ── Data ── */
/* ── SVG Icons ── */
function FloorplanIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B83F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
        </svg>
    )
}

function RouteIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00c950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
        </svg>
    )
}

function MonitorIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

const features = [
    {
        icon: <FloorplanIcon />,
        bg: 'var(--blue-50)',
        title: '드래그 앤 드롭 빌더',
        desc: '건물 평면도를 업로드하고 POI(관심지점)를 드래그로 배치하세요. 복잡한 설정 없이 직관적으로 지도를 만들 수 있습니다.',
    },
    {
        icon: <RouteIcon />,
        bg: '#ecfdf5',
        title: '스마트 길찾기',
        desc: '엘리베이터, 계단, 에스컬레이터를 고려한 맞춤 경로를 제공합니다.',
    },
    {
        icon: <MonitorIcon />,
        bg: '#fdf4ff',
        title: '실시간 모니터링',
        desc: '사용자 행동 패턴과 주요 동선을 분석하여 공간 운영 효율성을 높일 수 있습니다.',
    },
]

export default function MainPage() {
    const navigate = useNavigate()

    return (
        <Page>
            {/* Hero */}
            <Hero>
                <HeroHeading>
                    누구나 쉽게 만드는
                    <br />
                    실내 내비게이션 시스템
                </HeroHeading>
                <StartButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/login')}
                >
                    시작하기 →
                </StartButton>
            </Hero>

            {/* Features */}
            <Features>
                <FeaturesTitle>주요 기능</FeaturesTitle>
                <CardGrid>
                    {features.map((f) => (
                        <Card key={f.title}>
                            <CardIcon $bg={f.bg}>{f.icon}</CardIcon>
                            <CardTitle>{f.title}</CardTitle>
                            <CardDesc>{f.desc}</CardDesc>
                        </Card>
                    ))}
                </CardGrid>
            </Features>
        </Page>
    )
}
