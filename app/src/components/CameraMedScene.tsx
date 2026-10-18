import { useEffect, useRef } from 'react'
import {
  CameraControls,
  CameraControlsImpl,
} from '@react-three/drei'

type CameraMedSceneProps = {
  // Posição do hospital selecionado.
  // null retorna à visão geral.
  foco?: [number, number, number] | null
}

export default function CameraMedScene({
  foco = null,
}: CameraMedSceneProps) {
  const controles = useRef<CameraControlsImpl>(null)

  const temFoco = foco !== null
  const x = foco?.[0] ?? 0
  const y = foco?.[1] ?? 0
  const z = foco?.[2] ?? 0

  useEffect(() => {
    const camera = controles.current

    if (!camera) return

    if (temFoco) {
      // Aproxima pelo lado da entrada do hospital.
      const ladoEntrada = z > 0 ? -1 : 1

      void camera.setLookAt(
        x + 7,
        y + 7,
        z + ladoEntrada * 10,
        x,
        y + 1.5,
        z,
        true,
      )
    } else {
      // Posição da visão geral.
      void camera.setLookAt(
        24,
        22,
        28,
        0,
        1,
        0,
        true,
      )
    }
  }, [temFoco, x, y, z])

  return (
    <CameraControls
      ref={controles}
      makeDefault
      smoothTime={0.7}
      draggingSmoothTime={0.15}
      minDistance={6}
      maxDistance={55}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.1}
      mouseButtons={{
        left: CameraControlsImpl.ACTION.ROTATE,
        middle: CameraControlsImpl.ACTION.DOLLY,
        right: CameraControlsImpl.ACTION.NONE,
        wheel: CameraControlsImpl.ACTION.DOLLY,
      }}
      touches={{
        one: CameraControlsImpl.ACTION.TOUCH_ROTATE,
        two: CameraControlsImpl.ACTION.TOUCH_DOLLY,
        three: CameraControlsImpl.ACTION.NONE,
      }}
    />
  )
}