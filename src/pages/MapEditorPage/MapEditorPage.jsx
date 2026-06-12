import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { getMapEditorFloorApi, saveMapEditorFloorDraftApi } from '../../api/buildingApi'
import ConnectionPanel from './components/ConnectionPanel'
import EntityEditorPanel from './components/EntityEditorPanel'
import MapCanvasPanel from './components/MapCanvasPanel'
import useCanvasInteractions from './hooks/useCanvasInteractions'
import useConnectionMappings from './hooks/useConnectionMappings'
import useMapEditorDerivedData from './hooks/useMapEditorDerivedData'
import usePublishReview from './hooks/usePublishReview'
import {
    BackButton,
    CanvasCard,
    Container,
    DetailActions,
    EditorBody,
    EditorCard,
    EditorHeader,
    EditorTabButton,
    EditorTabs,
    EditorTopBar,
    ErrorCard,
    FloorChip,
    FloorSwitcher,
    HeaderCard,
    HeaderUtilityRow,
    LayerScaleGroup,
    LayerScaleLabel,
    LayerToggleGroup,
    LoadingCard,
    PageWrapper,
    QuickLayerPanel,
    ScaleButtonGroup,
    ScaleValueButton,
    StatusBadge,
    StatusRow,
    TitleGroup,
    TitleRow,
    ToggleChip,
    UnsavedBadge,
    WorkspaceLayout,
} from './MapEditorPage.styles'
import {
    normalizePoiCategoryCode,
    POI_CATEGORY_OPTIONS,
} from './utils/publishReview'
import {
    buildPolygonGeometry,
    distanceBetweenPoints,
    getAiTextAnchor,
    getFloorDraftCacheKey,
    getPolygonVertices,
    getSnappedPoint,
    isSimplePolygon,
    translateGeometry,
    updateLineEndpointGeometry,
} from './utils/geometry'

const PublishReviewModal = lazy(() => import('./components/PublishReviewModal'))

const AI_TYPE_META = {
    wall: { label: '벽', color: '#111827', bg: 'rgba(17, 24, 39, 0)' },
    corridor: { label: '통행', color: '#15803d', bg: 'rgba(34, 197, 94, 0.06)' },
    room: { label: '공간', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
    text: { label: '텍스트', color: '#7c3aed', bg: 'rgba(255,255,255,0.96)' },
    poi_candidate: { label: 'POI 후보', color: '#059669', bg: 'rgba(5, 150, 105, 0.16)' },
    node: { label: '노드', color: '#166534', bg: 'rgba(22, 101, 52, 0.16)' },
    node_candidate: { label: '노드 후보', color: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.16)' },
    edge: { label: '엣지', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.12)' },
    edge_candidate: { label: '엣지 후보', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.12)' },
    door: { label: '문', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.16)' },
    elevator: { label: '엘리베이터', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.16)' },
    stair: { label: '계단', color: '#65a30d', bg: 'rgba(101, 163, 13, 0.16)' },
    escalator: { label: '에스컬레이터', color: '#b45309', bg: 'rgba(180, 83, 9, 0.16)' },
    entrance: { label: '출입구', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.16)' },
    restroom_sign: { label: '화장실', color: '#db2777', bg: 'rgba(219, 39, 119, 0.16)' },
    unknown: { label: 'AI 결과', color: '#475569', bg: 'rgba(71, 85, 105, 0.12)' },
}

const LAYER_META = {
    floorplan: { label: '도면', color: '#475569', bg: 'rgba(71, 85, 105, 0.12)' },
    rooms: { label: '공간', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.10)' },
    corridors: { label: '통행', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.10)' },
    floorplanObjects: { label: '벽/문', color: '#111827', bg: 'rgba(17, 24, 39, 0.04)' },
    edges: { label: '엣지', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
    nodes: { label: '노드', color: '#0f766e', bg: 'rgba(15, 118, 110, 0.14)' },
    pois: { label: 'POI', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
}

function getAiTypeMeta(type) {
    return AI_TYPE_META[type] || AI_TYPE_META.unknown
}

function normalizeLabelScale(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return 1
    return Math.max(0.8, Math.min(1.8, Number(numeric.toFixed(2))))
}

export default function MapEditorPage() {
    const { buildingId, floorId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editorData, setEditorData] = useState(null)
    const [imageDimensions, setImageDimensions] = useState(null)
    const [zoom, setZoom] = useState(1)
    const [poiLabelScale, setPoiLabelScale] = useState(1.15)
    const [toolMode, setToolMode] = useState('select')
    const [activeEditorTab, setActiveEditorTab] = useState('poi')
    const [originalSelectedEntity, setSelectedEntity] = useState(null)
    const [selectedZoneVertexIndex, setSelectedZoneVertexIndex] = useState(null)
    const [entitySearch, setEntitySearch] = useState('')
    const [zoneKindFilter, setZoneKindFilter] = useState('all')
    const [isEntityListCollapsed, setIsEntityListCollapsed] = useState(false)
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false)
    const [isAddingPoi, setIsAddingPoi] = useState(false)
    const [isAddingZone, setIsAddingZone] = useState(false)
    const [draftZoneVertices, setDraftZoneVertices] = useState([])
    const [zoneDraftError, setZoneDraftError] = useState('')
    const [createdPois, setCreatedPois] = useState([])
    const [createdZones, setCreatedZones] = useState([])
    const [createdNodes, setCreatedNodes] = useState([])
    const [createdEdges, setCreatedEdges] = useState([])
    const [activeDraftCacheKey, setActiveDraftCacheKey] = useState(null)
    const [isAddingNode, setIsAddingNode] = useState(false)
    const [isAddingEdge, setIsAddingEdge] = useState(false)
    const [edgeStartNodeId, setEdgeStartNodeId] = useState(null)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [isPreviewMode] = useState(false)
    const selectedEntity = isPreviewMode ? null : originalSelectedEntity
    const [deletedEntityIds, setDeletedEntityIds] = useState({
        node: [],
        edge: [],
        poi: [],
        zone: [],
    })
    const [localEdits, setLocalEdits] = useState({
        node: {},
        edge: {},
        poi: {},
        zone: {},
    })
    const mapViewportRef = useRef(null)
    const imageCanvasRef = useRef(null)
    const selectedListItemRef = useRef(null)
    const [visibleLayers, setVisibleLayers] = useState({
        floorplan: false,
        rooms: true,
        corridors: true,
        floorplanObjects: true,
        edges: true,
        nodes: true,
        pois: true,
    })

    const tenantId = location.state?.building?.tenantId || searchParams.get('tenantId')
    const pageTitle = editorData?.buildingName || location.state?.building?.name || '맵 에디터'
    const floorTitle = editorData?.floorName || location.state?.floor?.name || '층'
    const floorOptions = useMemo(() => {
        const floors = location.state?.building?.floors || []

        return [...floors]
            .map((floor) => ({
                id: floor.floorId || floor.id,
                level: floor.level,
                name: floor.name || (floor.level < 0 ? `B${Math.abs(floor.level)}층` : `${floor.level}층`),
            }))
            .filter((floor) => Boolean(floor.id))
            .sort((a, b) => a.level - b.level)
    }, [location.state])
    const {
        campusGates,
        entranceMappings,
        isMappingLoading,
        verticalConnectors,
        isVerticalLoading,
        activeConnectorForMapping,
        pendingGatePick,
        initializeConnectionData,
        refreshEntranceMappings,
        setActiveConnectorForMapping,
        handleMapCampusGate,
        startGatePick,
        handleCreateVerticalConnector,
        handleDeleteVerticalConnector,
        handleUpdateVerticalConnector,
        startVerticalNodePick,
        handleMapVerticalNode,
        handleUnmapVerticalNode,
        handleViewVerticalNode,
        cancelPendingGatePick,
    } = useConnectionMappings({
        tenantId,
        buildingId,
        floorId,
        floorOptions,
        activeEditorTab,
        setLocalEdits,
        setActiveEditorTab,
        setToolMode,
        handleFloorChange,
        setSelectedEntity,
    })

    useEffect(() => {
        if (!buildingId || !floorId || !tenantId) {
            setError('맵 에디터를 불러오려면 buildingId, floorId, tenantId가 모두 필요합니다.')
            setActiveDraftCacheKey(null)
            setLoading(false)
            return
        }

        let cancelled = false
        const currentDraftCacheKey = getFloorDraftCacheKey(buildingId, floorId)

        async function loadEditor() {
            setLoading(true)
            setError('')
            setActiveDraftCacheKey(null)

            try {
                const result = await getMapEditorFloorApi(tenantId, buildingId, floorId)
                if (cancelled) return

                let cachedFloorDraft = null
                try {
                    const raw = window.sessionStorage.getItem(currentDraftCacheKey)
                    const parsed = raw ? JSON.parse(raw) : null
                    cachedFloorDraft = parsed?.cacheKey === currentDraftCacheKey ? parsed : null
                } catch {
                    cachedFloorDraft = null
                }

                setEditorData(result)
                setImageDimensions({
                    width: result.floorplanWidthPx || 1600,
                    height: result.floorplanHeightPx || 900,
                })
                setSelectedEntity(cachedFloorDraft?.selectedEntity || null)
                setLocalEdits(cachedFloorDraft?.localEdits || {
                    node: {},
                    edge: {},
                    poi: {},
                    zone: {},
                })
                setDeletedEntityIds(cachedFloorDraft?.deletedEntityIds || {
                    node: [],
                    edge: [],
                    poi: [],
                    zone: [],
                })
                setCreatedPois(cachedFloorDraft?.createdPois || [])
                setCreatedZones(cachedFloorDraft?.createdZones || [])
                setCreatedNodes(cachedFloorDraft?.createdNodes || [])
                setCreatedEdges(cachedFloorDraft?.createdEdges || [])
                setActiveDraftCacheKey(currentDraftCacheKey)
                setIsAddingPoi(false)
                setIsAddingZone(false)
                setIsAddingNode(false)
                setIsAddingEdge(false)
                setEdgeStartNodeId(null)
                setSelectedZoneVertexIndex(null)
                setDraftZoneVertices([])
                setZoneDraftError('')

                const campusId = location.state?.building?.campusId || result.campusId
                if (!cancelled) {
                    await initializeConnectionData(campusId)
                }
            } catch (err) {
                if (cancelled) return
                setError(err.message || '맵 에디터 초기 데이터를 불러오지 못했습니다.')
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadEditor()

        return () => {
            cancelled = true
        }
    }, [buildingId, floorId, tenantId, initializeConnectionData, location.state?.building?.campusId])

    useEffect(() => {
        setSelectedEntity(null)
    }, [activeEditorTab])

    useEffect(() => {
        setEntitySearch('')
    }, [activeEditorTab])

    useEffect(() => {
        const currentDraftCacheKey = buildingId && floorId
            ? getFloorDraftCacheKey(buildingId, floorId)
            : null

        if (!currentDraftCacheKey || loading || !editorData || activeDraftCacheKey !== currentDraftCacheKey) return

        try {
            window.sessionStorage.setItem(
                currentDraftCacheKey,
                JSON.stringify({
                    cacheKey: currentDraftCacheKey,
                    localEdits,
                    deletedEntityIds,
                    createdPois,
                    createdZones,
                    createdNodes,
                    createdEdges,
                    selectedEntity,
                }),
            )
        } catch {
            // sessionStorage 저장 실패 시에도 에디터 사용은 계속 가능합니다.
        }
    }, [
        buildingId,
        floorId,
        loading,
        editorData,
        activeDraftCacheKey,
        localEdits,
        deletedEntityIds,
        createdPois,
        createdZones,
        createdNodes,
        createdEdges,
        selectedEntity,
    ])

    useEffect(() => {
        setIsAddingPoi(false)
        setIsAddingZone(false)
        setIsAddingNode(false)
        setIsAddingEdge(false)
        setEdgeStartNodeId(null)
        setDraftZoneVertices([])
        setZoneDraftError('')
        setActiveConnectorForMapping(null)
    }, [activeEditorTab])

    useEffect(() => {
        try {
            const rawEntity = window.sessionStorage.getItem('pending_selected_entity')
            if (rawEntity) {
                const parsedEntity = JSON.parse(rawEntity)
                if (parsedEntity) {
                    setSelectedEntity(parsedEntity)
                    window.sessionStorage.removeItem('pending_selected_entity')
                }
            }
        } catch (e) {
            console.error(e)
        }
    }, [floorId])

    const {
        editedData,
        counts,
        entranceNodes,
        buildingEntranceRecords,
        floorNameById,
        entranceMappingByGateId,
        entranceMappingByNodeId,
        mappedGateCount,
        buildingEntranceNodeCount,
        verticalConnectionNodes,
        editorTabMeta,
        activeEditorItems,
        filteredActiveEditorItems,
        selectedEditorItem,
        displayDimensions,
        zoneShapes,
        objectShapes,
        edgeShapes,
        nodeShapes,
        poiShapes,
        zoneSnapPoints,
        selectedRawEntity,
        poiNodeOptions,
    } = useMapEditorDerivedData({
        editorData,
        localEdits,
        deletedEntityIds,
        createdPois,
        createdZones,
        createdNodes,
        createdEdges,
        entranceMappings,
        floorOptions,
        campusGates,
        activeEditorTab,
        entitySearch,
        selectedEntity,
        zoneKindFilter,
        imageDimensions,
        visibleLayers,
        normalizeLabelScale,
    })

    const publishEntranceReady = useMemo(
        () => campusGates.length === 0 || mappedGateCount === campusGates.length,
        [campusGates.length, mappedGateCount]
    )

    useEffect(() => {
        if (selectedEntity?.type !== 'zone') {
            setSelectedZoneVertexIndex(null)
        }
    }, [selectedEntity])

    useEffect(() => {
        if (activeEditorTab === 'connection') {
            return
        }

        if (!activeEditorItems.length) {
            setSelectedEntity(null)
            return
        }

        if (!selectedEntity || selectedEntity.type !== activeEditorTab || !activeEditorItems.some((item) => item.id === selectedEntity.id)) {
            setSelectedEntity({ type: activeEditorTab, id: activeEditorItems[0].id })
        }
    }, [activeEditorItems, activeEditorTab, selectedEntity])

    const hasPendingEdits = useMemo(() => (
        Object.values(localEdits).some((group) => Object.keys(group).length > 0)
        || createdPois.length > 0
        || createdZones.length > 0
        || createdNodes.length > 0
        || createdEdges.length > 0
        || Object.values(deletedEntityIds).some((ids) => ids.length > 0)
    ), [createdEdges.length, createdNodes.length, createdPois.length, createdZones.length, deletedEntityIds, localEdits])

    const {
        isPublishing,
        openPublishReview,
        modalProps: publishReviewModalProps,
    } = usePublishReview({
        tenantId,
        buildingId,
        editorData,
        hasPendingEdits,
        publishEntranceReady,
        refreshEntranceMappings,
        mappedGateCount,
        campusGateCount: campusGates.length,
        onMoveToConnectionTab: () => setActiveEditorTab('connection'),
        onSaveDraft: saveCurrentFloorDraft,
    })

    const toggleLayer = (key) => {
        setVisibleLayers((current) => ({
            ...current,
            [key]: !current[key],
        }))
    }

    const updatePoiLabelScale = (delta) => {
        setPoiLabelScale((current) => Math.max(0.5, Math.min(1.5, Number((current + delta).toFixed(2)))))
    }

    const updateSelectedEntityPatch = (type, id, patch) => {
        setLocalEdits((current) => ({
            ...current,
            [type]: {
                ...current[type],
                [id]: {
                    ...(current[type]?.[id] || {}),
                    ...patch,
                },
            },
        }))
    }

    const updateMultipleEntitiesPatch = (patches) => {
        setLocalEdits((current) => {
            const next = { ...current }
            patches.forEach(({ type, id, patch }) => {
                next[type] = {
                    ...(next[type] || {}),
                    [id]: {
                        ...(next[type]?.[id] || {}),
                        ...patch,
                    },
                }
            })
            return next
        })
    }

    const updateSelectedEntityField = (field, value) => {
        if (!selectedEntity) return

        updateSelectedEntityPatch(selectedEntity.type, selectedEntity.id, {
            [field]: value,
        })
    }

    const updateSelectedPoiCategory = (categoryCode) => {
        if (!selectedEntity || selectedEntity.type !== 'poi') return

        const normalizedCode = normalizePoiCategoryCode(categoryCode)

        updateSelectedEntityPatch('poi', selectedEntity.id, {
            code: normalizedCode || null,
            attrs: {
                ...(selectedRawEntity?.attrs || {}),
                label: normalizedCode || null,
            },
        })
    }

    const updateSelectedPoiAttrsPatch = (attrsPatch) => {
        if (!selectedEntity || selectedEntity.type !== 'poi') return

        updateSelectedEntityPatch('poi', selectedEntity.id, {
            attrs: {
                ...(selectedRawEntity?.attrs || {}),
                ...attrsPatch,
            },
        })
    }

    const updateNodePosition = (nodeId, point, connectedEdges = null, nodeOriginalPosition = null) => {
        const patches = [
            {
                type: 'node',
                id: nodeId,
                patch: {
                    geomPx: {
                        type: 'Point',
                        coordinates: [point.x, point.y],
                    },
                },
            },
        ]

        const edgesToUpdate = connectedEdges
            || editedData.edges.flatMap((edge) => ([
                edge.fromNodeId === nodeId ? { edge, role: 'from' } : null,
                edge.toNodeId === nodeId ? { edge, role: 'to' } : null,
            ].filter(Boolean)))

        edgesToUpdate.forEach(({ edge, role, originalGeomPx }) => {
            let fromCoords = null
            if (edge.fromNodeId === nodeId) {
                fromCoords = [point.x, point.y]
            } else {
                const fromNode = editedData.nodes.find((n) => n.id === edge.fromNodeId)
                if (fromNode && fromNode.geomPx?.coordinates) {
                    fromCoords = fromNode.geomPx.coordinates
                }
            }

            let toCoords = null
            if (edge.toNodeId === nodeId) {
                toCoords = [point.x, point.y]
            } else {
                const toNode = editedData.nodes.find((n) => n.id === edge.toNodeId)
                if (toNode && toNode.geomPx?.coordinates) {
                    toCoords = toNode.geomPx.coordinates
                }
            }

            if (fromCoords && toCoords) {
                patches.push({
                    type: 'edge',
                    id: edge.id,
                    patch: {
                        geomPx: {
                            type: 'LineString',
                            coordinates: [fromCoords, toCoords],
                        },
                    },
                })
            } else {
                const baseGeometry = originalGeomPx || edge.geomPx
                patches.push({
                    type: 'edge',
                    id: edge.id,
                    patch: {
                        geomPx: updateLineEndpointGeometry(baseGeometry, role, point, nodeOriginalPosition),
                    },
                })
            }
        })

        updateMultipleEntitiesPatch(patches)
    }

    const updateZoneVertices = (zoneId, updater) => {
        const zone = editedData.zones.find((item) => item.id === zoneId)
        if (!zone) return

        const vertices = getPolygonVertices(zone.geomPx)
        const nextVertices = updater(vertices)
        const nextGeometry = buildPolygonGeometry(nextVertices)
        if (!nextGeometry || !isSimplePolygon(nextVertices)) return

        updateSelectedEntityPatch('zone', zoneId, {
            geomPx: nextGeometry,
        })
    }

    const {
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
    } = useCanvasInteractions({
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
        editedNodes: editedData.nodes,
        editedEdges: editedData.edges,
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
    })

    const resetSelectedEntityEdits = () => {
        if (!selectedEntity) return

        setLocalEdits((current) => {
            const nextState = { ...current }
            const nextGroup = { ...(current[selectedEntity.type] || {}) }
            delete nextGroup[selectedEntity.id]
            nextState[selectedEntity.type] = nextGroup

            if (selectedEntity.type === 'node') {
                const connectedEdgeIds = editedData.edges
                    .filter((edge) => edge.fromNodeId === selectedEntity.id || edge.toNodeId === selectedEntity.id)
                    .map((edge) => edge.id)

                if (connectedEdgeIds.length > 0) {
                    const nextEdgeGroup = { ...(current.edge || {}) }
                    connectedEdgeIds.forEach((edgeId) => {
                        delete nextEdgeGroup[edgeId]
                    })
                    nextState.edge = nextEdgeGroup
                }
            }

            return nextState
        })
    }

    function deleteSelectedEntity() {
        if (!selectedEntity) return

        const targetId = selectedEntity.id
        const type = selectedEntity.type

        if (type === 'poi') {
            const isCreatedPoi = createdPois.some((poi) => poi.id === targetId)
            setCreatedPois((current) => current.filter((poi) => poi.id !== targetId))
            if (!isCreatedPoi) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    poi: current.poi.includes(targetId) ? current.poi : [...current.poi, targetId],
                }))
            }
        } else if (type === 'zone') {
            const isCreatedZone = createdZones.some((zone) => zone.id === targetId)
            setCreatedZones((current) => current.filter((zone) => zone.id !== targetId))
            if (!isCreatedZone) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    zone: current.zone.includes(targetId) ? current.zone : [...current.zone, targetId],
                }))
            }
        } else if (type === 'node') {
            const isCreatedNode = createdNodes.some((node) => node.id === targetId)
            setCreatedNodes((current) => current.filter((node) => node.id !== targetId))
            if (!isCreatedNode) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    node: current.node.includes(targetId) ? current.node : [...current.node, targetId],
                }))
            }

            // 노드가 삭제되면 연결된 엣지들도 함께 삭제
            const connectedEdges = editedData.edges.filter(
                (edge) => edge.fromNodeId === targetId || edge.toNodeId === targetId
            )
            connectedEdges.forEach((edge) => {
                const isCreatedEdge = createdEdges.some((ce) => ce.id === edge.id)
                setCreatedEdges((current) => current.filter((ce) => ce.id !== edge.id))
                if (!isCreatedEdge) {
                    setDeletedEntityIds((current) => ({
                        ...current,
                        edge: current.edge.includes(edge.id) ? current.edge : [...current.edge, edge.id],
                    }))
                }
            })
        } else if (type === 'edge') {
            const isCreatedEdge = createdEdges.some((edge) => edge.id === targetId)
            setCreatedEdges((current) => current.filter((edge) => edge.id !== targetId))
            if (!isCreatedEdge) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    edge: current.edge.includes(targetId) ? current.edge : [...current.edge, targetId],
                }))
            }
        }

        setLocalEdits((current) => {
            const nextGroup = { ...(current[type] || {}) }
            delete nextGroup[targetId]

            return {
                ...current,
                [type]: nextGroup,
            }
        })
        setSelectedEntity(null)
        setSelectedZoneVertexIndex(null)
    }

    function deleteSelectedZoneVertex() {
        if (!selectedEntity || selectedEntity.type !== 'zone' || selectedZoneVertexIndex == null) return

        updateZoneVertices(selectedEntity.id, (vertices) => {
            if (vertices.length <= 3) return vertices
            return vertices.filter((_, index) => index !== selectedZoneVertexIndex)
        })
        setSelectedZoneVertexIndex(null)
    }

    function buildDraftSavePayload() {
        return {
            nodes: editedData.nodes.map((node) => ({
                id: node.id,
                kind: node.kind || 'corridor',
                name: node.name || '',
                geomPx: node.geomPx,
                properties: node.properties || {},
            })),
            edges: editedData.edges.map((edge) => ({
                id: edge.id,
                fromNodeId: edge.fromNodeId,
                toNodeId: edge.toNodeId,
                kind: edge.kind || 'walkway',
                geomPx: edge.geomPx,
                isDirected: Boolean(edge.isDirected),
                baseWeight: edge.baseWeight == null || edge.baseWeight === '' ? 1 : Number(edge.baseWeight),
                properties: edge.properties || {},
            })),
            pois: editedData.pois.map((poi) => ({
                id: poi.id,
                name: poi.name || '',
                code: poi.code || poi.attrs?.label || null,
                geomPx: poi.geomPx,
                footprintPx: poi.footprintPx || null,
                anchorNodeId: poi.anchorNodeId || null,
                attrs: poi.attrs || {},
                externalApiId: poi.externalApiId || null,
            })),
            zones: editedData.zones.map((zone) => ({
                id: zone.id,
                kind: zone.kind || 'room',
                name: zone.name || '',
                geomPx: zone.geomPx,
                properties: zone.properties || {},
            })),
        }
    }

    async function saveCurrentFloorDraft({ silent = false } = {}) {
        if (!tenantId || !buildingId || !floorId || isSavingDraft) return

        try {
            setIsSavingDraft(true)
            const result = await saveMapEditorFloorDraftApi(tenantId, buildingId, floorId, buildDraftSavePayload())

            setEditorData(result)
            setImageDimensions({
                width: result.floorplanWidthPx || 1600,
                height: result.floorplanHeightPx || 900,
            })
            setSelectedEntity(null)
            setSelectedZoneVertexIndex(null)
            setLocalEdits({
                node: {},
                edge: {},
                poi: {},
                zone: {},
            })
            setDeletedEntityIds({
                node: [],
                edge: [],
                poi: [],
                zone: [],
            })
            setCreatedPois([])
            setCreatedZones([])
            setCreatedNodes([])
            setCreatedEdges([])
            setIsAddingPoi(false)
            setIsAddingZone(false)
            setIsAddingNode(false)
            setIsAddingEdge(false)
            setEdgeStartNodeId(null)
            setDraftZoneVertices([])
            setZoneDraftError('')
            try {
                window.sessionStorage.removeItem(getFloorDraftCacheKey(buildingId, floorId))
            } catch {
                // 저장 후 캐시 삭제 실패는 무시합니다.
            }
            await refreshEntranceMappings({ silent: true })
            if (!silent) {
                window.alert('임시저장이 완료되었습니다.')
            }
            return true
        } catch (err) {
            if (!silent) {
                window.alert(err.message || '임시저장 중 오류가 발생했습니다.')
            }
            return false
        } finally {
            setIsSavingDraft(false)
        }
    }

    async function handleSaveDraft() {
        await saveCurrentFloorDraft()
    }

    async function handleFloorChange(targetFloor) {
        if (!targetFloor?.id) return
        if (targetFloor.id === floorId) return
        if (isSavingDraft) return

        if (hasPendingEdits) {
            const saved = await saveCurrentFloorDraft({ silent: true })
            if (!saved) {
                window.alert('층 이동 전에 현재 층 임시저장에 실패했습니다. 다시 시도해 주세요.')
                return
            }
        }

        navigate(`/building/${buildingId}/floors/${targetFloor.id}/editor?tenantId=${tenantId}`, {
            state: {
                building: location.state?.building || null,
                floor: targetFloor,
            },
        })
    }

    const handlePublish = async () => {
        await openPublishReview()
    }

    return (
        <PageWrapper>
            <Container>
                <HeaderCard>
                    <BackButton onClick={() => navigate(`/building/${buildingId}?tenantId=${tenantId}`, { state: { building: location.state?.building || null } })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        도면 관리로 돌아가기
                    </BackButton>
                    <TitleRow>
                        <TitleGroup>
                            <h1>{pageTitle} 맵 에디터</h1>
                            <HeaderUtilityRow>
                                {floorOptions.length > 1 && (
                                    <FloorSwitcher>
                                        {floorOptions.map((floor) => (
                                            <FloorChip
                                                key={floor.id}
                                                type="button"
                                                $active={floor.id === floorId}
                                                onClick={() => handleFloorChange(floor)}
                                            >
                                                {floor.name}
                                            </FloorChip>
                                        ))}
                                    </FloorSwitcher>
                                )}
                                <QuickLayerPanel>
                                    <LayerScaleGroup>
                                        <LayerScaleLabel>글씨 크기</LayerScaleLabel>
                                        <ScaleButtonGroup>
                                            <Button
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() => updatePoiLabelScale(-0.05)}
                                                disabled={poiLabelScale <= 0.5}
                                            >
                                                -
                                            </Button>
                                            <ScaleValueButton variant="ghost" size="sm" onClick={() => setPoiLabelScale(1.15)}>
                                                {Math.round(poiLabelScale * 100)}%
                                            </ScaleValueButton>
                                            <Button
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() => updatePoiLabelScale(0.05)}
                                                disabled={poiLabelScale >= 1.5}
                                            >
                                                +
                                            </Button>
                                        </ScaleButtonGroup>
                                    </LayerScaleGroup>
                                    <LayerToggleGroup>
                                        {Object.entries(LAYER_META).map(([key, meta]) => (
                                            <ToggleChip key={key} type="button" $active={visibleLayers[key]} onClick={() => toggleLayer(key)}>
                                                {meta.label}
                                            </ToggleChip>
                                        ))}
                                        <Button variant="outlineGray" size="sm" onClick={() => window.location.reload()}>
                                            새로고침
                                        </Button>
                                    </LayerToggleGroup>
                                </QuickLayerPanel>
                            </HeaderUtilityRow>
                        </TitleGroup>
                        <StatusRow>
                            <StatusBadge $tone={editorData?.mapVersionStatus === 'published' ? 'published' : 'draft'}>
                                {editorData?.mapVersionStatus === 'published' ? 'published 버전' : 'draft 버전'}
                            </StatusBadge>
                            {editorData?.draftCreated && <StatusBadge $tone="draft">새 draft 생성</StatusBadge>}
                            {editorData?.initializedFromAi && <StatusBadge $tone="success">AI 결과로 초기화</StatusBadge>}
                        </StatusRow>
                    </TitleRow>
                </HeaderCard>

                {loading ? (
                    <LoadingCard>맵 에디터 초기 데이터를 불러오는 중입니다.</LoadingCard>
                ) : error ? (
                    <ErrorCard>{error}</ErrorCard>
                ) : (
                    <WorkspaceLayout $collapsed={isEditorCollapsed}>
                        <CanvasCard>
                            <MapCanvasPanel
                                activeConnectorForMapping={activeConnectorForMapping}
                                floorNameById={floorNameById}
                                onCancelConnectorMapping={() => setActiveConnectorForMapping(null)}
                                toolMode={toolMode}
                                onChangeToolMode={setToolMode}
                                isPreviewMode={isPreviewMode}
                                isEditorCollapsed={isEditorCollapsed}
                                onToggleEditorCollapsed={() => setIsEditorCollapsed((current) => !current)}
                                zoom={zoom}
                                setZoom={setZoom}
                                editorData={editorData}
                                displayDimensions={displayDimensions}
                                mapViewportRef={mapViewportRef}
                                imageCanvasRef={imageCanvasRef}
                                handleViewportPointerDownCapture={handleViewportPointerDownCapture}
                                handleViewportWheel={handleViewportWheel}
                                handleViewportPointerDown={handleViewportPointerDown}
                                handleViewportPointerMove={handleViewportPointerMove}
                                handleViewportPointerUp={handleViewportPointerUp}
                                viewportCursor={viewportCursor}
                                visibleLayers={visibleLayers}
                                floorTitle={floorTitle}
                                onImageLoadDimensions={setImageDimensions}
                                zoneShapes={zoneShapes}
                                selectedEntity={selectedEntity}
                                handleEntitySelect={handleEntitySelect}
                                setActiveEditorTab={setActiveEditorTab}
                                setSelectedEntity={setSelectedEntity}
                                selectedZoneVertexIndex={selectedZoneVertexIndex}
                                setSelectedZoneVertexIndex={setSelectedZoneVertexIndex}
                                insertZoneVertex={insertZoneVertex}
                                startZoneVertexDrag={startZoneVertexDrag}
                                isAddingZone={isAddingZone}
                                draftZoneVertices={draftZoneVertices}
                                objectShapes={objectShapes}
                                edgeShapes={edgeShapes}
                                editedEdges={editedData.edges}
                                poiShapes={poiShapes}
                                poiLabelScale={poiLabelScale}
                                startPoiDrag={startPoiDrag}
                                nodeShapes={nodeShapes}
                                selectedRawEntity={selectedRawEntity}
                                entranceMappingByNodeId={entranceMappingByNodeId}
                                pendingGatePick={pendingGatePick}
                                layerMeta={LAYER_META}
                                startNodeDrag={startNodeDrag}
                            />
                        </CanvasCard>

                        {!isEditorCollapsed && (
                            <EditorCard>
                                <EditorHeader>
                                <EditorTopBar>
                                    <h2>편집 패널</h2>
                                        <DetailActions>
                                            {hasPendingEdits && <UnsavedBadge>로컬 편집 중</UnsavedBadge>}
                                            <Button
                                                size="sm"
                                                onClick={handleSaveDraft}
                                                disabled={isSavingDraft || !hasPendingEdits}
                                            >
                                                {isSavingDraft ? '임시저장 중...' : '임시저장'}
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handlePublish}
                                                disabled={isPublishing}
                                            >
                                                {isPublishing ? '배포 중...' : '최종 배포'}
                                            </Button>
                                        </DetailActions>
                                    </EditorTopBar>
                                </EditorHeader>

                                <EditorTabs>
                                    {editorTabMeta.map((tab) => (
                                        <EditorTabButton
                                            key={tab.key}
                                            type="button"
                                            $active={activeEditorTab === tab.key}
                                            onClick={() => setActiveEditorTab(tab.key)}
                                        >
                                            <strong>{tab.label}</strong>
                                            <span>{tab.count}개</span>
                                        </EditorTabButton>
                                    ))}
                                </EditorTabs>

                                <EditorBody>
                                    {activeEditorTab === 'connection' ? (
                                        <ConnectionPanel
                                            mappedGateCount={mappedGateCount}
                                            campusGates={campusGates}
                                            buildingEntranceNodeCount={buildingEntranceNodeCount}
                                            verticalConnectionNodes={verticalConnectionNodes}
                                            pendingGatePick={pendingGatePick}
                                            onCancelPendingGatePick={() => setPendingGatePick(null)}
                                            entranceMappingByGateId={entranceMappingByGateId}
                                            floorNameById={floorNameById}
                                            onStartGatePick={startGatePick}
                                            isMappingLoading={isMappingLoading}
                                            onFocusMappedNode={(nodeId) => setSelectedEntity({ type: 'node', id: nodeId })}
                                            entranceNodes={entranceNodes}
                                            entranceMappingByNodeId={entranceMappingByNodeId}
                                            selectedEntity={selectedEntity}
                                            onSelectNode={(nodeId) => handleEntitySelect('node', nodeId)}
                                            onOpenNodeTab={() => setActiveEditorTab('node')}
                                            verticalConnectors={verticalConnectors}
                                            onCreateVerticalConnector={handleCreateVerticalConnector}
                                            onUpdateVerticalConnector={handleUpdateVerticalConnector}
                                            isVerticalLoading={isVerticalLoading}
                                            activeConnectorForMapping={activeConnectorForMapping}
                                            floorOptions={floorOptions}
                                            onDeleteVerticalConnector={handleDeleteVerticalConnector}
                                            onViewVerticalNode={handleViewVerticalNode}
                                            onUnmapVerticalNode={handleUnmapVerticalNode}
                                            onStartVerticalNodePick={startVerticalNodePick}
                                        />
                                    ) : (
                                        <EntityEditorPanel
                                            activeEditorTab={activeEditorTab}
                                            editorTabMeta={editorTabMeta}
                                            selectedEditorItem={selectedEditorItem}
                                            selectedRawEntity={selectedRawEntity}
                                            selectedEntity={selectedEntity}
                                            updateSelectedEntityField={updateSelectedEntityField}
                                            updateSelectedPoiCategory={updateSelectedPoiCategory}
                                            poiCategoryOptions={POI_CATEGORY_OPTIONS}
                                            updateSelectedPoiAttrsPatch={updateSelectedPoiAttrsPatch}
                                            normalizeLabelScale={normalizeLabelScale}
                                            poiNodeOptions={poiNodeOptions}
                                            deleteSelectedEntity={deleteSelectedEntity}
                                            selectedZoneVertexIndex={selectedZoneVertexIndex}
                                            deleteSelectedZoneVertex={deleteSelectedZoneVertex}
                                            getPolygonVertices={getPolygonVertices}
                                            resetSelectedEntityEdits={resetSelectedEntityEdits}
                                            isEntityListCollapsed={isEntityListCollapsed}
                                            onToggleEntityListCollapsed={() => setIsEntityListCollapsed((current) => !current)}
                                            filteredActiveEditorItems={filteredActiveEditorItems}
                                            onToggleAddPoi={() => {
                                                setToolMode('select')
                                                setIsAddingZone(false)
                                                setDraftZoneVertices([])
                                                setZoneDraftError('')
                                                setIsAddingNode(false)
                                                setIsAddingEdge(false)
                                                setEdgeStartNodeId(null)
                                                setIsAddingPoi((current) => !current)
                                            }}
                                            isAddingPoi={isAddingPoi}
                                            onToggleAddZone={() => {
                                                setToolMode('select')
                                                setIsAddingPoi(false)
                                                setIsAddingNode(false)
                                                setIsAddingEdge(false)
                                                setEdgeStartNodeId(null)
                                                setIsAddingZone((current) => {
                                                    const next = !current
                                                    if (!next) {
                                                        setDraftZoneVertices([])
                                                        setZoneDraftError('')
                                                    }
                                                    return next
                                                })
                                            }}
                                            isAddingZone={isAddingZone}
                                            draftZoneVertices={draftZoneVertices}
                                            onUndoDraftZoneVertex={() => setDraftZoneVertices((current) => current.slice(0, -1))}
                                            onCompleteZoneDraft={() => createZoneFromVertices(draftZoneVertices)}
                                            onToggleAddNode={() => {
                                                setToolMode('select')
                                                setIsAddingPoi(false)
                                                setIsAddingZone(false)
                                                setDraftZoneVertices([])
                                                setZoneDraftError('')
                                                setIsAddingEdge(false)
                                                setEdgeStartNodeId(null)
                                                setIsAddingNode((current) => !current)
                                            }}
                                            isAddingNode={isAddingNode}
                                            onToggleAddEdge={() => {
                                                setToolMode('select')
                                                setIsAddingPoi(false)
                                                setIsAddingZone(false)
                                                setDraftZoneVertices([])
                                                setZoneDraftError('')
                                                setIsAddingNode(false)
                                                setIsAddingEdge((current) => {
                                                    const next = !current
                                                    if (!next) {
                                                        setEdgeStartNodeId(null)
                                                    }
                                                    return next
                                                })
                                            }}
                                            isAddingEdge={isAddingEdge}
                                            edgeStartNodeId={edgeStartNodeId}
                                            entitySearch={entitySearch}
                                            onChangeEntitySearch={setEntitySearch}
                                            zoneKindFilter={zoneKindFilter}
                                            onChangeZoneKindFilter={setZoneKindFilter}
                                            zoneDraftError={zoneDraftError}
                                            onSelectEntity={handleEntitySelect}
                                            selectedListItemRef={selectedListItemRef}
                                        />
                                    )}
                                </EditorBody>
                            </EditorCard>
                        )}
                    </WorkspaceLayout>
                )}
            </Container>
            <Suspense fallback={null}>
                <PublishReviewModal {...publishReviewModalProps} />
            </Suspense>
        </PageWrapper>
    )
}
