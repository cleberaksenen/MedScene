import { corPorConclusao } from '../utils/coresIndicadores'

type HospitalProps = {
  position?: [number, number, number]
  onSelect?: () => void
  taxaConclusao?: number | null
}

export default function Hospital({
  position = [0, 0, 0],
  onSelect,
  taxaConclusao = null,
}: HospitalProps) {
  const corCobertura = corPorConclusao(taxaConclusao)

  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.()
      }}
    >
      {/* Corpo principal */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 2.8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Cobertura com a escala vermelho → laranja → azul */}
      <mesh position={[0, 3.15, 0]} castShadow>
        <boxGeometry args={[4.3, 0.3, 3.1]} />
        <meshStandardMaterial
          color={corCobertura}
          roughness={0.8}
        />
      </mesh>

      {/* Porta de entrada */}
      <mesh position={[0, 0.65, 1.43]}>
        <boxGeometry args={[0.9, 1.3, 0.08]} />
        <meshStandardMaterial color="#164e63" />
      </mesh>

      {/* Janelas da fachada */}
      {[-1.4, 0, 1.4].map((x) => (
        <mesh key={x} position={[x, 2.1, 1.43]}>
          <boxGeometry args={[0.75, 0.7, 0.08]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.25}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Símbolo do hospital */}
      <group position={[0, 3.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 1, 0.25]} />
          <meshStandardMaterial color="#14b8a6" />
        </mesh>

        <mesh castShadow>
          <boxGeometry args={[1, 0.3, 0.25]} />
          <meshStandardMaterial color="#14b8a6" />
        </mesh>
      </group>
    </group>
  )
}