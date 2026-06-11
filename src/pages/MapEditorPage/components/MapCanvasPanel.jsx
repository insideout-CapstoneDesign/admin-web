import styled from 'styled-components'
import Button from '../../../components/Button/Button'

const HelpText = styled.div`
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.6;
`

const VerticalPickBanner = styled.div`
    border: 1px solid rgba(59, 130, 246, 0.22);
    background: linear-gradient(180deg, rgba(239, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
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

const CanvasStage = styled.div`
    position: relative;
    width: 100%;
    height: min(82vh, 960px);
    min-height: 680px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 12px;
    border-radius: 22px;
    background:
        radial-gradient(circle at top left, rgba(59, 130, 246, 0.06), transparent 34%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    overflow: hidden;
`

const MapViewport = styled.div`
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 16px;
    overscroll-behavior: contain;
`

const ZoomCanvasSizer = styled.div`
    position: relative;
    flex: none;
`

const ZoomCanvasInner = styled.div`
    transform-origin: top left;
`

const ZoomToolbar = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    display: inline-flex;
    gap: 8px;
    padding: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.4);
`

const ToolToolbar = styled(ZoomToolbar)`
    left: 12px;
    right: auto;
`

const ZoomButton = styled.button`
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: ${({ $primary }) => ($primary ? 'rgba(59, 130, 246, 0.1)' : '#fff')};
    color: ${({ $primary }) => ($primary ? '#1d4ed8' : '#475569')};
    min-width: 38px;
    height: 38px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
`

const PanelToggleButton = styled.button`
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(255, 255, 255, 0.94);
    color: #334155;
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 14px 24px -20px rgba(15, 23, 42, 0.42);
`

const ImageCanvas = styled.div`
    position: relative;
    display: inline-block;
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    line-height: 0;
    box-shadow: 0 32px 80px -56px rgba(15, 23, 42, 0.7);
`

const PreviewImage = styled.img`
    display: block;
    width: auto;
    max-width: min(100%, 1120px);
    height: auto;
    max-height: 74vh;
`

const OverlaySvg = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`

const EmptyState = styled.div`
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px dashed rgba(148, 163, 184, 0.3);
    color: var(--gray-500);
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
`

export default function MapCanvasPanel({
    activeConnectorForMapping,
    floorNameById,
    onCancelConnectorMapping,
    toolMode,
    onChangeToolMode,
    isPreviewMode,
    isEditorCollapsed,
    onToggleEditorCollapsed,
    zoom,
    setZoom,
    editorData,
    displayDimensions,
    mapViewportRef,
    imageCanvasRef,
    handleViewportPointerDownCapture,
    handleViewportWheel,
    handleViewportPointerDown,
    handleViewportPointerMove,
    handleViewportPointerUp,
    viewportCursor,
    visibleLayers,
    floorTitle,
    onImageLoadDimensions,
    zoneShapes,
    selectedEntity,
    handleEntitySelect,
    setActiveEditorTab,
    setSelectedEntity,
    selectedZoneVertexIndex,
    setSelectedZoneVertexIndex,
    insertZoneVertex,
    startZoneVertexDrag,
    isAddingZone,
    draftZoneVertices,
    objectShapes,
    edgeShapes,
    editedEdges,
    poiShapes,
    poiLabelScale,
    startPoiDrag,
    nodeShapes,
    selectedRawEntity,
    entranceMappingByNodeId,
    pendingGatePick,
    layerMeta,
    startNodeDrag,
}) {
    const isMappingMode = Boolean(pendingGatePick || activeConnectorForMapping)

    return (
        <CanvasStage>
            {activeConnectorForMapping && (
                <VerticalPickBanner>
                    <ConnectionPickText>
                        <strong>[{activeConnectorForMapping.connectorName}] {floorNameById.get(activeConnectorForMapping.floorId)} 노드를 지도에서 클릭하세요.</strong>
                        <HelpText>클릭한 node가 해당 층의 수직 연결 node로 매핑됩니다.</HelpText>
                    </ConnectionPickText>
                    <Button variant="outlineGray" size="sm" onClick={onCancelConnectorMapping}>
                        선택 취소
                    </Button>
                </VerticalPickBanner>
            )}

            <ToolToolbar>
                <ZoomButton
                    type="button"
                    $primary={toolMode === 'select'}
                    onClick={() => onChangeToolMode('select')}
                    title="선택 모드"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                    </svg>
                </ZoomButton>
                <ZoomButton
                    type="button"
                    $primary={toolMode === 'pan'}
                    onClick={() => onChangeToolMode('pan')}
                    title="이동 모드"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 11V5a2 2 0 1 1 4 0v4" />
                        <path d="M12 9V4a2 2 0 1 1 4 0v5" />
                        <path d="M16 10V6a2 2 0 1 1 4 0v8c0 4.4-3.6 8-8 8h-1c-3.3 0-6.2-2-7.4-5L2 11.5A2 2 0 0 1 5.5 9l2.5 3" />
                    </svg>
                </ZoomButton>
                <PanelToggleButton type="button" onClick={onToggleEditorCollapsed}>
                    {isEditorCollapsed ? '편집기 열기' : '편집기 접기'}
                </PanelToggleButton>
            </ToolToolbar>

            <ZoomToolbar>
                <ZoomButton type="button" onClick={() => setZoom((current) => Math.max(0.6, Number((current - 0.2).toFixed(1))))}>-</ZoomButton>
                <ZoomButton type="button" $primary onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</ZoomButton>
                <ZoomButton type="button" onClick={() => setZoom((current) => Math.min(2.4, Number((current + 0.2).toFixed(1))))}>+</ZoomButton>
            </ZoomToolbar>

            {editorData?.floorplanImageUrl && displayDimensions ? (
                <MapViewport
                    ref={mapViewportRef}
                    onPointerDownCapture={handleViewportPointerDownCapture}
                    onWheel={handleViewportWheel}
                    onPointerDown={handleViewportPointerDown}
                    onPointerMove={handleViewportPointerMove}
                    onPointerUp={handleViewportPointerUp}
                    onPointerLeave={handleViewportPointerUp}
                    style={{ cursor: viewportCursor }}
                >
                    <ZoomCanvasSizer
                        style={{
                            width: `${displayDimensions.width * zoom}px`,
                            height: `${displayDimensions.height * zoom}px`,
                            margin: '0 auto',
                        }}
                    >
                        <ZoomCanvasInner
                            style={{
                                width: `${displayDimensions.width}px`,
                                height: `${displayDimensions.height}px`,
                                transform: `scale(${zoom})`,
                            }}
                        >
                            <ImageCanvas ref={imageCanvasRef} style={{ width: `${displayDimensions.width}px`, height: `${displayDimensions.height}px` }}>
                                {!isPreviewMode && visibleLayers.floorplan && (
                                    <PreviewImage
                                        src={editorData.floorplanImageUrl}
                                        alt={`${floorTitle} 도면`}
                                        style={{ width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', objectFit: 'contain' }}
                                        onLoad={(event) => {
                                            const width = event.currentTarget.naturalWidth
                                            const height = event.currentTarget.naturalHeight
                                            if (width && height) {
                                                onImageLoadDimensions({ width, height })
                                            }
                                        }}
                                    />
                                )}

                                <OverlaySvg
                                    viewBox={`0 0 ${displayDimensions.viewBoxWidth} ${displayDimensions.viewBoxHeight}`}
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {zoneShapes.map((shape) => {
                                        const zoneLayerMeta = shape.zoneKind === 'corridor'
                                            ? layerMeta.corridors
                                            : layerMeta.rooms

                                        return (
                                            <path
                                                key={`zone-${shape.id}`}
                                                d={shape.path}
                                                fill={selectedEntity?.type === 'zone' && selectedEntity.id === shape.id ? 'rgba(220, 38, 38, 0.12)' : zoneLayerMeta.bg}
                                                stroke={selectedEntity?.type === 'zone' && selectedEntity.id === shape.id ? '#dc2626' : zoneLayerMeta.color}
                                                strokeWidth={selectedEntity?.type === 'zone' && selectedEntity.id === shape.id ? '3.5' : '2'}
                                                strokeLinejoin="round"
                                                style={{ pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'pointer' : 'default' }}
                                                onClick={() => handleEntitySelect('zone', shape.id)}
                                            />
                                        )
                                    })}

                                    {zoneShapes.map((shape) => {
                                        const isSelectedZone = !isPreviewMode && selectedEntity?.type === 'zone' && selectedEntity.id === shape.id
                                        if (!isSelectedZone || !Array.isArray(shape.vertices) || shape.vertices.length < 3) {
                                            return null
                                        }

                                        return (
                                            <g key={`zone-edit-${shape.id}`}>
                                                {shape.midpoints?.map((midpoint) => (
                                                    <circle
                                                        key={`zone-mid-${shape.id}-${midpoint.insertIndex}`}
                                                        cx={midpoint.x}
                                                        cy={midpoint.y}
                                                        r="5.5"
                                                        fill="#ffffff"
                                                        stroke="#f97316"
                                                        strokeWidth="2"
                                                        style={{ pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'copy' : 'default' }}
                                                        onClick={(event) => {
                                                            if (toolMode !== 'select') return
                                                            event.stopPropagation()
                                                            insertZoneVertex(shape.id, midpoint.insertIndex, { x: midpoint.x, y: midpoint.y })
                                                        }}
                                                    />
                                                ))}
                                                {shape.vertices.map((vertex, index) => {
                                                    const isActiveVertex = selectedZoneVertexIndex === index
                                                    return (
                                                        <circle
                                                            key={`zone-vertex-${shape.id}-${index}`}
                                                            cx={vertex.x}
                                                            cy={vertex.y}
                                                            r={isActiveVertex ? '8' : '6.5'}
                                                            fill={isActiveVertex ? '#dc2626' : '#ffffff'}
                                                            stroke="#dc2626"
                                                            strokeWidth="2.5"
                                                            style={{ pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'grab' : 'default' }}
                                                            onClick={(event) => {
                                                                if (toolMode !== 'select') return
                                                                event.stopPropagation()
                                                                setActiveEditorTab('zone')
                                                                setSelectedEntity({ type: 'zone', id: shape.id })
                                                                setSelectedZoneVertexIndex(index)
                                                            }}
                                                            onPointerDown={(event) => startZoneVertexDrag(event, shape.id, index)}
                                                        />
                                                    )
                                                })}
                                            </g>
                                        )
                                    })}

                                    {isAddingZone && draftZoneVertices.length > 0 && (
                                        <g>
                                            {draftZoneVertices.length >= 3 && (
                                                <path
                                                    d={`M ${draftZoneVertices[0].x} ${draftZoneVertices[0].y} ${draftZoneVertices.slice(1).map((vertex) => `L ${vertex.x} ${vertex.y}`).join(' ')} Z`}
                                                    fill="rgba(249, 115, 22, 0.10)"
                                                    stroke="none"
                                                />
                                            )}
                                            {draftZoneVertices.length >= 2 && (
                                                <path
                                                    d={`M ${draftZoneVertices[0].x} ${draftZoneVertices[0].y} ${draftZoneVertices.slice(1).map((vertex) => `L ${vertex.x} ${vertex.y}`).join(' ')}`}
                                                    fill="none"
                                                    stroke="#f97316"
                                                    strokeWidth="2.5"
                                                    strokeDasharray="8 6"
                                                />
                                            )}
                                            {draftZoneVertices.map((vertex, index) => (
                                                <circle
                                                    key={`draft-zone-${index}`}
                                                    cx={vertex.x}
                                                    cy={vertex.y}
                                                    r={index === 0 ? '7' : '6'}
                                                    fill="#ffffff"
                                                    stroke="#f97316"
                                                    strokeWidth="2.5"
                                                />
                                            ))}
                                        </g>
                                    )}

                                    {objectShapes.map((shape) => {
                                        if (shape.geometryKind === 'polygon') {
                                            return (
                                                <path
                                                    key={`object-${shape.id}`}
                                                    d={shape.path}
                                                    fill="rgba(17, 24, 39, 0.02)"
                                                    stroke="#111827"
                                                    strokeWidth={shape.objectKind === 'door' ? 2.5 : 2}
                                                />
                                            )
                                        }

                                        if (shape.geometryKind === 'line') {
                                            return (
                                                <polyline
                                                    key={`object-${shape.id}`}
                                                    points={shape.points}
                                                    fill="none"
                                                    stroke={shape.objectKind === 'door' ? '#ea580c' : '#111827'}
                                                    strokeWidth={shape.objectKind === 'door' ? 3 : 2.5}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            )
                                        }

                                        if (shape.geometryKind === 'bbox') {
                                            return (
                                                <rect
                                                    key={`object-${shape.id}`}
                                                    x={shape.x}
                                                    y={shape.y}
                                                    width={shape.width}
                                                    height={shape.height}
                                                    fill="rgba(17, 24, 39, 0.02)"
                                                    stroke="#111827"
                                                    strokeWidth="2"
                                                />
                                            )
                                        }

                                        return null
                                    })}

                                    {!isPreviewMode && edgeShapes.map((shape) => (
                                        shape.geometryKind === 'line' ? (
                                            (() => {
                                                const linkedEdge = editedEdges.find((edge) => edge.id === shape.id)
                                                const isLinkedToSelectedNode = selectedEntity?.type === 'node'
                                                    && linkedEdge
                                                    && (linkedEdge.fromNodeId === selectedEntity.id || linkedEdge.toNodeId === selectedEntity.id)

                                                return (
                                                    <polyline
                                                        key={`edge-${shape.id}`}
                                                        points={shape.points}
                                                        fill="none"
                                                        stroke={selectedEntity?.type === 'edge' && selectedEntity.id === shape.id ? '#7c3aed' : isLinkedToSelectedNode ? '#2563eb' : layerMeta.edges.color}
                                                        strokeWidth={selectedEntity?.type === 'edge' && selectedEntity.id === shape.id ? '6' : isLinkedToSelectedNode ? '5' : '4'}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{ pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'pointer' : 'default' }}
                                                        onClick={() => handleEntitySelect('edge', shape.id)}
                                                    />
                                                )
                                            })()
                                        ) : null
                                    ))}

                                    {poiShapes.map((poi) => (
                                        poi.footprint?.kind === 'polygon' ? (
                                            <path
                                                key={`poi-footprint-${poi.id}`}
                                                d={poi.footprint.path}
                                                fill={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? 'rgba(124, 58, 237, 0.14)' : 'rgba(124, 58, 237, 0.06)'}
                                                stroke={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '#5b21b6' : layerMeta.pois.color}
                                                strokeWidth={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '4' : '2'}
                                                style={{ pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'pointer' : 'default' }}
                                                onClick={() => handleEntitySelect('poi', poi.id)}
                                            />
                                        ) : null
                                    ))}

                                    {poiShapes.map((poi) => (
                                        poi.point ? (
                                            <g key={`poi-point-${poi.id}`}>
                                                {!isPreviewMode && selectedEntity?.type === 'poi' && selectedEntity.id === poi.id && (
                                                    <circle
                                                        cx={poi.point.x}
                                                        cy={poi.point.y}
                                                        r="18"
                                                        fill="rgba(124, 58, 237, 0.12)"
                                                        stroke="#5b21b6"
                                                        strokeWidth="2"
                                                    />
                                                )}
                                                <circle
                                                    cx={poi.point.x}
                                                    cy={poi.point.y}
                                                    r={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '12' : '10'}
                                                    fill="rgba(124, 58, 237, 0.14)"
                                                    stroke={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '#5b21b6' : layerMeta.pois.color}
                                                    strokeWidth="2.5"
                                                    style={{ pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'grab' : 'default' }}
                                                    onClick={() => handleEntitySelect('poi', poi.id)}
                                                    onPointerDown={(event) => startPoiDrag(event, poi)}
                                                />
                                                <circle cx={poi.point.x} cy={poi.point.y} r="3.5" fill={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '#5b21b6' : layerMeta.pois.color} />
                                            </g>
                                        ) : null
                                    ))}

                                    {!isPreviewMode && nodeShapes.map((node) => {
                                        const isSelectedNode = selectedEntity?.type === 'node' && selectedEntity.id === node.id
                                        const isAnchoredFromPoi = selectedEntity?.type === 'poi' && selectedRawEntity?.anchorNodeId === node.id
                                        const mappedGate = entranceMappingByNodeId.get(node.id)
                                        const isPendingGateNode = pendingGatePick && mappedGate?.campusGateId === pendingGatePick.gateId
                                        const isHighlighted = isSelectedNode || isAnchoredFromPoi || Boolean(mappedGate)
                                        const strokeColor = isPendingGateNode
                                            ? '#2563eb'
                                            : isHighlighted
                                                ? '#5b21b6'
                                                : layerMeta.nodes.color

                                        return (
                                            <g key={`node-${node.id}`}>
                                                <circle
                                                    cx={node.x}
                                                    cy={node.y}
                                                    r={isPendingGateNode ? '11' : isHighlighted ? '10' : '7.5'}
                                                    fill={isPendingGateNode ? 'rgba(37, 99, 235, 0.16)' : isHighlighted ? 'rgba(91, 33, 182, 0.14)' : layerMeta.nodes.bg}
                                                    stroke={strokeColor}
                                                    strokeWidth="3"
                                                    style={{ pointerEvents: 'auto', cursor: isMappingMode ? 'pointer' : (toolMode === 'select' ? 'grab' : 'default') }}
                                                    onClick={() => handleEntitySelect('node', node.id)}
                                                    onPointerDown={(event) => startNodeDrag(event, node)}
                                                />
                                                <circle cx={node.x} cy={node.y} r="3" fill={strokeColor} />
                                            </g>
                                        )
                                    })}
                                </OverlaySvg>

                                <OverlaySvg
                                    viewBox={`0 0 ${displayDimensions.viewBoxWidth} ${displayDimensions.viewBoxHeight}`}
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {visibleLayers.pois && poiShapes.map((poi) => {
                                        if (!poi.displayName || !poi.labelPosition) return null

                                        const isSelected = selectedEntity?.type === 'poi' && selectedEntity.id === poi.id
                                        const fontSize = Math.round((poi.isFacility ? 14 : 20) * poiLabelScale * poi.labelScale)
                                        const y = poi.labelPosition.y + (poi.isFacility ? -18 : 2)

                                        return (
                                            <g key={`poi-label-${poi.id}`}>
                                                <text
                                                    x={poi.labelPosition.x}
                                                    y={y}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill={isSelected ? '#5b21b6' : '#111827'}
                                                    stroke="rgba(255,255,255,0.96)"
                                                    strokeWidth="3.2"
                                                    paintOrder="stroke"
                                                    style={{ fontSize: `${fontSize}px`, fontWeight: 700, letterSpacing: '-0.02em', pointerEvents: isMappingMode ? 'none' : 'auto', cursor: toolMode === 'select' ? 'grab' : 'default' }}
                                                    onClick={() => handleEntitySelect('poi', poi.id)}
                                                    onPointerDown={(event) => startPoiDrag(event, poi)}
                                                >
                                                    {poi.displayName}
                                                </text>
                                            </g>
                                        )
                                    })}
                                </OverlaySvg>
                            </ImageCanvas>
                        </ZoomCanvasInner>
                    </ZoomCanvasSizer>
                </MapViewport>
            ) : (
                <EmptyState>이 층에는 아직 도면 이미지가 없어 맵 에디터 캔버스를 그릴 수 없습니다.</EmptyState>
            )}
        </CanvasStage>
    )
}
