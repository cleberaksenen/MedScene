type PisoProps = {
  position: [number, number, number]
  largura: number
  comprimento: number
  cor: string
}

function Piso({
  position,
  largura,
  comprimento,
  cor,
}: PisoProps) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[largura, comprimento]} />
      <meshStandardMaterial color={cor} />
    </mesh>
  )
}

export default function EstradaComplementar() {
  const corAsfalto = '#64748b'
  const corFaixa = '#f8fafc'

  // Nesta orientação da câmera, o X positivo aparece à esquerda.
  const xLateral = 15.6

  return (
    <group>
      {/* Ligação lateral entre a estrada atual e a nova */}
      <Piso
        position={[xLateral, 0, 4]}
        largura={2.8}
        comprimento={5.2}
        cor={corAsfalto}
      />

      {/* Estrada em frente aos hospitais da terceira fileira */}
      <Piso
        position={[2.5, 0, 8]}
        largura={29}
        comprimento={2.8}
        cor={corAsfalto}
      />

      {/* Faixas no trecho lateral */}
      {[2.4, 4.8].map((z) => (
        <Piso
          key={`lateral-${z}`}
          position={[xLateral, 0.012, z]}
          largura={0.08}
          comprimento={1.4}
          cor={corFaixa}
        />
      ))}

      {/* Faixas no novo trecho horizontal */}
      {[-10, -6, -2, 2, 6, 10, 13].map((x) => (
        <Piso
          key={`horizontal-${x}`}
          position={[x, 0.012, 8]}
          largura={1.6}
          comprimento={0.08}
          cor={corFaixa}
        />
      ))}

      {/* Calçada em frente aos dois novos hospitais */}
      <mesh position={[-4, 0.03, 9.95]} receiveShadow>
        <boxGeometry args={[16, 0.06, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Meio-fio voltado para a estrada */}
      <mesh position={[-4, 0.055, 9.48]} receiveShadow>
        <boxGeometry args={[16, 0.11, 0.14]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Acessos às entradas dos hospitais */}
      {[-8, 0].map((x) => (
        <mesh
          key={`entrada-${x}`}
          position={[x, 0.03, 10.5]}
          receiveShadow
        >
          <boxGeometry args={[1.5, 0.06, 0.5]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}
    </group>
  )
}