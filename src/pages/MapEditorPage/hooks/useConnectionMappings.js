import { useCallback, useEffect, useState } from 'react'
import {
    createVerticalConnectorApi,
    deleteVerticalConnectorApi,
    getBuildingEntrancesApi,
    getVerticalConnectorsApi,
    mapBuildingEntranceApi,
    mapVerticalConnectorNodeApi,
    unmapVerticalConnectorNodeApi,
} from '../../../api/buildingApi'
import { getCampusByIdApi } from '../../../api/campusApi'

export default function useConnectionMappings({
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
}) {
    const [campusGates, setCampusGates] = useState([])
    const [entranceMappings, setEntranceMappings] = useState([])
    const [isMappingLoading, setIsMappingLoading] = useState(false)
    const [verticalConnectors, setVerticalConnectors] = useState([])
    const [isVerticalLoading, setIsVerticalLoading] = useState(false)
    const [activeConnectorForMapping, setActiveConnectorForMapping] = useState(null)
    const [pendingGatePick, setPendingGatePick] = useState(null)

    const refreshEntranceMappings = useCallback(async (options = {}) => {
        const { silent = false } = options
        if (!tenantId || !buildingId) {
            setEntranceMappings([])
            return []
        }

        try {
            const mappings = await getBuildingEntrancesApi(tenantId, buildingId)
            setEntranceMappings(mappings || [])
            return mappings || []
        } catch (err) {
            if (!silent) {
                throw err
            }
            console.error('출입구 매핑 정보를 불러오지 못했습니다:', err)
            return []
        }
    }, [tenantId, buildingId])

    const refreshVerticalConnectors = useCallback(async (options = {}) => {
        const { silent = false } = options
        if (!tenantId || !buildingId) {
            setVerticalConnectors([])
            return []
        }

        try {
            const connectors = await getVerticalConnectorsApi(tenantId, buildingId)
            setVerticalConnectors(connectors || [])
            return connectors || []
        } catch (err) {
            if (!silent) {
                throw err
            }
            console.error('수직 이동수단 목록을 불러오지 못했습니다:', err)
            return []
        }
    }, [tenantId, buildingId])

    const initializeConnectionData = useCallback(async (campusId) => {
        if (!tenantId || !buildingId) {
            setCampusGates([])
            setEntranceMappings([])
            setVerticalConnectors([])
            return
        }

        if (campusId) {
            try {
                const campusData = await getCampusByIdApi(tenantId, campusId)
                setCampusGates(campusData.gates || [])
            } catch (err) {
                console.error('캠퍼스 게이트 목록을 불러오지 못했습니다:', err)
                setCampusGates([])
            }
        } else {
            setCampusGates([])
        }

        await Promise.all([
            refreshEntranceMappings({ silent: true }),
            refreshVerticalConnectors({ silent: true }),
        ])
    }, [tenantId, buildingId, refreshEntranceMappings, refreshVerticalConnectors])

    const handleMapCampusGate = useCallback(async (nodeId, campusGateId) => {
        if (!tenantId || !buildingId) return

        try {
            setIsMappingLoading(true)
            if (!campusGateId || !nodeId) {
                return
            }

            const response = await mapBuildingEntranceApi(tenantId, buildingId, {
                entranceNodeId: nodeId,
                campusGateId,
            })

            await refreshEntranceMappings({ silent: true })

            setLocalEdits((current) => ({
                ...current,
                node: {
                    ...current.node,
                    [nodeId]: {
                        ...(current.node?.[nodeId] || {}),
                        kind: 'entrance',
                    },
                },
            }))
            setPendingGatePick((current) => (current?.gateId === campusGateId ? null : current))

            window.alert(`성공적으로 게이트와 매핑(캘리브레이션)되었습니다: ${response.campusGateName}`)
        } catch (err) {
            window.alert(err.message || '매핑 저장 중 오류가 발생했습니다.')
        } finally {
            setIsMappingLoading(false)
        }
    }, [tenantId, buildingId, refreshEntranceMappings, setLocalEdits])

    const startGatePick = useCallback((gate) => {
        if (!gate?.id) return
        setActiveEditorTab('connection')
        setToolMode('select')
        setPendingGatePick({
            gateId: gate.id,
            gateName: gate.name,
        })
    }, [setActiveEditorTab, setToolMode])

    const handleCreateVerticalConnector = useCallback(async () => {
        if (!tenantId || !buildingId) return

        const name = window.prompt('수직 이동수단 이름을 입력하세요 (예: 엘리베이터 1호기, 중앙 계단):')
        if (!name) return

        const type = window.prompt('수직 이동수단 종류를 입력하세요 (elevator, stair, escalator, ramp):', 'elevator')
        if (!type) return

        if (!['elevator', 'stair', 'escalator', 'ramp'].includes(type)) {
            window.alert('올바른 종류를 입력하세요: elevator, stair, escalator, ramp 중 하나여야 합니다.')
            return
        }

        try {
            setIsVerticalLoading(true)
            await createVerticalConnectorApi(tenantId, buildingId, { name, kind: type })
            await refreshVerticalConnectors()
            window.alert('수직 이동수단이 추가되었습니다.')
        } catch (err) {
            window.alert(err.message || '추가 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }, [tenantId, buildingId, refreshVerticalConnectors])

    const handleDeleteVerticalConnector = useCallback(async (connectorId) => {
        if (!tenantId || !buildingId) return
        if (!window.confirm('정말로 이 수직 이동수단을 삭제하시겠습니까? 연결된 모든 층의 매핑도 함께 삭제됩니다.')) return

        try {
            setIsVerticalLoading(true)
            await deleteVerticalConnectorApi(tenantId, buildingId, connectorId)
            await refreshVerticalConnectors()
            window.alert('수직 이동수단이 삭제되었습니다.')
        } catch (err) {
            window.alert(err.message || '삭제 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }, [tenantId, buildingId, refreshVerticalConnectors])

    const startVerticalNodePick = useCallback((connectorId, connectorName, targetFloorId) => {
        setActiveEditorTab('connection')
        setToolMode('select')

        if (targetFloorId !== floorId) {
            const pendingData = {
                connectorId,
                connectorName,
                floorId: targetFloorId,
            }
            try {
                window.sessionStorage.setItem('pending_connector_mapping', JSON.stringify(pendingData))
            } catch (e) {
                console.error(e)
            }
            const targetFloor = floorOptions.find((floor) => floor.id === targetFloorId)
            if (targetFloor) {
                handleFloorChange(targetFloor)
            } else {
                window.alert('해당 층을 찾을 수 없습니다.')
            }
        } else {
            setActiveConnectorForMapping({
                connectorId,
                connectorName,
                floorId: targetFloorId,
            })
        }
    }, [setActiveEditorTab, setToolMode, floorId, floorOptions, handleFloorChange])

    const handleMapVerticalNode = useCallback(async (connectorId, targetFloorId, nodeId) => {
        if (!tenantId || !buildingId) return

        try {
            setIsVerticalLoading(true)
            await mapVerticalConnectorNodeApi(tenantId, buildingId, connectorId, {
                nodeId,
                floorId: targetFloorId,
            })

            const connector = verticalConnectors.find((item) => item.id === connectorId)
            const connectorType = connector?.kind || 'elevator'

            setLocalEdits((current) => ({
                ...current,
                node: {
                    ...current.node,
                    [nodeId]: {
                        ...(current.node?.[nodeId] || {}),
                        kind: connectorType,
                    },
                },
            }))

            setActiveConnectorForMapping(null)
            await refreshVerticalConnectors()

            window.alert('성공적으로 노드가 수직 이동수단에 매핑되었습니다.')
        } catch (err) {
            window.alert(err.message || '노드 매핑 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }, [tenantId, buildingId, verticalConnectors, setLocalEdits, refreshVerticalConnectors])

    const handleUnmapVerticalNode = useCallback(async (connectorId, targetFloorId) => {
        if (!tenantId || !buildingId) return
        if (!window.confirm('이 층의 노드 연결을 해제하시겠습니까?')) return

        try {
            setIsVerticalLoading(true)
            await unmapVerticalConnectorNodeApi(tenantId, buildingId, connectorId, targetFloorId)
            await refreshVerticalConnectors()
            window.alert('노드 연결이 해제되었습니다.')
        } catch (err) {
            window.alert(err.message || '연결 해제 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }, [tenantId, buildingId, refreshVerticalConnectors])

    const handleViewVerticalNode = useCallback((targetFloorId, nodeId) => {
        if (targetFloorId !== floorId) {
            const targetFloor = floorOptions.find((floor) => floor.id === targetFloorId)
            if (targetFloor) {
                try {
                    window.sessionStorage.setItem('pending_selected_entity', JSON.stringify({ type: 'node', id: nodeId }))
                } catch (e) {
                    console.error(e)
                }
                handleFloorChange(targetFloor)
            } else {
                window.alert('해당 층을 찾을 수 없습니다.')
            }
        } else {
            setSelectedEntity({ type: 'node', id: nodeId })
        }
    }, [floorId, floorOptions, handleFloorChange, setSelectedEntity])

    useEffect(() => {
        if (activeEditorTab !== 'connection') {
            setPendingGatePick(null)
        }
    }, [activeEditorTab])

    useEffect(() => {
        try {
            const raw = window.sessionStorage.getItem('pending_connector_mapping')
            if (raw) {
                const parsed = JSON.parse(raw)
                if (parsed && parsed.floorId === floorId) {
                    setActiveConnectorForMapping(parsed)
                    window.sessionStorage.removeItem('pending_connector_mapping')
                }
            }
        } catch (e) {
            console.error(e)
        }
    }, [floorId])

    return {
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
        startVerticalNodePick,
        handleMapVerticalNode,
        handleUnmapVerticalNode,
        handleViewVerticalNode,
        cancelPendingGatePick: () => setPendingGatePick(null),
    }
}
