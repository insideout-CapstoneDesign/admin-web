import styled from 'styled-components'
import Button from '../../../components/Button/Button'

const Toolbar = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
`

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

const SectionTitleActions = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
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

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(76px, 92px) 1fr;
    gap: 10px 12px;
    align-items: start;
`

const DetailLabel = styled.div`
    color: var(--gray-500);
    font-size: 12px;
    font-weight: 700;
`

const DetailValue = styled.div`
    color: var(--black-900);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
`

const HelpText = styled.div`
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.6;
`

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
`

const FieldGroup = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
        font-size: 11px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
`

const FieldInput = styled.input`
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(255, 255, 255, 0.96);
    color: #0f172a;
    border-radius: 12px;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 600;

    &:focus {
        outline: none;
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
    }
`

const SearchInput = styled(FieldInput)`
    font-size: 13px;
`

const FieldSelect = styled.select`
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(255, 255, 255, 0.96);
    color: #0f172a;
    border-radius: 12px;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 600;

    &:focus {
        outline: none;
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
    }
`

const FieldHint = styled.div`
    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
`

const InlineFieldRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`

const DetailActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`

export default function EntityEditorPanel({
    activeEditorTab,
    editorTabMeta,
    selectedEditorItem,
    selectedRawEntity,
    selectedEntity,
    updateSelectedEntityField,
    updateSelectedPoiCategory,
    poiCategoryOptions,
    updateSelectedPoiAttrsPatch,
    normalizeLabelScale,
    poiNodeOptions,
    deleteSelectedEntity,
    selectedZoneVertexIndex,
    deleteSelectedZoneVertex,
    getPolygonVertices,
    resetSelectedEntityEdits,
    isEntityListCollapsed,
    onToggleEntityListCollapsed,
    filteredActiveEditorItems,
    onToggleAddPoi,
    isAddingPoi,
    onToggleAddZone,
    isAddingZone,
    draftZoneVertices,
    onUndoDraftZoneVertex,
    onCompleteZoneDraft,
    onToggleAddNode,
    isAddingNode,
    onToggleAddEdge,
    isAddingEdge,
    edgeStartNodeId,
    entitySearch,
    onChangeEntitySearch,
    zoneKindFilter,
    onChangeZoneKindFilter,
    zoneDraftError,
    onSelectEntity,
    selectedListItemRef,
}) {
    return (
        <>
            <SectionCard>
                <SectionTitle>
                    <h3>선택한 항목</h3>
                    <span>{selectedEditorItem ? '속성 편집' : '선택 없음'}</span>
                </SectionTitle>
                {selectedRawEntity && selectedEditorItem ? (
                    <>
                        <FormGrid>
                            {(selectedEntity?.type === 'poi' || selectedEntity?.type === 'zone' || selectedEntity?.type === 'node') && (
                                <FieldGroup>
                                    <span>이름</span>
                                    <FieldInput
                                        value={selectedRawEntity.name || ''}
                                        onChange={(event) => updateSelectedEntityField('name', event.target.value)}
                                        placeholder="이름을 입력하세요"
                                    />
                                </FieldGroup>
                            )}

                            {selectedEntity?.type === 'node' && (
                                <FieldGroup>
                                    <span>노드 유형</span>
                                    <FieldSelect
                                        value={selectedRawEntity?.kind || 'corridor'}
                                        onChange={(event) => updateSelectedEntityField('kind', event.target.value)}
                                    >
                                        <option value="corridor">일반 노드 (corridor)</option>
                                        <option value="entrance">출입구 (entrance)</option>
                                        <option value="stair">계단 (stair)</option>
                                        <option value="elevator">엘리베이터 (elevator)</option>
                                        <option value="escalator">에스컬레이터 (escalator)</option>
                                    </FieldSelect>
                                </FieldGroup>
                            )}

                            {selectedEntity?.type === 'edge' && (
                                <InlineFieldRow>
                                    <FieldGroup>
                                        <span>방향</span>
                                        <FieldSelect
                                            value={selectedRawEntity.isDirected ? 'directed' : 'bidirectional'}
                                            onChange={(event) => updateSelectedEntityField('isDirected', event.target.value === 'directed')}
                                        >
                                            <option value="bidirectional">양방향</option>
                                            <option value="directed">단방향</option>
                                        </FieldSelect>
                                    </FieldGroup>
                                    <FieldGroup>
                                        <span>기본 가중치</span>
                                        <FieldInput
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={selectedRawEntity.baseWeight ?? 1}
                                            onChange={(event) =>
                                                updateSelectedEntityField('baseWeight', event.target.value === '' ? '' : Number(event.target.value))
                                            }
                                        />
                                    </FieldGroup>
                                </InlineFieldRow>
                            )}

                            {selectedEntity?.type === 'poi' && (
                                <>
                                    <FieldGroup>
                                        <span>카테고리</span>
                                        <FieldSelect
                                            value={selectedRawEntity.code || ''}
                                            onChange={(event) => updateSelectedPoiCategory(event.target.value)}
                                        >
                                            <option value="">선택 안 함</option>
                                            {poiCategoryOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </FieldSelect>
                                    </FieldGroup>
                                    <FieldGroup>
                                        <span>외부 장소 ID</span>
                                        <FieldInput
                                            value={selectedRawEntity.externalApiId || ''}
                                            onChange={(event) => updateSelectedEntityField('externalApiId', event.target.value)}
                                            placeholder="카카오 장소 ID 등"
                                        />
                                        <FieldHint>수동 매핑 전까지는 비워둘 수 있습니다.</FieldHint>
                                    </FieldGroup>
                                    <FieldGroup>
                                        <span>POI 글씨 크기</span>
                                        <Toolbar>
                                            <Button
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() =>
                                                    updateSelectedPoiAttrsPatch({
                                                        labelScale: normalizeLabelScale((selectedRawEntity?.attrs?.labelScale ?? 1) - 0.1),
                                                    })
                                                }
                                            >
                                                -
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => updateSelectedPoiAttrsPatch({ labelScale: 1 })}>
                                                {Math.round(normalizeLabelScale(selectedRawEntity?.attrs?.labelScale ?? 1) * 100)}%
                                            </Button>
                                            <Button
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() =>
                                                    updateSelectedPoiAttrsPatch({
                                                        labelScale: normalizeLabelScale((selectedRawEntity?.attrs?.labelScale ?? 1) + 0.1),
                                                    })
                                                }
                                            >
                                                +
                                            </Button>
                                        </Toolbar>
                                        <FieldHint>위의 전체 POI 글씨 크기 설정과 함께 곱해서 적용됩니다.</FieldHint>
                                    </FieldGroup>
                                    <FieldGroup>
                                        <span>연결 노드</span>
                                        <FieldSelect
                                            value={selectedRawEntity.anchorNodeId || ''}
                                            onChange={(event) => updateSelectedEntityField('anchorNodeId', event.target.value || null)}
                                        >
                                            <option value="">연결 안 함</option>
                                            {poiNodeOptions.map((node) => (
                                                <option key={node.id} value={node.id}>
                                                    {node.label}
                                                </option>
                                            ))}
                                        </FieldSelect>
                                        <FieldHint>선택한 POI에 연결된 node는 지도에서 함께 강조됩니다.</FieldHint>
                                    </FieldGroup>
                                </>
                            )}

                            {selectedEntity?.type === 'zone' && (
                                <>
                                    <FieldGroup>
                                        <span>영역 유형</span>
                                        <FieldSelect
                                            value={selectedRawEntity.kind || 'room'}
                                            onChange={(event) => updateSelectedEntityField('kind', event.target.value)}
                                        >
                                            <option value="room">room</option>
                                            <option value="corridor">corridor</option>
                                            <option value="restricted">restricted</option>
                                        </FieldSelect>
                                    </FieldGroup>
                                    <FieldHint>선택된 zone은 지도에서 꼭짓점을 드래그해 모양을 바꿀 수 있고, 주황 점을 누르면 새 꼭짓점을 추가할 수 있습니다.</FieldHint>
                                </>
                            )}
                        </FormGrid>

                        <DetailActions>
                            {selectedEntity?.type === 'poi' && (
                                <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                    POI 삭제
                                </Button>
                            )}
                            {selectedEntity?.type === 'zone' && selectedZoneVertexIndex != null && (
                                <Button
                                    variant="outlineGray"
                                    size="sm"
                                    onClick={deleteSelectedZoneVertex}
                                    disabled={getPolygonVertices(selectedRawEntity?.geomPx).length <= 3}
                                >
                                    선택 점 삭제
                                </Button>
                            )}
                            {selectedEntity?.type === 'node' && (
                                <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                    노드 삭제
                                </Button>
                            )}
                            {selectedEntity?.type === 'edge' && (
                                <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                    엣지 삭제
                                </Button>
                            )}
                            {selectedEntity?.type === 'zone' && (
                                <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                    Zone 삭제
                                </Button>
                            )}
                            <Button variant="outlineGray" size="sm" onClick={resetSelectedEntityEdits}>
                                변경 초기화
                            </Button>
                        </DetailActions>

                        <DetailGrid>
                            {selectedEditorItem.detailRows.map(([label, value]) => (
                                <div key={`${selectedEditorItem.id}-${label}`} style={{ display: 'contents' }}>
                                    <DetailLabel>{label}</DetailLabel>
                                    <DetailValue>{value}</DetailValue>
                                </div>
                            ))}
                        </DetailGrid>
                    </>
                ) : (
                    <HelpText>목록 또는 지도에서 항목을 선택하면 오른쪽에서 이름, 방향성, 외부 ID 같은 기본 속성을 먼저 다듬을 수 있습니다.</HelpText>
                )}
            </SectionCard>

            <SectionCard>
                <SectionTitle>
                    <h3>{editorTabMeta.find((tab) => tab.key === activeEditorTab)?.label} 목록</h3>
                    <SectionTitleActions>
                        <Button variant="ghost" size="sm" onClick={onToggleEntityListCollapsed}>
                            {isEntityListCollapsed ? '목록 펼치기' : '목록 접기'}
                        </Button>
                        <span>{filteredActiveEditorItems.length}개</span>
                    </SectionTitleActions>
                </SectionTitle>

                {activeEditorTab === 'poi' && (
                    <DetailActions>
                        <Button variant={isAddingPoi ? 'primary' : 'outlineGray'} size="sm" onClick={onToggleAddPoi}>
                            {isAddingPoi ? 'POI 추가 취소' : 'POI 추가'}
                        </Button>
                        {isAddingPoi && <FieldHint>지도에서 원하는 위치를 클릭하면 새 POI가 생성됩니다.</FieldHint>}
                    </DetailActions>
                )}

                {activeEditorTab === 'zone' && (
                    <DetailActions>
                        <Button variant={isAddingZone ? 'primary' : 'outlineGray'} size="sm" onClick={onToggleAddZone}>
                            {isAddingZone ? '영역 추가 취소' : '영역 추가'}
                        </Button>
                        {isAddingZone && (
                            <>
                                <Button variant="outlineGray" size="sm" onClick={onUndoDraftZoneVertex} disabled={draftZoneVertices.length === 0}>
                                    마지막 점 삭제
                                </Button>
                                <Button variant="outlineGray" size="sm" onClick={onCompleteZoneDraft} disabled={draftZoneVertices.length < 3}>
                                    영역 완성
                                </Button>
                            </>
                        )}
                    </DetailActions>
                )}

                {activeEditorTab === 'node' && (
                    <DetailActions>
                        <Button variant={isAddingNode ? 'primary' : 'outlineGray'} size="sm" onClick={onToggleAddNode}>
                            {isAddingNode ? '노드 추가 취소' : '노드 추가'}
                        </Button>
                        {isAddingNode && <FieldHint>지도에서 원하는 위치를 클릭하면 새 노드가 생성됩니다.</FieldHint>}
                    </DetailActions>
                )}

                {activeEditorTab === 'edge' && (
                    <DetailActions>
                        <Button variant={isAddingEdge ? 'primary' : 'outlineGray'} size="sm" onClick={onToggleAddEdge}>
                            {isAddingEdge ? '엣지 추가 취소' : '엣지 추가'}
                        </Button>
                        {isAddingEdge && (
                            <FieldHint>
                                {!edgeStartNodeId ? '지도의 시작 노드를 선택(클릭)하세요.' : '지도의 도착 노드를 선택(클릭)하면 엣지가 생성됩니다.'}
                            </FieldHint>
                        )}
                    </DetailActions>
                )}

                <HelpText>
                    {activeEditorTab === 'poi'
                        ? 'POI 이름은 지도 위에 검은 라벨로 먼저 보이고, 패널에서 검색과 목록 정리를 진행합니다.'
                        : activeEditorTab === 'edge'
                            ? '엣지는 시작/도착 노드 기준으로 확인하고, 선택 시 지도에서 더 진하게 표시됩니다.'
                            : activeEditorTab === 'node'
                                ? '출입구, 교차점, 수직 연결점 등 길찾기 핵심 노드를 먼저 점검합니다.'
                                : '공간과 통행 구역은 이름과 polygon 범위를 먼저 확인합니다.'}
                </HelpText>

                {(activeEditorTab === 'poi' || activeEditorTab === 'zone') && (
                    <InlineFieldRow>
                        <FieldGroup>
                            <span>{activeEditorTab === 'poi' ? 'POI 검색' : 'Zone 검색'}</span>
                            <SearchInput
                                value={entitySearch}
                                onChange={(event) => onChangeEntitySearch(event.target.value)}
                                placeholder={activeEditorTab === 'poi' ? '이름, 카테고리, 설명 검색' : '이름, 유형, 설명 검색'}
                            />
                        </FieldGroup>
                    </InlineFieldRow>
                )}

                {activeEditorTab === 'zone' && (
                    <Toolbar>
                        {[
                            ['all', '전체'],
                            ['room', 'room'],
                            ['corridor', 'corridor'],
                            ['restricted', 'restricted'],
                        ].map(([value, label]) => (
                            <Button
                                key={value}
                                variant={zoneKindFilter === value ? 'primary' : 'outlineGray'}
                                size="sm"
                                onClick={() => onChangeZoneKindFilter(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </Toolbar>
                )}

                {activeEditorTab === 'zone' && (
                    <>
                        {isAddingZone && (
                            <FieldHint>
                                지도를 클릭해 꼭짓점을 추가하세요. 첫 점 근처를 다시 클릭하거나 `영역 완성`을 누르면 polygon이 닫힙니다.
                            </FieldHint>
                        )}
                        {zoneDraftError && <HelpText style={{ color: '#b91c1c' }}>{zoneDraftError}</HelpText>}
                    </>
                )}

                {!isEntityListCollapsed && (
                    <EntityList>
                        {filteredActiveEditorItems.length > 0 ? (
                            filteredActiveEditorItems.map((item) => {
                                const isItemSelected = selectedEntity?.type === activeEditorTab && selectedEntity.id === item.id

                                return (
                                    <EntityItem
                                        key={item.id}
                                        ref={isItemSelected ? selectedListItemRef : null}
                                        type="button"
                                        $active={isItemSelected}
                                        onClick={() => onSelectEntity(activeEditorTab, item.id)}
                                    >
                                        <EntityTitle>
                                            <strong>{item.title}</strong>
                                            <span>{item.badge}</span>
                                        </EntityTitle>
                                        <EntityMeta>{item.subtitle}</EntityMeta>
                                    </EntityItem>
                                )
                            })
                        ) : (
                            <HelpText>검색 조건에 맞는 {activeEditorTab === 'poi' ? 'POI' : '항목'}가 없습니다.</HelpText>
                        )}
                    </EntityList>
                )}
            </SectionCard>
        </>
    )
}
