type Posicao = [number, number, number]

type ArvoreProps = {
  position: Posicao
  escala?: number
  cor?: string
}

function Arvore({
  position,
  escala = 1,
  cor = '#4d9565',
}: ArvoreProps) {
  return (
    <group position={position} scale={escala}>
      {/* Tronco */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.1, 7]} />
        <meshStandardMaterial color="#84634b" roughness={1} />
      </mesh>

      {/* Copa com formas facetadas */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial
          color={cor}
          flatShading
          roughness={1}
        />
      </mesh>

      <mesh position={[0.3, 1.2, 0.12]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial
          color="#67a875"
          flatShading
          roughness={1}
        />
      </mesh>
    </group>
  )
}

function Arbusto({ position }: { position: Posicao }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color="#53895b"
          flatShading
          roughness={1}
        />
      </mesh>

      <mesh position={[0.32, 0.22, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#72a66a"
          flatShading
          roughness={1}
        />
      </mesh>
    </group>
  )
}

function Jardim({ position }: { position: Posicao }) {
  return (
    <group position={position}>
      {/* Borda do canteiro */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.12, 3.6]} />
        <meshStandardMaterial color="#a8b3a0" roughness={1} />
      </mesh>

      {/* Grama */}
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <boxGeometry args={[1.64, 0.04, 3.44]} />
        <meshStandardMaterial color="#a7c98b" roughness={1} />
      </mesh>

      <Arvore
        position={[0, 0.15, -0.65]}
        escala={0.9}
      />

      <Arbusto position={[-0.18, 0.15, 0.85]} />
    </group>
  )
}

export default function Vegetacao() {
  // Jardins nos espaços laterais entre os prédios.
  const jardins: Posicao[] = [
    [-12, 0, -4],
    [-4, 0, -4],
    [4, 0, -4],
    [12, 0, -4],
    [-12, 0, 4],
    [-4, 0, 4],
    [4, 0, 4],
    [12, 0, 4],
  ]

  // Árvores próximas aos limites externos do terreno.
  const arvoresExternas: Posicao[] = [
    [-15.5, 0, -10.5],
    [-10, 0, -11.5],
    [0, 0, -11.5],
    [10, 0, -11.5],
    [15.5, 0, -10.5],
    [-15.5, 0, 10.5],
    [-10, 0, 11.5],
    [0, 0, 11.5],
    [10, 0, 11.5],
    [15.5, 0, 10.5],
  ]

  return (
    <group>
      {jardins.map((posicao, indice) => (
        <Jardim
          key={`jardim-${indice}`}
          position={posicao}
        />
      ))}

      {arvoresExternas.map((posicao, indice) => (
        <Arvore
          key={`arvore-${indice}`}
          position={posicao}
          escala={indice % 2 === 0 ? 1.15 : 0.95}
          cor={indice % 2 === 0 ? '#438460' : '#609c65'}
        />
      ))}
    </group>
  )
}