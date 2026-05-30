import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Button from '../Button/Button'

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
    animation: fadeIn 0.2s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`

const ModalContainer = styled.div`
    background-color: var(--white);
    border-radius: var(--radius-16, 16px);
    width: 100%;
    max-width: 640px;
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid var(--gray-200);

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`

const Header = styled.div`
    padding: 20px 24px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--black-900);
        display: flex;
        align-items: center;
        gap: 8px;
    }
`

const CloseButton = styled.button`
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover {
        color: var(--black-900);
    }
`

const Content = styled.div`
    padding: 24px;
    overflow-y: auto;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const InfoCard = styled.div`
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: var(--radius-12, 12px);
    padding: 16px;
    font-size: 13.5px;
    color: var(--gray-600);
    line-height: 1.6;

    strong {
        color: var(--black-900);
    }
`

const SectionTitle = styled.h4`
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 700;
    color: var(--black-900);
    text-transform: uppercase;
    letter-spacing: 0.05em;
`

const MappingList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`

const MappingRow = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1.2fr;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background-color: var(--white);
    border: 1px solid ${({ $isMapped }) => ($isMapped ? 'var(--blue-200)' : 'var(--gray-200)')};
    background-color: ${({ $isMapped }) => ($isMapped ? 'rgba(59, 130, 246, 0.02)' : 'var(--white)')};
    border-radius: var(--radius-12, 12px);
    transition: all 0.2s ease;

    @media (max-width: 580px) {
        grid-template-columns: 1fr;
        gap: 10px;
        text-align: center;
    }
`

const MapSource = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    .gate-name {
        font-weight: 700;
        font-size: 14.5px;
        color: var(--black-900);
    }

    .coords {
        font-size: 12px;
        color: var(--gray-500);
        font-family: monospace;
    }
`

const ArrowIcon = styled.div`
    color: var(--gray-400);
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 580px) {
        transform: rotate(90deg);
        padding: 4px 0;
    }
`

const DropdownWrapper = styled.div`
    position: relative;
    width: 100%;
`

const Select = styled.select`
    width: 100%;
    padding: 10px 14px;
    border-radius: var(--radius-8, 8px);
    border: 1px solid ${({ $error }) => ($error ? '#ef4444' : 'var(--gray-300)')};
    background-color: var(--white);
    font-size: 14px;
    color: var(--black-900);
    outline: none;
    transition: border-color 0.2s;
    appearance: none;

    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;

    &:focus {
        border-color: var(--blue-500);
    }
`

const Footer = styled.div`
    padding: 16px 24px;
    border-top: 1px solid var(--gray-100);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background-color: var(--gray-50);
`

const WarningBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: var(--radius-4, 4px);
    background-color: #fef2f2;
    color: #ef4444;
    font-size: 11.5px;
    font-weight: 600;
`

export default function CalibrationModal({
    isOpen,
    onClose,
    actualGates = [],
    detectedEntrances = [],
    initialMapping = {},
    onSave,
}) {
    const [mapping, setMapping] = useState({})
    const [mappingError, setMappingError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setMapping(initialMapping || {})
            setMappingError('')
        }
    }, [isOpen, initialMapping])

    if (!isOpen) return null

    const handleSelectChange = (gateId, entranceId) => {
        setMappingError('')
        setMapping(prev => ({
            ...prev,
            [gateId]: entranceId || null
        }))
    }

    const selectedEntranceIds = actualGates
        .map((gate) => mapping[gate.id])
        .filter((entranceId) => entranceId != null && entranceId !== '')
    const hasDuplicateMappings = selectedEntranceIds.length !== new Set(selectedEntranceIds).size
    const isAllMapped = actualGates.every(gate => mapping[gate.id] != null) && !hasDuplicateMappings

    const handleSave = () => {
        if (hasDuplicateMappings) {
            setMappingError('같은 도면 출입구는 하나의 Gate에만 연결할 수 있습니다.')
            return
        }

        if (!actualGates.every(gate => mapping[gate.id] != null)) {
            setMappingError('모든 실제 출입구를 매핑해야 합니다.')
            return
        }

        onSave(mapping)
        onClose()
    }

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <h3>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-500)' }}>
                            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        지리 정보 정합 (Calibration) 설정
                    </h3>
                    <CloseButton onClick={onClose} aria-label="닫기">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </CloseButton>
                </Header>

                <Content>
                    <InfoCard>
                        실내외 연동 길찾기를 정상 서비스하기 위해, <strong>실제 지도 상의 출입구</strong>와 <strong>AI 분석을 통해 도면 내에서 추출된 출입구</strong>를 서로 일치시키는 작업입니다.<br />
                        등록된 모든 출입구에 대해 매핑을 완료해야 길찾기 서비스 배포가 활성화됩니다.
                    </InfoCard>

                    <div>
                        <SectionTitle>출입구 매핑 매트릭스</SectionTitle>
                        {actualGates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '14px', border: '1px dashed var(--gray-200)', borderRadius: '12px' }}>
                                등록된 실제 지도 출입구가 없습니다. 단지 지리 정보 등록 단계에서 Gate를 먼저 설정해주세요.
                            </div>
                        ) : (
                            <MappingList>
                                {actualGates.map(gate => {
                                    const currentMapped = mapping[gate.id]
                                    return (
                                        <MappingRow key={gate.id} $isMapped={!!currentMapped}>
                                            <MapSource>
                                                <div className="gate-name">{gate.name}</div>
                                                <div className="coords">{gate.location || 'POINT(WGS84)'}</div>
                                            </MapSource>

                                            <ArrowIcon>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </ArrowIcon>

                                            <DropdownWrapper>
                                                <Select
                                                    value={currentMapped || ''}
                                                    onChange={(e) => handleSelectChange(gate.id, e.target.value)}
                                                    $error={!currentMapped}
                                                >
                                                    <option value="">도면 상 출입구 선택 (필수)</option>
                                                    {detectedEntrances.map(ent => {
                                                        const isChosenByAnotherGate = actualGates.some(
                                                            (otherGate) => otherGate.id !== gate.id && mapping[otherGate.id] === ent.id
                                                        )

                                                        return (
                                                        <option key={ent.id} value={ent.id} disabled={isChosenByAnotherGate}>
                                                            {ent.label || `출입구 (${Math.round(ent.bboxPx[0])}, ${Math.round(ent.bboxPx[1])})`}
                                                        </option>
                                                        )
                                                    })}
                                                </Select>
                                            </DropdownWrapper>
                                        </MappingRow>
                                    )
                                })}
                            </MappingList>
                        )}
                    </div>
                </Content>

                <Footer>
                    {!isAllMapped && actualGates.length > 0 && (
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                            <WarningBadge>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                {mappingError || (hasDuplicateMappings
                                    ? '같은 도면 출입구를 여러 Gate에 연결할 수 없습니다.'
                                    : '모든 실제 출입구를 매핑해야 합니다.')}
                            </WarningBadge>
                        </div>
                    )}
                    <Button variant="outlineGray" onClick={onClose}>취소</Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!isAllMapped || actualGates.length === 0}
                    >
                        캘리브레이션 저장
                    </Button>
                </Footer>
            </ModalContainer>
        </Overlay>
    )
}
