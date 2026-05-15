import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Button from '../Button/Button'

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100; // BuildingModal 보다 높게
`

const ModalContainer = styled.div`
    background-color: var(--white);
    width: 100%;
    max-width: 480px;
    height: 600px;
    border-radius: var(--radius-12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px 16px 32px;
    border-bottom: 1px solid var(--gray-200);
`

const Title = styled.h2`
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 700;
    color: var(--black-900);
    margin: 0;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: color 0.2s;

    &:hover {
        color: var(--gray-700);
    }
`

const SearchArea = styled.div`
    padding: 24px 32px;
    background-color: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    gap: 12px;
`

const Input = styled.input`
    flex: 1;
    height: 48px;
    padding: 0 16px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    font-family: var(--font-sans);
    font-size: var(--text-14);
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: var(--blue-500);
    }
`

const ResultArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const ResultItem = styled.button`
    width: 100%;
    text-align: left;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &:hover {
        border-color: var(--blue-500);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .place-name {
        font-weight: 700;
        font-size: 16px;
        color: var(--blue-600);
    }

    .address {
        font-size: 13px;
        color: var(--gray-600);
    }
    
    .road-address {
        font-size: 13px;
        color: var(--gray-500);
        display: flex;
        align-items: center;
        gap: 6px;

        span {
            font-size: 10px;
            padding: 2px 4px;
            border: 1px solid var(--gray-200);
            border-radius: 4px;
            color: var(--gray-400);
        }
    }
`

const EmptyMessage = styled.div`
    text-align: center;
    color: var(--gray-400);
    margin-top: 40px;
    font-size: 14px;
`

// 나중에 카카오 API 연동 전 사용할 더미 데이터
const dummyResults = [
    {
        id: '11111111',
        place_name: '신공학관',
        address_name: '서울 성동구 행당동 17',
        road_address_name: '서울 성동구 왕십리로 222',
        x: '127.045612',
        y: '37.556201'
    },
    {
        id: '22222222',
        place_name: '신세계백화점 본점',
        address_name: '서울 중구 충무로1가 52-5',
        road_address_name: '서울 중구 소공로 63',
        x: '126.982270',
        y: '37.560934'
    },
    {
        id: '33333333',
        place_name: '명진관',
        address_name: '서울 중구 필동3가 26',
        road_address_name: '서울 중구 필동로 1길 30',
        x: '126.999612',
        y: '37.557434'
    }
]

export default function AddressSearchModal({ isOpen, onClose, onSelect }) {
    const [keyword, setKeyword] = useState('')
    const [results, setResults] = useState([])
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setKeyword('')
            setResults([])
            setHasSearched(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSearch = async () => {
        if (!keyword.trim()) return
        
        const apiKey = import.meta.env.VITE_KAKAO_REST_API_KEY
        
        if (!apiKey) {
            // API 키가 없으면 기존처럼 더미 데이터 필터링 (테스트용)
            console.warn("VITE_KAKAO_REST_API_KEY가 설정되지 않아 더미 데이터로 검색합니다.")
            const filtered = dummyResults.filter(item => item.place_name.includes(keyword))
            setResults(filtered)
            setHasSearched(true)
            return
        }

        // 실제 카카오 로컬 REST API 호출
        try {
            const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`, {
                headers: {
                    Authorization: `KakaoAK ${apiKey}`
                }
            })
            
            if (!response.ok) {
                const errorData = await response.text()
                console.error('카카오 서버 거절 사유:', errorData)
                throw new Error(errorData)
            }
            
            const data = await response.json()
            setResults(data.documents || [])
            setHasSearched(true)
        } catch (error) {
            console.error('카카오 API 검색 중 오류 발생:', error)
            alert(`장소 검색 중 오류가 발생했습니다.\n이유: ${error.message}`)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const handleSelect = (place) => {
        onSelect(place)
        onClose()
    }

    return (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            <ModalContainer>
                <Header>
                    <Title>주소 및 장소 검색</Title>
                    <CloseButton type="button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </CloseButton>
                </Header>

                <SearchArea>
                    <Input 
                        placeholder="예: 신공학관, 한양대학교"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <Button variant="primary" onClick={handleSearch} style={{ height: '48px', padding: '0 24px' }}>
                        검색
                    </Button>
                </SearchArea>

                <ResultArea>
                    {!hasSearched ? (
                        <EmptyMessage>
                            찾으시는 건물명이나 장소를 검색해 주세요.<br/>
                            (더미 테스트: '신공학관' 검색)
                        </EmptyMessage>
                    ) : results.length > 0 ? (
                        results.map((place, index) => (
                            <ResultItem key={index} onClick={() => handleSelect(place)}>
                                <div className="place-name">{place.place_name}</div>
                                <div className="road-address">
                                    <span>도로명</span> {place.road_address_name}
                                </div>
                                <div className="address">
                                    (지번) {place.address_name}
                                </div>
                            </ResultItem>
                        ))
                    ) : (
                        <EmptyMessage>
                            검색 결과가 없습니다.
                        </EmptyMessage>
                    )}
                </ResultArea>
            </ModalContainer>
        </Overlay>
    )
}
