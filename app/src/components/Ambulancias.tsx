import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

type Ponto = [number, number]
type Posicao = [number, number, number]

type Trecho = {
  comprimento: number
  calcular: (distancia: number) => {
    x: number
    z: number
    rotacao: number
  }
}

// O modelo tem a frente voltada para X positivo.
function reta(inicio: Ponto, fim: Ponto): Trecho {
  const dx = fim[0] - inicio[0]
  const dz = fim[1] - inicio[1]
  const comprimento = Math.hypot(dx, dz)

  return {
    comprimento,
    calcular(distancia) {
      const progresso = distancia / comprimento

      return {
        x: inicio[0] + dx * progresso,
        z: inicio[1] + dz * progresso,
        rotacao: Math.atan2(-dz, dx),
      }
    },
  }
}

function curva(
  centro: Ponto,
  raio: number,
  anguloInicial: number,
  variacao: number,
): Trecho {
  const comprimento = Math.abs(variacao) * raio
  const sentido = Math.sign(variacao)

  return {
    comprimento,
    calcular(distancia) {
      const angulo =
        anguloInicial + sentido * (distancia / raio)

      const direcaoX = -Math.sin(angulo) * sentido
      const direcaoZ = Math.cos(angulo) * sentido

      return {
        x: centro[0] + raio * Math.cos(angulo),
        z: centro[1] + raio * Math.sin(angulo),
        rotacao: Math.atan2(-direcaoZ, direcaoX),
      }
    },
  }
}

// Circuito contínuo com ida e volta em faixas diferentes.
// Usa a estrada central e a EstradaComplementar.
const PERCURSO: Trecho[] = [
  // Estrada central, em direção à ligação lateral.
  reta([-14, -0.65], [15, -0.65]),

  // Curva para entrar no trecho lateral.
  curva([15, 0.6], 1.25, -Math.PI / 2, Math.PI / 2),

  // Subida pela lateral.
  reta([16.25, 0.6], [16.25, 7.4]),

  // Curva para a estrada dos hospitais novos.
  curva([15, 7.4], 1.25, 0, Math.PI / 2),

  // Passagem em frente aos hospitais novos.
  reta([15, 8.65], [-10.5, 8.65]),

  // Retorno no final da estrada superior.
  curva([-10.5, 8], 0.65, Math.PI / 2, Math.PI),

  // Volta pela outra faixa.
  reta([-10.5, 7.35], [14.35, 7.35]),

  // Curva de volta para o trecho lateral.
  curva([14.35, 6.75], 0.6, Math.PI / 2, -Math.PI / 2),

  reta([14.95, 6.75], [14.95, 1.25]),

  // Retorno à estrada central.
  curva([14.35, 1.25], 0.6, 0, -Math.PI / 2),

  reta([14.35, 0.65], [-14, 0.65]),

  // Retorno para reiniciar o circuito.
  curva([-14, 0], 0.65, Math.PI / 2, Math.PI),
]

const PERCURSO_TOTAL = PERCURSO.reduce(
  (total, trecho) => total + trecho.comprimento,
  0,
)

function calcularPosicao(distancia: number) {
  let restante =
    ((distancia % PERCURSO_TOTAL) + PERCURSO_TOTAL) %
    PERCURSO_TOTAL

  for (const trecho of PERCURSO) {
    if (restante < trecho.comprimento) {
      return trecho.calcular(restante)
    }

    restante -= trecho.comprimento
  }

  return PERCURSO[0]!.calcular(0)
}

type ModeloAmbulanciaProps = {
  cor: string
  estacionada?: boolean
}

// Modelo compartilhado pelas ambulâncias móveis e estacionadas.
function ModeloAmbulancia({
  cor,
  estacionada = false,
}: ModeloAmbulanciaProps) {
  return (
    <group>
      {/* Carroceria */}
      <mesh position={[-0.2, 0.48, 0]} castShadow>
        <boxGeometry args={[1.15, 0.62, 0.66]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </mesh>

      {/* Cabine */}
      <mesh position={[0.57, 0.39, 0]} castShadow>
        <boxGeometry args={[0.5, 0.44, 0.62]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Para-brisa */}
      <mesh position={[0.825, 0.48, 0]}>
        <boxGeometry args={[0.025, 0.2, 0.48]} />
        <meshStandardMaterial color="#164e63" />
      </mesh>

      {/* Janelas laterais */}
      {[-1, 1].map((lado) => (
        <mesh
          key={`janela-${lado}`}
          position={[0.57, 0.49, lado * 0.317]}
        >
          <boxGeometry args={[0.32, 0.18, 0.02]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      ))}

      {/* Faixas e símbolos */}
      {[-1, 1].map((lado) => (
        <group key={`lateral-${lado}`}>
          <mesh position={[-0.2, 0.34, lado * 0.337]}>
            <boxGeometry args={[1.1, 0.09, 0.02]} />
            <meshStandardMaterial color={cor} />
          </mesh>

          <mesh position={[-0.25, 0.59, lado * 0.342]}>
            <boxGeometry args={[0.08, 0.27, 0.025]} />
            <meshStandardMaterial color={cor} />
          </mesh>

          <mesh position={[-0.25, 0.59, lado * 0.342]}>
            <boxGeometry args={[0.27, 0.08, 0.025]} />
            <meshStandardMaterial color={cor} />
          </mesh>
        </group>
      ))}

      {/* Rodas */}
      {[-0.55, 0.53].map((x) =>
        [-0.34, 0.34].map((z) => (
          <mesh
            key={`roda-${x}-${z}`}
            position={[x, 0.15, z]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )),
      )}

      {/* Sinalizador */}
      <mesh position={[0.05, 0.84, 0]} castShadow>
        <boxGeometry args={[0.22, 0.1, 0.46]} />
        <meshStandardMaterial
          color={cor}
          emissive={cor}
          emissiveIntensity={estacionada ? 0 : 0.6}
        />
      </mesh>

      {/* Faróis */}
      {[-0.2, 0.2].map((z) => (
        <mesh key={`farol-${z}`} position={[0.83, 0.28, z]}>
          <boxGeometry args={[0.025, 0.08, 0.12]} />
          <meshStandardMaterial
            color="#fef3c7"
            emissive="#fef3c7"
            emissiveIntensity={estacionada ? 0 : 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

type AmbulanciaMovelProps = {
  velocidade: number
  inicio: number
  cor: string
}

function AmbulanciaMovel({
  velocidade,
  inicio,
  cor,
}: AmbulanciaMovelProps) {
  const veiculo = useRef<Group>(null)
  const distancia = useRef(inicio)

  useFrame((_, delta) => {
    if (!veiculo.current) return

    const intervalo = Math.min(delta, 0.05)

    distancia.current =
      (distancia.current + velocidade * intervalo) %
      PERCURSO_TOTAL

    const posicao = calcularPosicao(distancia.current)

    veiculo.current.position.set(posicao.x, 0.02, posicao.z)
    veiculo.current.rotation.y = posicao.rotacao
  })

  const posicaoInicial = calcularPosicao(inicio)

  return (
    <group
      ref={veiculo}
      position={[posicaoInicial.x, 0.02, posicaoInicial.z]}
      rotation={[0, posicaoInicial.rotacao, 0]}
    >
      <ModeloAmbulancia cor={cor} />
    </group>
  )
}

type AmbulanciaEstacionadaProps = {
  position: Posicao
  cor: string
}

function AmbulanciaEstacionada({
  position,
  cor,
}: AmbulanciaEstacionadaProps) {
  return (
    <group position={position}>
      {/* Vaga e acesso até a borda da estrada superior */}
      <mesh
        position={[0, 0.005, -0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1.5, 3.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Linhas laterais da vaga */}
      {[-0.62, 0.62].map((x) => (
        <mesh
          key={`linha-${x}`}
          position={[x, 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.045, 2.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Linha no fundo da vaga */}
      <mesh
        position={[0, 0.012, 1.25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.28, 0.045]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Frente voltada para a saída, em direção à estrada */}
      <group
        position={[0, 0.025, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <ModeloAmbulancia cor={cor} estacionada />
      </group>
    </group>
  )
}

export default function Ambulancias() {
  return (
    <group>
      {/* Mesma velocidade para manter distância entre veículos */}
      <AmbulanciaMovel
        velocidade={2}
        inicio={0}
        cor="#0d9488"
      />

      <AmbulanciaMovel
        velocidade={2}
        inicio={PERCURSO_TOTAL / 2}
        cor="#2563eb"
      />

      {/* Estacionada ao lado do Hospital Araucárias */}
      <AmbulanciaEstacionada
        position={[-12.5, 0, 11.5]}
        cor="#0d9488"
      />

      {/* Estacionada ao lado do Hospital Rio Negro */}
      <AmbulanciaEstacionada
        position={[4, 0, 11.5]}
        cor="#2563eb"
      />
    </group>
  )
}