import * as THREE from 'three'
import { complement, type Base } from '../../models/dna/dnaModel'
import type { ThreeContext } from '../../../lib/three/ThreeCanvas'

function baseColor(b: Base) {
  if (b === 'A') return new THREE.Color(0x60a5fa) // blue
  if (b === 'T') return new THREE.Color(0x34d399) // green
  if (b === 'G') return new THREE.Color(0xa78bfa) // purple
  return new THREE.Color(0xfbbf24) // C amber
}

type DnaSceneHandle = {
  apply: (strand: Base[], mismatches: Set<number>) => void
}

export function initPremiumDnaScene(ctx: ThreeContext, initial: Base[]): (() => void) | void {
  const { scene, camera } = ctx
  scene.clear()

  camera.position.set(0, 3.4, 10.2)
  camera.lookAt(0, 0, 0)

  // Lights (premium look)
  scene.add(new THREE.HemisphereLight(0x9bdcff, 0x09101e, 0.85))
  scene.add(new THREE.AmbientLight(0xffffff, 0.10))
  const key = new THREE.DirectionalLight(0xffffff, 1.05)
  key.position.set(7, 10, 5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xb7ffd6, 0.35)
  rim.position.set(-8, 4, -6)
  scene.add(rim)

  // Stage
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(4.6, 4.8, 0.22, 64),
    new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.95, metalness: 0.0 }),
  )
  stage.position.set(0, -4.2, 0)
  stage.receiveShadow = true
  scene.add(stage)

  const group = new THREE.Group()
  scene.add(group)

  // Geometries
  const backboneGeo = new THREE.SphereGeometry(0.11, 18, 14)
  const baseGeo = new THREE.SphereGeometry(0.20, 22, 16)
  const bondGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 14)

  // Materials (instanced)
  const backboneMatL = new THREE.MeshPhysicalMaterial({
    color: 0x7dd3fc,
    roughness: 0.28,
    metalness: 0.06,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
  })
  const backboneMatR = new THREE.MeshPhysicalMaterial({
    color: 0xffe8a3,
    roughness: 0.28,
    metalness: 0.06,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
  })
  const baseMat = new THREE.MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0.08,
    emissive: 0x000000,
    vertexColors: true,
  })
  const bondMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.75,
    metalness: 0.0,
    transparent: true,
    opacity: 0.26,
  })

  const radius = 2.05
  const stepY = 0.235
  const twist = (Math.PI * 2) / 10.0

  let leftBack: THREE.InstancedMesh | null = null
  let rightBack: THREE.InstancedMesh | null = null
  let leftBase: THREE.InstancedMesh | null = null
  let rightBase: THREE.InstancedMesh | null = null
  let bonds: THREE.InstancedMesh | null = null
  let count = 0

  const tmpM = new THREE.Matrix4()
  const tmpQ = new THREE.Quaternion()
  const tmpS = new THREE.Vector3(1, 1, 1)
  const tmpV = new THREE.Vector3()
  const tmpV2 = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  const rebuild = (strand: Base[]) => {
    group.clear()
    count = Math.max(0, strand.length)
    if (count <= 0) return

    leftBack = new THREE.InstancedMesh(backboneGeo, backboneMatL, count)
    rightBack = new THREE.InstancedMesh(backboneGeo, backboneMatR, count)
    leftBase = new THREE.InstancedMesh(baseGeo, baseMat, count)
    rightBase = new THREE.InstancedMesh(baseGeo, baseMat, count)
    bonds = new THREE.InstancedMesh(bondGeo, bondMat, count)

    leftBack.castShadow = true
    rightBack.castShadow = true
    leftBase.castShadow = true
    rightBase.castShadow = true
    bonds.castShadow = false

    // needed for instance colors
    ;(leftBase as THREE.InstancedMesh).instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3)
    ;(rightBase as THREE.InstancedMesh).instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3)

    for (let i = 0; i < count; i++) {
      const ang = i * twist
      const y = (i - count / 2) * stepY

      const lx = Math.cos(ang) * radius
      const lz = Math.sin(ang) * radius
      const rx = Math.cos(ang + Math.PI) * radius
      const rz = Math.sin(ang + Math.PI) * radius

      tmpM.compose(new THREE.Vector3(lx, y, lz), new THREE.Quaternion(), tmpS)
      leftBack!.setMatrixAt(i, tmpM)
      tmpM.compose(new THREE.Vector3(rx, y, rz), new THREE.Quaternion(), tmpS)
      rightBack!.setMatrixAt(i, tmpM)

      const left = strand[i] ?? 'A'
      const right = complement(left)

      tmpM.compose(new THREE.Vector3(lx * 0.80, y, lz * 0.80), new THREE.Quaternion(), tmpS)
      leftBase!.setMatrixAt(i, tmpM)
      ;(leftBase!.instanceColor as THREE.InstancedBufferAttribute).setXYZ(i, baseColor(left).r, baseColor(left).g, baseColor(left).b)

      tmpM.compose(new THREE.Vector3(rx * 0.80, y, rz * 0.80), new THREE.Quaternion(), tmpS)
      rightBase!.setMatrixAt(i, tmpM)
      ;(rightBase!.instanceColor as THREE.InstancedBufferAttribute).setXYZ(i, baseColor(right).r, baseColor(right).g, baseColor(right).b)

      // hydrogen bond cylinder from left to right
      tmpV.set(lx * 0.78, y, lz * 0.78)
      tmpV2.set(rx * 0.78, y, rz * 0.78)
      const mid = tmpV.clone().add(tmpV2).multiplyScalar(0.5)
      const dir = tmpV2.clone().sub(tmpV)
      const len = Math.max(0.001, dir.length())
      dir.normalize()
      tmpQ.setFromUnitVectors(up, dir)
      tmpM.compose(mid, tmpQ, new THREE.Vector3(1, len, 1))
      bonds!.setMatrixAt(i, tmpM)
    }

    leftBack.instanceMatrix.needsUpdate = true
    rightBack.instanceMatrix.needsUpdate = true
    leftBase.instanceMatrix.needsUpdate = true
    rightBase.instanceMatrix.needsUpdate = true
    bonds.instanceMatrix.needsUpdate = true
    ;(leftBase.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true
    ;(rightBase.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true

    group.add(leftBack, rightBack, bonds, leftBase, rightBase)
  }

  const apply: DnaSceneHandle['apply'] = (strand, mismatches) => {
    if (!leftBase || strand.length !== count) rebuild(strand)
    if (!leftBase || !rightBase) return

    for (let i = 0; i < Math.min(count, strand.length); i++) {
      const left = strand[i] ?? 'A'
      const right = complement(left)
      const bad = mismatches.has(i)
      const cL = bad ? new THREE.Color(0xef4444) : baseColor(left)
      const cR = bad ? new THREE.Color(0xef4444) : baseColor(right)
      ;(leftBase.instanceColor as THREE.InstancedBufferAttribute).setXYZ(i, cL.r, cL.g, cL.b)
      ;(rightBase.instanceColor as THREE.InstancedBufferAttribute).setXYZ(i, cR.r, cR.g, cR.b)
    }
    ;(leftBase.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true
    ;(rightBase.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true
  }

  rebuild(initial.length > 0 ? initial : (['A', 'T', 'G', 'C', 'A', 'T', 'G', 'C'] as Base[]))
  scene.userData = { apply } satisfies DnaSceneHandle

  return () => {
    backboneGeo.dispose()
    baseGeo.dispose()
    bondGeo.dispose()
    backboneMatL.dispose()
    backboneMatR.dispose()
    baseMat.dispose()
    bondMat.dispose()
    ;(stage.geometry as THREE.BufferGeometry).dispose()
    ;(stage.material as THREE.Material).dispose()
  }
}

