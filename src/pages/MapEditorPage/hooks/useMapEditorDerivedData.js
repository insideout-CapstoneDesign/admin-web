import { useMemo } from 'react'
import { getPoiCategoryLabel, getPoiDisplayName, normalizePoiCategoryCode } from '../utils/publishReview'
import {
    geometryToShape,
    getPointPosition,
    getPolygonCenter,
    getPolygonMidpoints,
    getPolygonVertices,
} from '../utils/geometry'

export default function useMapEditorDerivedData({
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
}) {
    const editedData = useMemo(() => {
        const applyEntityEdits = (type, items, extraItems = []) =>
            [...(items || []), ...extraItems]
                .filter((item) => !(deletedEntityIds[type] || []).includes(item.id))
                .map((item) => ({
                    ...item,
                    ...(localEdits[type]?.[item.id] || {}),
                }))

        return {
            nodes: applyEntityEdits('node', editorData?.nodes, createdNodes),
            edges: applyEntityEdits('edge', editorData?.edges, createdEdges),
            pois: applyEntityEdits('poi', editorData?.pois, createdPois),
            zones: applyEntityEdits('zone', editorData?.zones, createdZones),
            floorplanObjects: editorData?.floorplanObjects || [],
        }
    }, [createdPois, createdZones, createdNodes, createdEdges, deletedEntityIds, editorData, localEdits])

    const counts = useMemo(() => ({
        zones: editedData.zones.length || 0,
        floorplanObjects: editedData.floorplanObjects.length || 0,
        edges: editedData.edges.length || 0,
        nodes: editedData.nodes.length || 0,
        pois: editedData.pois.length || 0,
    }), [editedData])

    const nodeNameById = useMemo(
        () => new Map((editedData.nodes || []).map((node) => [node.id, node.name || node.kind || '노드'])),
        [editedData]
    )

    const entranceNodes = useMemo(
        () => (editedData.nodes || []).filter((node) => node.kind === 'entrance'),
        [editedData.nodes]
    )

    const buildingEntranceRecords = useMemo(
        () => (entranceMappings || []).filter((record) => record?.nodeId),
        [entranceMappings]
    )

    const floorNameById = useMemo(
        () => new Map((floorOptions || []).map((floor) => [floor.id, floor.name])),
        [floorOptions]
    )

    const entranceMappingByGateId = useMemo(
        () => new Map(
            buildingEntranceRecords
                .filter((mapping) => Boolean(mapping.campusGateId))
                .map((mapping) => [mapping.campusGateId, mapping])
        ),
        [buildingEntranceRecords]
    )

    const entranceMappingByNodeId = useMemo(
        () => new Map(buildingEntranceRecords.map((mapping) => [mapping.nodeId, mapping])),
        [buildingEntranceRecords]
    )

    const mappedGateCount = useMemo(
        () => (campusGates || []).filter((gate) => entranceMappingByGateId.has(gate.id)).length,
        [campusGates, entranceMappingByGateId]
    )

    const buildingEntranceNodeCount = useMemo(
        () => buildingEntranceRecords.length,
        [buildingEntranceRecords]
    )

    const verticalConnectionNodes = useMemo(
        () => (editedData.nodes || []).filter((node) => ['stair', 'elevator', 'escalator'].includes(node.kind)),
        [editedData.nodes]
    )

    const editorTabMeta = useMemo(() => ([
        { key: 'node', label: 'Node', count: counts.nodes, description: '교차점, 출입구, 수직 연결점' },
        { key: 'edge', label: 'Edge', count: counts.edges, description: '보행 연결선과 방향성' },
        { key: 'poi', label: 'POI', count: counts.pois, description: '시설물과 목적지 이름' },
        { key: 'zone', label: 'Zone', count: counts.zones, description: '공간과 통행 구역' },
        { key: 'connection', label: '연결', count: mappedGateCount, description: '출입구 및 층간 연결 설정' },
    ]), [counts, mappedGateCount])

    const editorItems = useMemo(() => ({
        node: editedData.nodes.map((node) => ({
            id: node.id,
            title: node.name || node.kind || '이름 없는 노드',
            badge: node.kind || 'node',
            subtitle: node.source === 'ai' ? 'AI에서 생성된 노드' : '수정된 draft 노드',
            detailRows: [
                ['유형', node.kind || '-'],
                ['이름', node.name || '-'],
                ['원본', node.source || '-'],
                ['AI 연결', node.aiDetectionId || '-'],
            ],
        })),
        edge: editedData.edges.map((edge) => ({
            id: edge.id,
            title: edge.kind || '연결선',
            badge: edge.isDirected ? 'one-way' : 'two-way',
            subtitle: `${nodeNameById.get(edge.fromNodeId) || edge.fromNodeId} -> ${nodeNameById.get(edge.toNodeId) || edge.toNodeId}`,
            detailRows: [
                ['유형', edge.kind || '-'],
                ['방향', edge.isDirected ? '단방향' : '양방향'],
                ['시작', nodeNameById.get(edge.fromNodeId) || edge.fromNodeId],
                ['도착', nodeNameById.get(edge.toNodeId) || edge.toNodeId],
                ['가중치', edge.baseWeight ?? '-'],
            ],
        })),
        poi: editedData.pois.map((poi) => ({
            id: poi.id,
            title: getPoiDisplayName(poi),
            badge: getPoiCategoryLabel(poi.code || poi.attrs?.label),
            subtitle: poi.source === 'ai' ? 'AI에서 가져온 POI' : '저장된 draft POI',
            detailRows: [
                ['이름', getPoiDisplayName(poi)],
                ['라벨', normalizePoiCategoryCode(poi.attrs?.label) || '-'],
                ['코드', normalizePoiCategoryCode(poi.code || poi.attrs?.label) || '-'],
                ['연결 노드', nodeNameById.get(poi.anchorNodeId) || poi.anchorNodeId || '-'],
                ['외부 ID', poi.externalApiId || '-'],
            ],
        })),
        zone: editedData.zones.map((zone) => ({
            id: zone.id,
            title: zone.name || '이름 없는 공간',
            badge: zone.kind || 'zone',
            subtitle: zone.kind === 'corridor' ? '통행 경로 영역' : zone.kind === 'room' ? '개별 공간 영역' : '제한/기타 영역',
            detailRows: [
                ['이름', zone.name || '-'],
                ['유형', zone.kind || '-'],
                ['속성', zone.properties ? JSON.stringify(zone.properties) : '-'],
            ],
        })),
    }), [editedData, nodeNameById])

    const activeEditorItems = editorItems[activeEditorTab] || []

    const filteredActiveEditorItems = useMemo(() => {
        if (!['poi', 'zone'].includes(activeEditorTab)) {
            return activeEditorItems
        }

        const keyword = entitySearch.trim().toLowerCase()
        const filtered = activeEditorItems.filter((item) => {
            const haystack = `${item.title} ${item.badge} ${item.subtitle}`.toLowerCase()
            const matchesKeyword = !keyword || haystack.includes(keyword)
            const matchesZoneKind = activeEditorTab !== 'zone' || zoneKindFilter === 'all' || item.badge === zoneKindFilter
            return matchesKeyword && matchesZoneKind
        })

        const selectedItem = activeEditorItems.find((item) => item.id === selectedEntity?.id)
        if (activeEditorTab === 'poi' && selectedEntity?.type === 'poi' && selectedItem && !filtered.some((item) => item.id === selectedItem.id)) {
            return [selectedItem, ...filtered]
        }

        return filtered
    }, [activeEditorItems, activeEditorTab, entitySearch, selectedEntity, zoneKindFilter])

    const selectedEditorItem = activeEditorItems.find((item) => item.id === selectedEntity?.id) || activeEditorItems[0] || null

    const displayDimensions = useMemo(() => {
        if (!imageDimensions) return null
        const viewportScale = Math.min(1, 1120 / imageDimensions.width)
        return {
            width: imageDimensions.width * viewportScale,
            height: imageDimensions.height * viewportScale,
            viewBoxWidth: imageDimensions.width,
            viewBoxHeight: imageDimensions.height,
        }
    }, [imageDimensions])

    const zoneShapes = useMemo(() => {
        if (!visibleLayers.rooms && !visibleLayers.corridors) return []

        return editedData.zones
            .map((zone) => {
                if (zone.kind === 'corridor' && !visibleLayers.corridors) {
                    return null
                }

                if (zone.kind !== 'corridor' && !visibleLayers.rooms) {
                    return null
                }

                const shape = geometryToShape(zone.geomPx)
                const vertices = getPolygonVertices(zone.geomPx)
                const midpoints = getPolygonMidpoints(vertices)
                return shape ? { ...shape, id: zone.id, zoneKind: zone.kind, vertices, midpoints } : null
            })
            .filter(Boolean)
    }, [editedData.zones, visibleLayers.corridors, visibleLayers.rooms])

    const objectShapes = useMemo(() => {
        if (!visibleLayers.floorplanObjects) return []

        return editedData.floorplanObjects
            .map((object) => {
                const shape = geometryToShape(object.geomPx)
                return shape ? { ...shape, id: object.id, objectKind: object.kind, geometryKind: shape.kind } : null
            })
            .filter(Boolean)
    }, [editedData.floorplanObjects, visibleLayers.floorplanObjects])

    const edgeShapes = useMemo(() => {
        if (!visibleLayers.edges) return []

        return editedData.edges
            .map((edge) => {
                const shape = geometryToShape(edge.geomPx)
                return shape ? { ...shape, id: edge.id, edgeKind: edge.kind, geometryKind: shape.kind } : null
            })
            .filter(Boolean)
    }, [editedData.edges, visibleLayers.edges])

    const nodeShapes = useMemo(() => {
        if (!visibleLayers.nodes) return []

        return editedData.nodes
            .map((node) => {
                const position = getPointPosition(node.geomPx)
                return position ? { id: node.id, name: node.name, kind: node.kind, ...position } : null
            })
            .filter(Boolean)
    }, [editedData.nodes, visibleLayers.nodes])

    const poiShapes = useMemo(() => {
        if (!visibleLayers.pois) return []

        return editedData.pois
            .map((poi) => {
                const footprint = geometryToShape(poi.footprintPx)
                const point = getPointPosition(poi.geomPx)
                const labelPosition = point || getPolygonCenter(poi.footprintPx)
                const categoryCode = normalizePoiCategoryCode(poi.code || poi.attrs?.label)
                const isFacilityCategory = categoryCode.startsWith('facility.')
                const labelScale = normalizeLabelScale(poi.attrs?.labelScale ?? 1)

                return {
                    id: poi.id,
                    name: poi.name,
                    point,
                    footprint,
                    labelPosition,
                    isFacility: isFacilityCategory,
                    label: categoryCode,
                    displayName: getPoiDisplayName(poi),
                    labelScale,
                    anchorNodeId: poi.anchorNodeId,
                    rawGeomPx: poi.geomPx,
                    rawFootprintPx: poi.footprintPx,
                }
            })
            .filter((poi) => poi.point || poi.footprint)
    }, [editedData.pois, visibleLayers.pois, normalizeLabelScale])

    const zoneSnapPoints = useMemo(() => (
        editedData.zones.flatMap((zone) =>
            getPolygonVertices(zone.geomPx).map((vertex, index) => ({
                x: vertex.x,
                y: vertex.y,
                zoneId: zone.id,
                vertexIndex: index,
            }))
        )
    ), [editedData.zones])

    const selectedRawEntity = useMemo(() => {
        if (!selectedEntity) return null

        if (selectedEntity.type === 'node') {
            return editedData.nodes.find((item) => item.id === selectedEntity.id) || null
        }

        if (selectedEntity.type === 'edge') {
            return editedData.edges.find((item) => item.id === selectedEntity.id) || null
        }

        if (selectedEntity.type === 'poi') {
            return editedData.pois.find((item) => item.id === selectedEntity.id) || null
        }

        if (selectedEntity.type === 'zone') {
            return editedData.zones.find((item) => item.id === selectedEntity.id) || null
        }

        return null
    }, [editedData, selectedEntity])

    const poiNodeOptions = useMemo(() => (
        editedData.nodes.map((node) => ({
            id: node.id,
            label: node.name || node.kind || node.id,
        }))
    ), [editedData.nodes])

    return {
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
    }
}
