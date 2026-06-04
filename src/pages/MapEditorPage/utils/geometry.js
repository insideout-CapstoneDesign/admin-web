export function hasValidBoundingBox(item) {
    return Array.isArray(item?.bboxPx) && item.bboxPx.length === 4
}

function ringsToSvgPath(rings) {
    return rings
        .filter((ring) => Array.isArray(ring) && ring.length > 1)
        .map((ring) => {
            const [first, ...rest] = ring
            const segments = rest.map((point) => `L ${point[0]} ${point[1]}`).join(' ')
            return `M ${first[0]} ${first[1]} ${segments} Z`
        })
        .join(' ')
}

export function geometryToShape(geometry, fallbackBBox = null) {
    if (geometry?.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
        const path = ringsToSvgPath(geometry.coordinates)
        return path ? { kind: 'polygon', path } : null
    }

    if (geometry?.type === 'LineString' && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 1) {
        return {
            kind: 'line',
            points: geometry.coordinates.map((point) => point.join(',')).join(' '),
        }
    }

    if (geometry?.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length === 2) {
        return {
            kind: 'point',
            cx: geometry.coordinates[0],
            cy: geometry.coordinates[1],
        }
    }

    if (Array.isArray(fallbackBBox) && fallbackBBox.length === 4) {
        const [x, y, width, height] = fallbackBBox
        return { kind: 'bbox', x, y, width, height }
    }

    return null
}

export function getPolygonCenter(geometry) {
    if (geometry?.type !== 'Polygon' || !Array.isArray(geometry.coordinates?.[0])) {
        return null
    }

    const ring = geometry.coordinates[0].slice(0, -1)
    if (!ring.length) return null

    const total = ring.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 })
    return {
        x: total.x / ring.length,
        y: total.y / ring.length,
    }
}

export function getLineMidpoint(geometry) {
    if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
        return null
    }

    const len = geometry.coordinates.length
    if (len % 2 !== 0) {
        const midpoint = geometry.coordinates[Math.floor(len / 2)]
        return { x: midpoint[0], y: midpoint[1] }
    }

    const mid = len / 2
    const p1 = geometry.coordinates[mid - 1]
    const p2 = geometry.coordinates[mid]
    return {
        x: (p1[0] + p2[0]) / 2,
        y: (p1[1] + p2[1]) / 2,
    }
}

export function getPointPosition(geometry) {
    if (geometry?.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
        return null
    }

    return {
        x: geometry.coordinates[0],
        y: geometry.coordinates[1],
    }
}

export function getPolygonVertices(geometry) {
    if (geometry?.type !== 'Polygon' || !Array.isArray(geometry.coordinates?.[0])) {
        return []
    }

    const ring = geometry.coordinates[0]
    if (!Array.isArray(ring) || ring.length < 4) return []

    return ring.slice(0, -1).map(([x, y]) => ({ x, y }))
}

export function buildPolygonGeometry(vertices) {
    if (!Array.isArray(vertices) || vertices.length < 3) return null

    const closedRing = [
        ...vertices.map(({ x, y }) => [x, y]),
        [vertices[0].x, vertices[0].y],
    ]

    return {
        type: 'Polygon',
        coordinates: [closedRing],
    }
}

export function getPolygonMidpoints(vertices) {
    if (!Array.isArray(vertices) || vertices.length < 2) return []

    return vertices.map((vertex, index) => {
        const next = vertices[(index + 1) % vertices.length]
        return {
            insertIndex: index + 1,
            x: (vertex.x + next.x) / 2,
            y: (vertex.y + next.y) / 2,
        }
    })
}

function polygonArea(vertices) {
    if (!Array.isArray(vertices) || vertices.length < 3) return 0

    let area = 0
    for (let index = 0; index < vertices.length; index += 1) {
        const current = vertices[index]
        const next = vertices[(index + 1) % vertices.length]
        area += (current.x * next.y) - (next.x * current.y)
    }

    return area / 2
}

function orientation(a, b, c) {
    const value = ((b.y - a.y) * (c.x - b.x)) - ((b.x - a.x) * (c.y - b.y))
    if (Math.abs(value) < 0.000001) return 0
    return value > 0 ? 1 : 2
}

function onSegment(a, b, c) {
    return (
        b.x <= Math.max(a.x, c.x)
        && b.x >= Math.min(a.x, c.x)
        && b.y <= Math.max(a.y, c.y)
        && b.y >= Math.min(a.y, c.y)
    )
}

function segmentsIntersect(a, b, c, d) {
    const o1 = orientation(a, b, c)
    const o2 = orientation(a, b, d)
    const o3 = orientation(c, d, a)
    const o4 = orientation(c, d, b)

    if (o1 !== o2 && o3 !== o4) return true
    if (o1 === 0 && onSegment(a, c, b)) return true
    if (o2 === 0 && onSegment(a, d, b)) return true
    if (o3 === 0 && onSegment(c, a, d)) return true
    if (o4 === 0 && onSegment(c, b, d)) return true

    return false
}

export function isSimplePolygon(vertices) {
    if (!Array.isArray(vertices) || vertices.length < 3) return false
    if (Math.abs(polygonArea(vertices)) < 1) return false

    for (let i = 0; i < vertices.length; i += 1) {
        const a1 = vertices[i]
        const a2 = vertices[(i + 1) % vertices.length]

        for (let j = i + 1; j < vertices.length; j += 1) {
            const b1 = vertices[j]
            const b2 = vertices[(j + 1) % vertices.length]
            const isSameEdge = i === j
            const isAdjacent = Math.abs(i - j) === 1
            const isFirstLastPair = i === 0 && j === vertices.length - 1

            if (isSameEdge || isAdjacent || isFirstLastPair) continue
            if (segmentsIntersect(a1, a2, b1, b2)) return false
        }
    }

    return true
}

export function distanceBetweenPoints(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y)
}

export function getSnappedPoint(point, snapTargets, threshold = 14) {
    let bestTarget = null
    let bestDistance = threshold

    for (const target of snapTargets || []) {
        const distance = distanceBetweenPoints(point, target)
        if (distance <= bestDistance) {
            bestTarget = target
            bestDistance = distance
        }
    }

    if (!bestTarget) return point

    return {
        x: bestTarget.x,
        y: bestTarget.y,
    }
}

export function translateGeometry(geometry, dx, dy) {
    if (!geometry) return geometry

    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
        return {
            ...geometry,
            coordinates: [
                geometry.coordinates[0] + dx,
                geometry.coordinates[1] + dy,
            ],
        }
    }

    if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
        return {
            ...geometry,
            coordinates: geometry.coordinates.map(([x, y]) => [x + dx, y + dy]),
        }
    }

    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
        return {
            ...geometry,
            coordinates: geometry.coordinates.map((ring) =>
                ring.map(([x, y]) => [x + dx, y + dy])
            ),
        }
    }

    return geometry
}

export function updateLineEndpointGeometry(geometry, role, point, nodeOriginalPosition) {
    if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
        return geometry
    }

    const nextCoordinates = geometry.coordinates.map(([x, y]) => [x, y])

    // DB의 LineString 좌표 순서와 fromNodeId/toNodeId 순서가 불일치할 수 있어서 원래 노드 위치 기준으로 끝점을 고른다.
    if (nodeOriginalPosition) {
        const first = nextCoordinates[0]
        const last = nextCoordinates[nextCoordinates.length - 1]
        const distToFirst = (first[0] - nodeOriginalPosition.x) ** 2 + (first[1] - nodeOriginalPosition.y) ** 2
        const distToLast = (last[0] - nodeOriginalPosition.x) ** 2 + (last[1] - nodeOriginalPosition.y) ** 2

        if (distToFirst <= distToLast) {
            nextCoordinates[0] = [point.x, point.y]
        } else {
            nextCoordinates[nextCoordinates.length - 1] = [point.x, point.y]
        }
    } else {
        if (role === 'from') {
            nextCoordinates[0] = [point.x, point.y]
        }
        if (role === 'to') {
            nextCoordinates[nextCoordinates.length - 1] = [point.x, point.y]
        }
    }

    return {
        ...geometry,
        coordinates: nextCoordinates,
    }
}

export function getAiTextAnchor(detection) {
    if (hasValidBoundingBox(detection)) {
        const [x, y, width, height] = detection.bboxPx
        return {
            x: x + (width / 2),
            y: y + (height / 2),
        }
    }

    return getPolygonCenter(detection.geomPx) || getLineMidpoint(detection.geomPx) || getPointPosition(detection.geomPx)
}

export function getFloorDraftCacheKey(buildingId, floorId) {
    return `map-editor-local:${buildingId}:${floorId}`
}
