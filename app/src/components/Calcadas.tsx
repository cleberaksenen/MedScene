type PisoProps = {
  position: [number, number, number]
  largura: number
  profundidade: number
  cor?: string
}

function Piso({
  position,
  largura,
  profundidade,
  cor = '#e5e7eb',
}: PisoProps) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[largura, 0.06, profundidade]} />
      <meshStandardMaterial color={cor} roughness={1} />
    </mesh>
  )
}

function FaixaPedestres({ x }: { x: number }) {
  return (
    <group>
      {Array.from({ length: 7 }, (_, indice) => (
        <mesh
          key={indice}
          position={[x, 0.015, -1.08 + indice * 0.36]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[1.3, 0.2]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Calcadas() {
  const colunasHospitais = [-8, 0, 8]
  const lados = [-1, 1]

  return (
    <group>
      {/* Calçadas paralelas à via central */}
      {lados.map((lado) => (
        <group key={`calcada-${lado}`}>
          <Piso
            position={[0, 0.03, lado * 1.95]}
            largura={31}
            profundidade={0.8}
          />

          {/* Meio-fio junto à pista */}
          <mesh
            position={[0, 0.045, lado * 1.48]}
            receiveShadow
          >
            <boxGeometry args={[31, 0.09, 0.12]} />
            <meshStandardMaterial
              color="#94a3b8"
              roughness={1}
            />
          </mesh>

          {/* Juntas entre as placas da calçada */}
          {Array.from({ length: 31 }, (_, indice) => (
            <mesh
              key={`junta-${indice}`}
              position={[-15 + indice, 0.061, lado * 1.95]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.018, 0.76]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          ))}

          {/* Acessos aos três hospitais da fileira */}
          {colunasHospitais.map((x) => (
            <Piso
              key={`acesso-${x}`}
              position={[x, 0.035, lado * 2.55]}
              largura={1.5}
              profundidade={1.2}
              cor="#d8dee6"
            />
          ))}
        </group>
      ))}

      {/* Travessias entre as duas calçadas */}
      <FaixaPedestres x={-4} />
      <FaixaPedestres x={4} />
    </group>
  )
}