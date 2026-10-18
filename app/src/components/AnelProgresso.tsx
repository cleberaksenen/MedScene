import { corPorConclusao } from '../utils/coresIndicadores'

type AnelProgressoProps = {
  position?: [number, number, number]
  taxa: number | null
  meta?: number
}

export default function AnelProgresso({
  position = [0, 0, 0],
  taxa,
  meta = 0.8,
}: AnelProgressoProps) {
  const possuiDados =
    taxa !== null &&
    Number.isFinite(taxa) &&
    taxa >= 0 &&
    taxa <= 1

  const progresso = possuiDados ? taxa : 0
  const corProgresso = corPorConclusao(taxa)

  const metaValida = Number.isFinite(meta)
    ? Math.max(0, Math.min(1, meta))
    : 0.8

  const raioInterno = 2.58
  const raioExterno = 2.76
  const raioMedio = (raioInterno + raioExterno) / 2

  // Usa a mesma origem e o mesmo sentido do arco de progresso.
  const anguloMeta = -Math.PI / 2 + Math.PI * 2 * metaValida

  const marcadorX = Math.cos(anguloMeta) * raioMedio
  const marcadorY = Math.sin(anguloMeta) * raioMedio

  return (
    <group position={position}>
      <group
        position={[0, 0.095, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {/* Fundo do círculo */}
        <mesh>
          <ringGeometry
            args={[
              raioInterno,
              raioExterno,
              96,
              1,
              0,
              Math.PI * 2,
            ]}
          />

          <meshBasicMaterial
            color={possuiDados ? '#cbd5e1' : '#94a3b8'}
          />
        </mesh>

        {/* Proporção concluída */}
        {possuiDados && progresso > 0 && (
          <mesh position={[0, 0, 0.004]}>
            <ringGeometry
              args={[
                raioInterno,
                raioExterno,
                96,
                1,
                -Math.PI / 2,
                Math.PI * 2 * progresso,
              ]}
            />

            <meshBasicMaterial color={corProgresso} />
          </mesh>
        )}

        {/* Marca da meta: traço escuro com contorno branco */}
        <group
          position={[marcadorX, marcadorY, 0.012]}
          rotation={[0, 0, anguloMeta]}
        >
          <mesh>
            <planeGeometry args={[0.42, 0.12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          <mesh position={[0, 0, 0.002]}>
            <planeGeometry args={[0.36, 0.055]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      </group>
    </group>
  )
}