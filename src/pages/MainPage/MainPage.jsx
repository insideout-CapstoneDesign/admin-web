import { useNavigate } from 'react-router-dom'
import {
    Card,
    CardDesc,
    CardGrid,
    CardIcon,
    CardTitle,
    Features,
    FeaturesTitle,
    Hero,
    HeroHeading,
    Page,
    StartButton,
} from './MainPage.styles'

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
