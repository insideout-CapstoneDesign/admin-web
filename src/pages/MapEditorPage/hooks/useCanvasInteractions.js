import { useRef, useState } from 'react'

export default function useCanvasInteractions({
    mapViewportRef,
    imageCanvasRef,
    displayDimensions,
    zoom,
    setZoom,
    toolMode,
    activeEditorTab,
    pendingGatePick,
    activeConnectorForMapping,
    handleMapCampusGate,
    handleMapVerticalNode,
    isAddingPoi,
    isAddingZone,
    isAddingNode,
    isAddingEdge,
    edgeStartNodeId,
    setEdgeStartNodeId,
    selectedEntity,
    setSelectedEntity,
    setActiveEditorTab,
    setSelectedZoneVertexIndex,
    setCreatedNodes,
    setCreatedEdges,
    setCreatedPois,
    setCreatedZones,
    setIsAddingNode,
    setIsAddingEdge,
    setIsAddingPoi,
    setIsAddingZone,
    draftZoneVertices,
    setDraftZoneVertices,
    setZoneDraftError,
    editedNodes,
    editedEdges,
    nodeShapes,
    zoneSnapPoints,
    updateZoneVertices,
    updateNodePosition,
    updateSelectedEntityPatch,
    updateSelectedPoiAttrsPatch,
    buildPolygonGeometry,
    distanceBetweenPoints,
    getSnappedPoint,
    getPolygonVertices,
    isSimplePolygon,
    translateGeometry,
}) {
    const dragStateRef = useRef(null)
    const entityDragRef = useRef(null)
    const [isPanning, setIsPanning] = useState(false)

    const updateZoom = (nextZoom, clientX = null, clientY = null) => {
        const viewport = mapViewportRef.current
        const normalizedNext = Math.min(2.4, Math.max(0.6, Number(nextZoom.toFixed(2))))

        if (!viewport || clientX == null || clientY == null) {
            setZoom(normalizedNext)
            return
        }

        const rect = viewport.getBoundingClientRect()
        const offsetX = clientX - rect.left + viewport.scrollLeft
        const offsetY = clientY - rect.top + viewport.scrollTop
        const scaleRatio = normalizedNext / zoom

        setZoom(normalizedNext)

        requestAnimationFrame(() => {
            viewport.scrollLeft = (offsetX * scaleRatio) - (clientX - rect.left)
            viewport.scrollTop = (offsetY * scaleRatio) - (clientY - rect.top)
        })
    }

    const handleViewportWheel = (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            const delta = event.deltaY > 0 ? -0.12 : 0.12
            updateZoom(zoom + delta, event.clientX, event.clientY)
        }
    }

    const handleViewportPointerDown = (event) => {
        if (toolMode !== 'pan' || event.button !== 0 || !mapViewportRef.current) return

        dragStateRef.current = {
            x: event.clientX,
            y: event.clientY,
            scrollLeft: mapViewportRef.current.scrollLeft,
            scrollTop: mapViewportRef.current.scrollTop,
        }
        setIsPanning(true)
        mapViewportRef.current.setPointerCapture?.(event.pointerId)
    }

    function toCanvasPoint(clientX, clientY) {
        const canvas = imageCanvasRef.current
        const dimensions = displayDimensions
        if (!canvas || !dimensions) return null

        const rect = canvas.getBoundingClientRect()
        if (!rect.width || !rect.height) return null

        return {
            x: ((clientX - rect.left) / rect.width) * dimensions.viewBoxWidth,
            y: ((clientY - rect.top) / rect.height) * dimensions.viewBoxHeight,
        }
    }

    const handleViewportPointerMove = (event) => {
        if (entityDragRef.current) {
            const nextPoint = toCanvasPoint(event.clientX, event.clientY)
            if (!nextPoint) return

            const dragState = entityDragRef.current
            if (dragState.type === 'zone-vertex') {
                const snappedPoint = getSnappedPoint(
                    nextPoint,
                    zoneSnapPoints.filter((target) => !(target.zoneId === dragState.id && target.vertexIndex === dragState.vertexIndex)),
                )
                updateZoneVertices(dragState.id, (vertices) =>
                    vertices.map((vertex, index) => (
                        index === dragState.vertexIndex
                            ? { x: snappedPoint.x, y: snappedPoint.y }
                            : vertex
                    ))
                )
                return
            }

            if (dragState.type === 'node') {
                const snappedPoint = getSnappedPoint(
                    nextPoint,
                    nodeShapes
                        .filter((node) => node.id !== dragState.id)
                        .map((node) => ({ x: node.x, y: node.y })),
                    12,
                )
                updateNodePosition(dragState.id, snappedPoint, dragState.connectedEdges, dragState.nodeOriginalPosition)
                return
            }

            const dx = nextPoint.x - dragState.startPoint.x
            const dy = nextPoint.y - dragState.startPoint.y

            updateSelectedEntityPatch(dragState.type, dragState.id, {
                geomPx: translateGeometry(dragState.originalGeomPx, dx, dy),
                footprintPx: translateGeometry(dragState.originalFootprintPx, dx, dy),
            })
            return
        }

        if (toolMode !== 'pan' || !mapViewportRef.current || !dragStateRef.current) return

        const dx = event.clientX - dragStateRef.current.x
        const dy = event.clientY - dragStateRef.current.y
        mapViewportRef.current.scrollLeft = dragStateRef.current.scrollLeft - dx
        mapViewportRef.current.scrollTop = dragStateRef.current.scrollTop - dy
    }

    const handleViewportPointerUp = (event) => {
        entityDragRef.current = null
        setIsPanning(false)
        if (toolMode !== 'pan' || !mapViewportRef.current) return
        dragStateRef.current = null
        mapViewportRef.current.releasePointerCapture?.(event.pointerId)
    }

    function resetAddingEdge() {
        setIsAddingEdge(false)
        setEdgeStartNodeId(null)
    }

    function createEdgeBetweenNodes(fromId, toId) {
        const fromNode = editedNodes.find((node) => node.id === fromId)
        const toNode = editedNodes.find((node) => node.id === toId)
        if (!fromNode || !toNode) {
            window.alert('선택한 노드를 찾을 수 없습니다.')
            resetAddingEdge()
            return
        }

        const nextEdgeId = globalThis.crypto?.randomUUID?.() || `local-edge-${Date.now()}`
        const fromCoords = fromNode.geomPx?.coordinates || [0, 0]
        const toCoords = toNode.geomPx?.coordinates || [0, 0]

        const nextEdge = {
            id: nextEdgeId,
            fromNodeId: fromId,
            toNodeId: toId,
            kind: 'walkway',
            properties: {},
            geomPx: {
                type: 'LineString',
                coordinates: [fromCoords, toCoords],
            },
            source: 'manual',
        }

        setCreatedEdges((current) => [...current, nextEdge])
        setActiveEditorTab('edge')
        setSelectedEntity({ type: 'edge', id: nextEdgeId })
        resetAddingEdge()
        window.alert('성공적으로 엣지가 추가되었습니다.')
    }

    const handleEntitySelect = (type, id) => {
        if (toolMode !== 'select') return

        if (pendingGatePick) {
            if (type !== 'node') {
                window.alert(`${pendingGatePick.gateName}에 연결할 노드를 지도에서 클릭해 주세요.`)
                return
            }

            setSelectedEntity({ type: 'node', id })
            void handleMapCampusGate(id, pendingGatePick.gateId)
            return
        }

        if (activeConnectorForMapping) {
            if (type !== 'node') {
                window.alert('수직 이동 노드 매핑 모드입니다. 노드를 클릭해 주세요.')
                return
            }

            void handleMapVerticalNode(activeConnectorForMapping.connectorId, activeConnectorForMapping.floorId, id)
            return
        }

        if (isAddingEdge) {
            if (type === 'node') {
                if (!edgeStartNodeId) {
                    setEdgeStartNodeId(id)
                    window.alert('도착 노드를 클릭하면 엣지가 생성됩니다.')
                } else {
                    if (edgeStartNodeId === id) {
                        window.alert('시작 노드와 도착 노드가 동일할 수 없습니다. 다른 노드를 선택하세요.')
                        return
                    }
                    createEdgeBetweenNodes(edgeStartNodeId, id)
                }
            } else {
                window.alert('엣지 생성 모드입니다. 노드를 클릭해 주세요.')
            }
            return
        }

        setActiveEditorTab(type)
        if (type !== 'zone' || selectedEntity?.id !== id) {
            setSelectedZoneVertexIndex(null)
        }
        setSelectedEntity({ type, id })
    }

    const viewportCursor = toolMode === 'pan'
        ? (isPanning ? 'grabbing' : 'grab')
        : ((pendingGatePick || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) ? 'crosshair' : 'default')

    function createNodeAtPoint(point) {
        const nextNodeId = globalThis.crypto?.randomUUID?.() || `local-node-${Date.now()}`
        const nextNode = {
            id: nextNodeId,
            name: '',
            kind: 'corridor',
            properties: {},
            geomPx: {
                type: 'Point',
                coordinates: [point.x, point.y],
            },
            source: 'manual',
        }

        setCreatedNodes((current) => [...current, nextNode])
        setActiveEditorTab('node')
        setSelectedEntity({ type: 'node', id: nextNodeId })
        setIsAddingNode(false)
    }

    function createPoiAtPoint(point) {
        const nextPoiId = globalThis.crypto?.randomUUID?.() || `local-poi-${Date.now()}`
        const nextPoi = {
            id: nextPoiId,
            name: '새 POI',
            kind: 'poi',
            code: 'store.unknown',
            source: 'manual',
            externalApiId: null,
            anchorNodeId: null,
            geomPx: {
                type: 'Point',
                coordinates: [point.x, point.y],
            },
            footprintPx: null,
            attrs: {
                label: 'store.unknown',
            },
        }

        setCreatedPois((current) => [...current, nextPoi])
        setActiveEditorTab('poi')
        setSelectedEntity({ type: 'poi', id: nextPoiId })
        setIsAddingPoi(false)
    }

    function createZoneFromVertices(vertices) {
        if (!isSimplePolygon(vertices)) {
            setZoneDraftError('영역 모양이 겹치거나 너무 작아 저장할 수 없습니다.')
            return
        }

        const nextZoneId = globalThis.crypto?.randomUUID?.() || `local-zone-${Date.now()}`
        const nextZone = {
            id: nextZoneId,
            name: '새 공간',
            kind: 'room',
            properties: {},
            geomPx: buildPolygonGeometry(vertices),
            source: 'manual',
        }

        setCreatedZones((current) => [...current, nextZone])
        setActiveEditorTab('zone')
        setSelectedEntity({ type: 'zone', id: nextZoneId })
        setSelectedZoneVertexIndex(null)
        setDraftZoneVertices([])
        setIsAddingZone(false)
        setZoneDraftError('')
    }

    const handleViewportPointerDownCapture = (event) => {
        if (toolMode !== 'select' || event.button !== 0) return

        const point = toCanvasPoint(event.clientX, event.clientY)
        if (!point) return

        if (isAddingNode && activeEditorTab === 'node') {
            event.preventDefault()
            event.stopPropagation()
            createNodeAtPoint(point)
            return
        }

        if (isAddingPoi && activeEditorTab === 'poi') {
            event.preventDefault()
            event.stopPropagation()
            createPoiAtPoint(point)
            return
        }

        if (isAddingZone && activeEditorTab === 'zone') {
            event.preventDefault()
            event.stopPropagation()
            const snappedPoint = getSnappedPoint(point, zoneSnapPoints)
            const shouldCloseDraft = draftZoneVertices.length >= 3 && distanceBetweenPoints(snappedPoint, draftZoneVertices[0]) <= 16

            if (shouldCloseDraft) {
                createZoneFromVertices(draftZoneVertices)
                return
            }

            setZoneDraftError('')
            setDraftZoneVertices((current) => [...current, snappedPoint])
        }
    }

    function startPoiDrag(event, poi) {
        if (toolMode !== 'select' || event.button !== 0 || !poi.point || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) return

        const startPoint = toCanvasPoint(event.clientX, event.clientY)
        if (!startPoint) return

        event.stopPropagation()
        setActiveEditorTab('poi')
        setSelectedEntity({ type: 'poi', id: poi.id })
        entityDragRef.current = {
            type: 'poi',
            id: poi.id,
            startPoint,
            originalGeomPx: poi.rawGeomPx,
            originalFootprintPx: poi.rawFootprintPx,
        }
    }

    function startNodeDrag(event, node) {
        if (toolMode !== 'select' || event.button !== 0 || pendingGatePick || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) return

        const startPoint = toCanvasPoint(event.clientX, event.clientY)
        if (!startPoint) return

        event.stopPropagation()
        setActiveEditorTab('node')
        setSelectedEntity({ type: 'node', id: node.id })
        entityDragRef.current = {
            type: 'node',
            id: node.id,
            startPoint,
            nodeOriginalPosition: { x: node.x, y: node.y },
            connectedEdges: editedEdges.flatMap((edge) => ([
                edge.fromNodeId === node.id ? { edge, role: 'from', originalGeomPx: edge.geomPx } : null,
                edge.toNodeId === node.id ? { edge, role: 'to', originalGeomPx: edge.geomPx } : null,
            ].filter(Boolean))),
        }
    }

    function startZoneVertexDrag(event, zoneId, vertexIndex) {
        if (toolMode !== 'select' || event.button !== 0 || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) return

        const startPoint = toCanvasPoint(event.clientX, event.clientY)
        if (!startPoint) return

        event.stopPropagation()
        setActiveEditorTab('zone')
        setSelectedEntity({ type: 'zone', id: zoneId })
        setSelectedZoneVertexIndex(vertexIndex)
        entityDragRef.current = {
            type: 'zone-vertex',
            id: zoneId,
            vertexIndex,
            startPoint,
        }
    }

    function insertZoneVertex(zoneId, insertIndex, point) {
        updateZoneVertices(zoneId, (vertices) => {
            const nextVertices = [...vertices]
            nextVertices.splice(insertIndex, 0, point)
            return nextVertices
        })
        setActiveEditorTab('zone')
        setSelectedEntity({ type: 'zone', id: zoneId })
        setSelectedZoneVertexIndex(insertIndex)
    }

    return {
        updateZoom,
        handleViewportWheel,
        handleViewportPointerDown,
        handleViewportPointerMove,
        handleViewportPointerUp,
        handleEntitySelect,
        viewportCursor,
        startPoiDrag,
        startNodeDrag,
        startZoneVertexDrag,
        insertZoneVertex,
        handleViewportPointerDownCapture,
        resetAddingEdge,
        createZoneFromVertices,
    }
}
