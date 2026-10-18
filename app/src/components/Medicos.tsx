import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

type Posicao = [number, number, number]

type HospitalMedicos = {
  id: string
  position: Posicao
  residentes: number | null
}

type MedicosProps = {
  hospitais: HospitalMedicos[]
}

type MedicoProps = {
  position: Posicao
  destino?: Posicao
  velocidade?: number
  fase?: number
  rotacao?: number
  pele?: string
  cabelo?: string
  uniforme?: string
}

function quantidadeBonecos(residentes: number | null) {
  if (
    residentes === null ||
    !Number.isFinite(residentes) ||
    residentes <= 0
  ) {
    return 0
  }

  if (residentes <= 50) return 1
  if (residentes <= 100) return 2
  return 3
}

const aparencias = [
  {
    pele: '#8d5b42',
    cabelo: '#25201d',
    uniforme: '#348a99',
  },
  {
    pele: '#e0ad8a',
    cabelo: '#654431',
    uniforme: '#6476a8',
  },
  {
    pele: '#b97854',
    cabelo: '#302924',
    uniforme: '#348a99',
  },
]

function Medico({
  position,
  destino,
  velocidade = 0.55,
  fase = 0,
  rotacao = 0,
  pele = '#c58c69',
  cabelo = '#302924',
  uniforme = '#348a99',
}: MedicoProps) {
  const pessoa = useRef<Group>(null)
  const corpo = useRef<Group>(null)
  const bracoEsquerdo = useRef<Group>(null)
  const bracoDireito = useRef<Group>(null)
  const pernaEsquerda = useRef<Group>(null)
  const pernaDireita = useRef<Group>(null)

  const tempo = useRef(fase)

  useFrame((_, delta) => {
    if (!pessoa.current || !corpo.current) return

    const intervalo = Math.min(delta, 0.05)
    tempo.current += intervalo

    // Médicos parados: movimento discreto de respiração.
    if (!destino) {
      corpo.current.position.y =
        Math.sin(tempo.current * 1.8) * 0.006
      return
    }

    const diferencaX = destino[0] - position[0]
    const diferencaZ = destino[2] - position[2]
    const distancia = Math.hypot(diferencaX, diferencaZ)

    if (distancia === 0 || velocidade <= 0) return

    const duracaoCaminhada = distancia / velocidade
    const pausa = 1.5
    const duracaoCiclo = duracaoCaminhada * 2 + pausa * 2
    const momento = tempo.current % duracaoCiclo

    let progresso = 0
    let direcao = 1
    let caminhando = false

    if (momento < duracaoCaminhada) {
      progresso = momento / duracaoCaminhada
      caminhando = true
    } else if (momento < duracaoCaminhada + pausa) {
      progresso = 1
    } else if (momento < duracaoCaminhada * 2 + pausa) {
      progresso =
        1 - (momento - duracaoCaminhada - pausa) / duracaoCaminhada

      direcao = -1
      caminhando = true
    } else {
      progresso = 0
      direcao = -1
    }

    pessoa.current.position.set(
      position[0] + diferencaX * progresso,
      position[1],
      position[2] + diferencaZ * progresso,
    )

    const anguloDesejado = Math.atan2(
      diferencaX * direcao,
      diferencaZ * direcao,
    )

    const diferencaAngulo = Math.atan2(
      Math.sin(anguloDesejado - pessoa.current.rotation.y),
      Math.cos(anguloDesejado - pessoa.current.rotation.y),
    )

    pessoa.current.rotation.y +=
      diferencaAngulo * (1 - Math.exp(-8 * intervalo))

    const passo = caminhando
      ? Math.sin(tempo.current * 8) * 0.38
      : 0

    if (bracoEsquerdo.current) {
      bracoEsquerdo.current.rotation.x = passo
    }

    if (bracoDireito.current) {
      bracoDireito.current.rotation.x = -passo
    }

    if (pernaEsquerda.current) {
      pernaEsquerda.current.rotation.x = -passo
    }

    if (pernaDireita.current) {
      pernaDireita.current.rotation.x = passo
    }

    corpo.current.position.y = caminhando
      ? Math.abs(Math.sin(tempo.current * 8)) * 0.015
      : Math.sin(tempo.current * 1.8) * 0.006
  })

  const orientacaoInicial = destino
    ? Math.atan2(
        destino[0] - position[0],
        destino[2] - position[2],
      )
    : rotacao

  return (
    <group
      ref={pessoa}
      position={position}
      rotation={[0, orientacaoInicial, 0]}
    >
      <group ref={corpo}>
        {/* Camisa */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[0.25, 0.38, 0.18]} />
          <meshStandardMaterial color={uniforme} />
        </mesh>

        {/* Parte de trás do jaleco */}
        <mesh position={[0, 0.65, -0.065]} castShadow>
          <boxGeometry args={[0.32, 0.5, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>

        {/* Abas da frente do jaleco */}
        {[-1, 1].map((lado) => (
          <mesh
            key={`jaleco-${lado}`}
            position={[lado * 0.105, 0.65, 0.055]}
            castShadow
          >
            <boxGeometry args={[0.11, 0.5, 0.13]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Crachá */}
        <mesh position={[-0.105, 0.77, 0.125]}>
          <boxGeometry args={[0.065, 0.09, 0.012]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>

        {/* Pescoço */}
        <mesh position={[0, 0.94, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.1, 8]} />
          <meshStandardMaterial color={pele} />
        </mesh>

        {/* Cabeça */}
        <mesh position={[0, 1.08, 0]} castShadow>
          <sphereGeometry args={[0.135, 12, 10]} />
          <meshStandardMaterial color={pele} roughness={1} />
        </mesh>

        {/* Cabelo */}
        <mesh position={[0, 1.15, -0.015]} castShadow>
          <sphereGeometry
            args={[0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color={cabelo} roughness={1} />
        </mesh>

        {/* Olhos */}
        {[-1, 1].map((lado) => (
          <mesh
            key={`olho-${lado}`}
            position={[lado * 0.045, 1.09, 0.123]}
          >
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}

        {/* Braço esquerdo */}
        <group ref={bracoEsquerdo} position={[-0.2, 0.85, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          <mesh position={[0, -0.32, 0]} castShadow>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={pele} />
          </mesh>
        </group>

        {/* Braço direito */}
        <group ref={bracoDireito} position={[0.2, 0.85, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          <mesh position={[0, -0.32, 0]} castShadow>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={pele} />
          </mesh>
        </group>

        {/* Perna esquerda */}
        <group ref={pernaEsquerda} position={[-0.085, 0.43, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.11, 0.34, 0.13]} />
            <meshStandardMaterial color="#334155" />
          </mesh>

          <mesh position={[0, -0.38, 0.035]} castShadow>
            <boxGeometry args={[0.13, 0.1, 0.22]} />
            <meshStandardMaterial color="#182332" />
          </mesh>
        </group>

        {/* Perna direita */}
        <group ref={pernaDireita} position={[0.085, 0.43, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.11, 0.34, 0.13]} />
            <meshStandardMaterial color="#334155" />
          </mesh>

          <mesh position={[0, -0.38, 0.035]} castShadow>
            <boxGeometry args={[0.13, 0.1, 0.22]} />
            <meshStandardMaterial color="#182332" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export default function Medicos({ hospitais }: MedicosProps) {
  return (
    <group>
      {/* Parados: quantidade determinada pelos residentes do mês */}
      {hospitais.map((hospital) => {
        const quantidade = quantidadeBonecos(hospital.residentes)
        const [x, y, z] = hospital.position

        // Direção da entrada, voltada para a via central.
        const sentidoEntrada = z > 0 ? -1 : 1
        const rotacao = z > 0 ? Math.PI : 0

        return (
          <group key={hospital.id}>
            {Array.from({ length: quantidade }, (_, indice) => {
              // Distribui o grupo diante da fachada.
              const deslocamentoX =
                (indice - (quantidade - 1) / 2) * 0.65

              const aparencia = aparencias[indice % aparencias.length]

              return (
                <Medico
                  key={`${hospital.id}-${indice}`}
                  position={[
                    x + deslocamentoX,
                    y + 0.08,
                    z + sentidoEntrada * 1.7,
                  ]}
                  rotacao={rotacao}
                  fase={indice * 1.3}
                  pele={aparencia.pele}
                  cabelo={aparencia.cabelo}
                  uniforme={aparencia.uniforme}
                />
              )
            })}
          </group>
        )
      })}

      {/* Caminhando: animação ilustrativa */}
      <Medico
        position={[-11, 0.08, -1.85]}
        destino={[-5, 0.08, -1.85]}
        velocidade={0.5}
        pele="#d19a76"
        cabelo="#3b2922"
      />

      <Medico
        position={[2.5, 0.08, -1.85]}
        destino={[10.5, 0.08, -1.85]}
        velocidade={0.6}
        fase={5}
        pele="#88563e"
        cabelo="#201c1a"
        uniforme="#6476a8"
      />

      <Medico
        position={[-10.5, 0.08, 1.85]}
        destino={[-3, 0.08, 1.85]}
        velocidade={0.55}
        fase={8}
        pele="#ecc3a1"
        cabelo="#806044"
      />

      <Medico
        position={[3, 0.08, 1.85]}
        destino={[11, 0.08, 1.85]}
        velocidade={0.45}
        fase={3}
        pele="#b77d59"
        cabelo="#332721"
        uniforme="#6476a8"
      />
    </group>
  )
}