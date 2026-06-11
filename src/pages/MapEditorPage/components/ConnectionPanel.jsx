import { useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import Button from '../../../components/Button/Button'

const SectionCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #f8fafc;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`

const SectionTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    h3 {
        margin: 0;
        font-size: 15px;
        color: var(--black-900);
    }

    span {
        font-size: 11px;
        font-weight: 700;
        color: var(--gray-500);
    }
`

const HelpText = styled.div`
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.6;
`

const ErrorHint = styled.div`
    color: var(--red-500);
    font-size: 11px;
    line-height: 1.5;
    margin-top: 4px;
    text-align: left;
`

const DetailActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`

const MappingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
`

const MappingRow = styled.div`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.32)' : 'rgba(148, 163, 184, 0.18)')};
    background: ${({ $active }) => ($active ? 'rgba(239, 246, 255, 0.92)' : 'rgba(255, 255, 255, 0.96)')};
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: ${({ $active }) => ($active ? '0 18px 32px -24px rgba(37, 99, 235, 0.45)' : 'none')};
`

const MappingRowHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    strong {
        font-size: 14px;
        color: #0f172a;
    }
`

const MappingStatus = styled.span`
    font-size: 11px;
    font-weight: 800;
    color: ${({ $mapped }) => ($mapped ? '#047857' : '#b45309')};
    background: ${({ $mapped }) => ($mapped ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)')};
    border-radius: 999px;
    padding: 6px 8px;
`

const MappingMeta = styled.div`
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
`

const ConnectionOverviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
`

const ConnectionStatCard = styled.div`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(148, 163, 184, 0.18)')};
    background: ${({ $active }) => ($active ? 'rgba(239, 246, 255, 0.6)' : 'linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%)')};
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    ${({ $interactive }) => $interactive && `
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        
        &:hover {
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        
        &:active {
            transform: translateY(0);
        }
    `}
`

const ConnectionStatValue = styled.strong`
    font-size: 24px;
    line-height: 1;
    color: #0f172a;
`

const ConnectionStatLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
`

const CloseTextButton = styled.button`
    border: none;
    background: none;
    color: var(--gray-500);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;

    &:hover {
        background: rgba(148, 163, 184, 0.08);
        color: var(--black-900);
    }
`

const CandidateListContainer = styled.div`
    margin-top: 12px;
    padding: 14px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeIn 0.2s ease-in-out;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }
`

const CandidateListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;

    strong {
        font-size: 13px;
        color: #0f172a;
    }
`

const CandidateList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 180px;
    overflow-y: auto;
    padding-right: 2px;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
    }
`

const CandidateItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #f1f5f9;
    font-size: 12px;
`

const CandidateInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    
    strong {
        font-weight: 700;
    }
`

const CandidateBadge = styled.span`
    background: ${({ $kind }) => 
        $kind === 'elevator' ? 'rgba(59, 130, 246, 0.1)' : 
        $kind === 'stair' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
    };
    color: ${({ $kind }) => 
        $kind === 'elevator' ? '#2563eb' : 
        $kind === 'stair' ? '#059669' : '#d97706'
    };
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
`

const ConnectionEmptyState = styled.div`
    border: 1px dashed rgba(148, 163, 184, 0.28);
    background: rgba(248, 250, 252, 0.72);
    border-radius: 16px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    strong {
        font-size: 14px;
        color: #0f172a;
    }
`

const ConnectionPickBanner = styled.div`
    border: 1px solid rgba(59, 130, 246, 0.22);
    background: linear-gradient(180deg, rgba(239, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`

const ConnectionPickText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        font-size: 14px;
        color: #0f172a;
    }
`

const EntityList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
    min-height: 0;
`

const EntityItem = styled.button`
    width: 100%;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.24)' : 'rgba(148, 163, 184, 0.16)')};
    background: ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.12)' : 'rgba(255,255,255,0.95)')};
    border-radius: 14px;
    padding: 12px 14px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: ${({ $active }) => ($active ? '0 18px 32px -24px rgba(91, 33, 182, 0.55)' : 'none')};
    transform: ${({ $active }) => ($active ? 'translateY(-1px)' : 'none')};
    transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
`

const EntityTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    strong {
        font-size: 14px;
        font-weight: 800;
        color: var(--black-900);
    }

    span {
        font-size: 10px;
        font-weight: 800;
        color: #6366f1;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
`

const EntityMeta = styled.div`
    color: var(--gray-600);
    font-size: 12px;
    line-height: 1.5;
`

const VerticalConnectorList = styled.div`
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const VerticalFloorRowsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
`

const VerticalFloorRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    background: #f8fafc;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
`

const VerticalFloorName = styled.span`
    font-weight: 700;
    color: #475569;
    min-width: 48px;
`

const VerticalNodeStatus = styled.span`
    margin-left: 12px;
    color: ${({ $mapped }) => ($mapped ? '#0f172a' : '#94a3b8')};
    flex-grow: 1;
    font-weight: ${({ $mapped }) => ($mapped ? '600' : 'normal')};
`

const VerticalFloorRowActions = styled.div`
    display: flex;
    gap: 6px;
`

const DeleteTextButton = styled.button`
    border: none;
    background: none;
    color: #ef4444;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    display: inline-flex;
    align-items: center;
    border-radius: 4px;

    &:hover {
        background: rgba(239, 68, 68, 0.08);
    }
`

const EditTextButton = styled.button`
    border: none;
    background: none;
    color: #4f46e5;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    display: inline-flex;
    align-items: center;
    border-radius: 4px;

    &:hover {
        background: rgba(79, 70, 229, 0.08);
    }
`

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.15s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`

const ModalContainer = styled.form`
    background: #ffffff;
    border-radius: 24px;
    width: 100%;
    max-width: 440px;
    padding: 28px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    transform: translateY(0);
    animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    @keyframes slideUp {
        from { transform: translateY(12px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
    }
`

const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
        font-size: 12px;
        font-weight: 700;
        color: #475569;
    }

    input, select {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 10px;
        font-size: 14px;
        color: #0f172a;
        background: #f8fafc;
        transition: all 0.15s ease-in-out;

        &:focus {
            outline: none;
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }
    }
`

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
`


export default function ConnectionPanel({
    mappedGateCount,
    campusGates,
    buildingEntranceNodeCount,
    verticalConnectionNodes,
    pendingGatePick,
    onCancelPendingGatePick,
    entranceMappingByGateId,
    floorNameById,
    onStartGatePick,
    isMappingLoading,
    onFocusMappedNode,
    entranceNodes,
    entranceMappingByNodeId,
    selectedEntity,
    onSelectNode,
    onOpenNodeTab,
    verticalConnectors,
    onCreateVerticalConnector,
    onUpdateVerticalConnector,
    isVerticalLoading,
    activeConnectorForMapping,
    floorOptions,
    onDeleteVerticalConnector,
    onViewVerticalNode,
    onUnmapVerticalNode,
    onStartVerticalNodePick,
}) {
    const [showCandidates, setShowCandidates] = useState(false)

    // 모달 관련 state 추가
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
    const [editingConnectorId, setEditingConnectorId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        kind: 'elevator',
        avgWaitSeconds: 30,
        direction: 'both',
    })

    const handleOpenCreateModal = () => {
        setModalMode('create')
        setEditingConnectorId(null)
        setFormData({
            name: '',
            kind: 'elevator',
            avgWaitSeconds: 30,
            direction: 'both',
        })
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (connector) => {
        setModalMode('edit')
        setEditingConnectorId(connector.id)
        setFormData({
            name: connector.name || '',
            kind: connector.kind || 'elevator',
            avgWaitSeconds: connector.avgWaitSeconds != null ? connector.avgWaitSeconds : 30,
            direction: connector.direction || 'both',
        })
        setIsModalOpen(true)
    }

    const handleKindChange = (newKind) => {
        const defaultWaits = {
            elevator: 30,
            stair: 20,
            escalator: 15,
            ramp: 10,
        }
        setFormData((prev) => ({
            ...prev,
            kind: newKind,
            avgWaitSeconds: defaultWaits[newKind] || 15,
        }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            window.alert('이름을 입력해주세요.')
            return
        }

        const payload = {
            name: formData.name,
            kind: formData.kind,
            avgWaitSeconds: parseInt(formData.avgWaitSeconds, 10),
            direction: formData.direction,
        }

        const success = modalMode === 'create'
            ? await onCreateVerticalConnector(payload)
            : await onUpdateVerticalConnector(editingConnectorId, payload)

        if (success) {
            setIsModalOpen(false)
        }
    }

    return (
        <>
            <SectionCard>
                <SectionTitle>
                    <h3>연결 현황</h3>
                    <span>{mappedGateCount}/{campusGates.length} gate 연결</span>
                </SectionTitle>
                <ConnectionOverviewGrid>
                    <ConnectionStatCard>
                        <ConnectionStatValue>{campusGates.length}</ConnectionStatValue>
                        <ConnectionStatLabel>캠퍼스 gate</ConnectionStatLabel>
                    </ConnectionStatCard>
                    <ConnectionStatCard>
                        <ConnectionStatValue>{mappedGateCount}</ConnectionStatValue>
                        <ConnectionStatLabel>연결 완료 gate</ConnectionStatLabel>
                    </ConnectionStatCard>
                    <ConnectionStatCard>
                        <ConnectionStatValue>{buildingEntranceNodeCount}</ConnectionStatValue>
                        <ConnectionStatLabel>건물 전체 entrance node</ConnectionStatLabel>
                    </ConnectionStatCard>
                    <ConnectionStatCard
                        $interactive={verticalConnectionNodes.length > 0}
                        $active={showCandidates}
                        onClick={() => {
                            if (verticalConnectionNodes.length > 0) {
                                setShowCandidates((prev) => !prev)
                            }
                        }}
                    >
                        <ConnectionStatValue>{verticalConnectionNodes.length}</ConnectionStatValue>
                        <ConnectionStatLabel>
                            수직 이동 후보 {verticalConnectionNodes.length > 0 && (showCandidates ? '▲' : '▼')}
                        </ConnectionStatLabel>
                    </ConnectionStatCard>
                </ConnectionOverviewGrid>

                {showCandidates && verticalConnectionNodes.length > 0 && (
                    <CandidateListContainer>
                        <CandidateListHeader>
                            <strong>수직 이동 후보 상세 목록 ({verticalConnectionNodes.length})</strong>
                            <CloseTextButton type="button" onClick={() => setShowCandidates(false)}>
                                닫기
                            </CloseTextButton>
                        </CandidateListHeader>
                        <CandidateList>
                            {verticalConnectionNodes.map((node) => {
                                const kindMap = {
                                    elevator: { icon: '🛗', label: '엘리베이터' },
                                    stair: { icon: '🪜', label: '계단' },
                                    escalator: { icon: '🛗', label: '에스컬레이터' },
                                }
                                const info = kindMap[node.kind] || { icon: '🔗', label: '수직 이동' }
                                const displayName = node.name || `${info.label} (${node.id.substring(0, 8)})`
                                return (
                                    <CandidateItem key={node.id}>
                                        <CandidateInfo>
                                            <span>{info.icon}</span>
                                            <strong>{displayName}</strong>
                                            <CandidateBadge $kind={node.kind}>{info.label}</CandidateBadge>
                                        </CandidateInfo>
                                        <Button variant="outlineGray" size="sm" onClick={() => onFocusMappedNode(node.id)}>
                                            지도에서 보기
                                        </Button>
                                    </CandidateItem>
                                )
                            })}
                        </CandidateList>
                    </CandidateListContainer>
                )}

                <HelpText>
                    gate 매핑은 건물 단위로 한 번만 관리합니다. 현재 층에 entrance node가 없어도, 다른 층에서 이미 연결된 gate는 여기서 그대로 연결 완료로 보여야 합니다.
                </HelpText>
            </SectionCard>

            <SectionCard>
                <SectionTitle>
                    <h3>출입구 캘리브레이션</h3>
                    <span>{campusGates.length}개 gate</span>
                </SectionTitle>
                <HelpText>
                    Gate를 하나 고른 뒤 지도에서 노드를 직접 클릭해 연결합니다. 이미 연결된 gate도 언제든 다시 지정할 수 있습니다.
                </HelpText>
                {pendingGatePick && (
                    <ConnectionPickBanner>
                        <ConnectionPickText>
                            <strong>{pendingGatePick.gateName}에 연결할 노드를 지도에서 클릭하세요.</strong>
                            <HelpText>아무 node나 지정할 수 있고, 연결되면 해당 node는 자동으로 entrance로 처리됩니다.</HelpText>
                        </ConnectionPickText>
                        <Button variant="outlineGray" size="sm" onClick={onCancelPendingGatePick}>
                            선택 취소
                        </Button>
                    </ConnectionPickBanner>
                )}
                {campusGates.length > 0 ? (
                    <MappingGrid>
                        {campusGates.map((gate) => {
                            const mapped = entranceMappingByGateId.get(gate.id)
                            return (
                                <MappingRow key={gate.id} $active={pendingGatePick?.gateId === gate.id}>
                                    <MappingRowHeader>
                                        <strong>{gate.name}</strong>
                                        <MappingStatus $mapped={!!mapped}>
                                            {pendingGatePick?.gateId === gate.id ? '노드 선택 중' : mapped ? '연결 완료' : '미연결'}
                                        </MappingStatus>
                                    </MappingRowHeader>
                                    <MappingMeta>
                                        {mapped?.nodeId
                                            ? `${gate.name}이 ${floorNameById.get(mapped.floorId) || '다른 층'}의 실내 node와 연결되어 있습니다.`
                                            : '아직 연결된 실내 node가 없습니다. 지도에서 바로 지정해 주세요.'}
                                    </MappingMeta>
                                    <DetailActions>
                                        <Button size="sm" onClick={() => onStartGatePick(gate)} disabled={isMappingLoading}>
                                            {mapped?.nodeId ? '다시 지정' : '지도에서 지정'}
                                        </Button>
                                        {mapped?.nodeId && (
                                            <Button variant="outlineGray" size="sm" onClick={() => onFocusMappedNode(mapped.nodeId)}>
                                                지도에서 보기
                                            </Button>
                                        )}
                                        {pendingGatePick?.gateId === gate.id && (
                                            <Button variant="outlineGray" size="sm" onClick={onCancelPendingGatePick}>
                                                취소
                                            </Button>
                                        )}
                                    </DetailActions>
                                </MappingRow>
                            )
                        })}
                    </MappingGrid>
                ) : (
                    <ErrorHint>캠퍼스에 등록된 gate가 없습니다. 캠퍼스 관리에서 gate를 먼저 등록해 주세요.</ErrorHint>
                )}
            </SectionCard>

            <SectionCard>
                <SectionTitle>
                    <h3>실내 출입구 노드</h3>
                    <span>{entranceNodes.length}개</span>
                </SectionTitle>
                <HelpText>
                    현재 층의 entrance node 목록입니다. 건물 전체 연결 여부와는 별개로, 이 층에서 바로 조정할 수 있는 node만 보여줍니다.
                </HelpText>
                {entranceNodes.length > 0 ? (
                    <EntityList>
                        {entranceNodes.map((node) => {
                            const mapping = entranceMappingByNodeId.get(node.id)
                            const active = selectedEntity?.type === 'node' && selectedEntity.id === node.id
                            return (
                                <EntityItem key={node.id} type="button" $active={active} onClick={() => onSelectNode(node.id)}>
                                    <EntityTitle>
                                        <strong>{node.name || '이름 없는 출입구'}</strong>
                                        <span>{mapping?.campusGateName || 'UNMAPPED'}</span>
                                    </EntityTitle>
                                    <EntityMeta>
                                        {mapping?.campusGateName ? `${mapping.campusGateName}와 연결됨` : '아직 gate와 연결되지 않았습니다.'}
                                    </EntityMeta>
                                </EntityItem>
                            )
                        })}
                    </EntityList>
                ) : (
                    <ConnectionEmptyState>
                        <strong>현재 층에 entrance node가 없습니다.</strong>
                        <HelpText>
                            다른 층에서 이미 gate 매핑이 끝났을 수도 있습니다. 이 영역은 현재 층에서 직접 수정할 entrance node가 있을 때만 표시됩니다.
                        </HelpText>
                        <DetailActions>
                            <Button size="sm" onClick={onOpenNodeTab}>
                                노드 탭 열기
                            </Button>
                        </DetailActions>
                    </ConnectionEmptyState>
                )}
            </SectionCard>

            <SectionCard>
                <SectionTitle>
                    <h3>수직 이동 연결 (캘리브레이션)</h3>
                    <Button size="sm" onClick={handleOpenCreateModal} disabled={isVerticalLoading}>
                        + 추가
                    </Button>
                </SectionTitle>
                <HelpText>
                    엘리베이터, 계단, 에스컬레이터 등 수직 통로를 만들고 각 층의 노드를 연결합니다. 동일한 통로에 연결된 노드들 간에 자동으로 수직 이동 가중치가 생성됩니다.
                </HelpText>

                {verticalConnectors.length > 0 ? (
                    <VerticalConnectorList>
                        {verticalConnectors.map((connector) => {
                            const icon = connector.kind === 'elevator' ? '🛗' : connector.kind === 'stair' ? '🪜' : connector.kind === 'escalator' ? '🛗' : '🪜'
                            const isActive = activeConnectorForMapping?.connectorId === connector.id
                            return (
                                <MappingRow key={connector.id} $active={isActive}>
                                    <MappingRowHeader>
                                        <strong>{icon} {connector.name}</strong>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <EditTextButton type="button" onClick={() => handleOpenEditModal(connector)}>
                                                설정
                                            </EditTextButton>
                                            <DeleteTextButton type="button" onClick={() => onDeleteVerticalConnector(connector.id)} disabled={isVerticalLoading}>
                                                삭제
                                            </DeleteTextButton>
                                        </div>
                                    </MappingRowHeader>
                                    <MappingMeta>
                                        종류: {connector.kind === 'elevator' ? '엘리베이터' : connector.kind === 'stair' ? '계단' : connector.kind === 'escalator' ? '에스컬레이터' : connector.kind === 'ramp' ? '경사로' : connector.kind}
                                        {connector.avgWaitSeconds != null && ` | 대기 가중치: ${connector.avgWaitSeconds}초`}
                                        {connector.direction && ` | 방향: ${connector.direction === 'both' ? '양방향' : connector.direction === 'up' ? '상행' : '하행'}`}
                                        {` (${connector.nodes?.length || 0}개 층 연결됨)`}
                                    </MappingMeta>
                                    <VerticalFloorRowsContainer>
                                        {floorOptions.map((floor) => {
                                            const mappedNode = connector.nodes?.find((node) => node.floorId === floor.id)
                                            const isCurrentPicking =
                                                activeConnectorForMapping?.connectorId === connector.id &&
                                                activeConnectorForMapping?.floorId === floor.id

                                            return (
                                                <VerticalFloorRow key={floor.id}>
                                                    <VerticalFloorName>{floor.name}</VerticalFloorName>
                                                    <VerticalNodeStatus $mapped={!!mappedNode}>
                                                        {isCurrentPicking
                                                            ? '지도에서 노드 선택 중...'
                                                            : mappedNode
                                                                ? `${mappedNode.nodeName || '연결됨'} (${mappedNode.nodeId?.substring(0, 8)})`
                                                                : '미연결'}
                                                    </VerticalNodeStatus>
                                                    <VerticalFloorRowActions>
                                                        {mappedNode ? (
                                                            <>
                                                                <Button variant="outlineGray" size="sm" onClick={() => onViewVerticalNode(floor.id, mappedNode.nodeId)}>
                                                                    보기
                                                                </Button>
                                                                <Button
                                                                    variant="dangerOutline"
                                                                    size="sm"
                                                                    onClick={() => onUnmapVerticalNode(connector.id, floor.id)}
                                                                    disabled={isVerticalLoading}
                                                                >
                                                                    해제
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => onStartVerticalNodePick(connector.id, connector.name, floor.id)}
                                                                disabled={isVerticalLoading || isCurrentPicking}
                                                            >
                                                                {isCurrentPicking ? '선택 중' : '지정'}
                                                            </Button>
                                                        )}
                                                    </VerticalFloorRowActions>
                                                </VerticalFloorRow>
                                            )
                                        })}
                                    </VerticalFloorRowsContainer>
                                </MappingRow>
                            )
                        })}
                    </VerticalConnectorList>
                ) : (
                    <ConnectionEmptyState>
                        <strong>등록된 수직 이동수단이 없습니다.</strong>
                        <HelpText>우측 상단의 "+ 추가" 버튼을 눌러 엘리베이터나 계단을 먼저 만들어보세요.</HelpText>
                    </ConnectionEmptyState>
                )}
            </SectionCard>

            {isModalOpen && createPortal(
                <ModalOverlay onClick={() => setIsModalOpen(false)}>
                    <ModalContainer onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h4>{modalMode === 'create' ? '수직 이동수단 추가' : '수직 이동수단 설정'}</h4>
                            <CloseTextButton type="button" onClick={() => setIsModalOpen(false)}>
                                닫기
                            </CloseTextButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <label htmlFor="connector-name">명칭</label>
                                <input
                                    id="connector-name"
                                    type="text"
                                    placeholder="예: 중앙 엘리베이터 1호기, 비상계단 A"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <label htmlFor="connector-kind">종류</label>
                                <select
                                    id="connector-kind"
                                    value={formData.kind}
                                    onChange={(e) => handleKindChange(e.target.value)}
                                >
                                    <option value="elevator">엘리베이터 (Elevator)</option>
                                    <option value="stair">계단 (Stair)</option>
                                    <option value="escalator">에스컬레이터 (Escalator)</option>
                                    <option value="ramp">경사로 (Ramp)</option>
                                </select>
                            </FormGroup>
                            <FormGroup>
                                <label htmlFor="connector-direction">운행 방향</label>
                                <select
                                    id="connector-direction"
                                    value={formData.direction}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, direction: e.target.value }))}
                                >
                                    <option value="both">양방향 (both)</option>
                                    <option value="up">상행 (up)</option>
                                    <option value="down">하행 (down)</option>
                                </select>
                            </FormGroup>
                            <FormGroup>
                                <label htmlFor="connector-wait">평균 대기 가중치 (초)</label>
                                <input
                                    id="connector-wait"
                                    type="number"
                                    min="0"
                                    placeholder="예: 30"
                                    value={formData.avgWaitSeconds}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, avgWaitSeconds: e.target.value }))}
                                    required
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="button" variant="outlineGray" onClick={() => setIsModalOpen(false)}>
                                취소
                            </Button>
                            <Button type="submit" variant="primary" disabled={isVerticalLoading}>
                                {modalMode === 'create' ? '추가' : '저장'}
                            </Button>
                        </ModalFooter>
                    </ModalContainer>
                </ModalOverlay>,
                document.body
            )}
        </>
    )
}
