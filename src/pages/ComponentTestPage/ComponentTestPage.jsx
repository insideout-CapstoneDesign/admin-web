import Button from '../../components/Button/Button'
import './ComponentTestPage.css'

export default function ComponentTestPage() {
    return (
        <main className="component-test-page">
            <div className="signup-button-wrap">
            <Button variant="primary" size="lg" full>
                회원가입
            </Button>
            </div>
            <Button variant="outlineBlue" size="lg" full>
                POI 배치 중...
            </Button>

            <div className="three-col">
                <Button variant="outlineGray" size="sm" full>
                    네모
                </Button>
                <Button variant="outlineGray" size="sm" full>
                    원형
                </Button>
                <Button variant="primary" size="sm" full>
                    곡선
                </Button>
            </div>

            <Button variant="outlineGray" size="lg" full>
                파일 첨부 (JPG/PNG)
            </Button>

            <Button variant="primary" size="lg" full>
                외부 노드 설정
            </Button>

            <div className="two-col">
                <Button variant="success" size="lg" full>
                    저장
                </Button>
                <Button variant="danger" size="lg" full>
                    초기화
                </Button>
            </div>

            <Button variant="dangerOutline" size="lg" full>
                뒤로가기
            </Button>
        </main>
    )
}