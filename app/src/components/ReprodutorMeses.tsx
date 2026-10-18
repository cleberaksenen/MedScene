import { useEffect, useState } from 'react'

type ReprodutorMesesProps = {
  competencias: number[]
  competenciaAtiva: number | null
  onSelecionar: (competencia: number) => void
}

function nomeMes(competencia: number) {
  const data = new Date(
    Math.floor(competencia / 12),
    competencia % 12,
    1,
  )

  const nome = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
  }).format(data)

  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

export default function ReprodutorMeses({
  competencias,
  competenciaAtiva,
  onSelecionar,
}: ReprodutorMesesProps) {
  const [reproduzindo, setReproduzindo] = useState(false)

  const meses = [...new Set(competencias)].sort((a, b) => a - b)

  const indiceAtual = meses.findIndex(
    (competencia) => competencia === competenciaAtiva,
  )

  const proximoMes = meses[indiceAtual + 1]
  const ultimoMes = meses[meses.length - 1]

  useEffect(() => {
    if (!reproduzindo || proximoMes === undefined) return

    const temporizador = window.setTimeout(() => {
      onSelecionar(proximoMes)

      if (proximoMes === ultimoMes) {
        setReproduzindo(false)
      }
    }, 2000)

    return () => window.clearTimeout(temporizador)
  }, [reproduzindo, proximoMes, ultimoMes, onSelecionar])

  function selecionarMes(competencia: number) {
    setReproduzindo(false)
    onSelecionar(competencia)
  }

  function alternarReproducao() {
    if (reproduzindo) {
      setReproduzindo(false)
      return
    }

    const primeiroMes = meses[0]

    if (meses.length < 2 || primeiroMes === undefined) return

    if (
      indiceAtual < 0 ||
      competenciaAtiva === ultimoMes
    ) {
      onSelecionar(primeiroMes)
    }

    setReproduzindo(true)
  }

  return (
    <section
      aria-label="Competências disponíveis"
      style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Meses disponíveis
        </h3>

        <span
          style={{
            fontSize: 11,
            color: '#64748b',
          }}
        >
          {meses.length} meses
        </span>
      </div>

      {meses.length === 0 ? (
        <p style={{ fontSize: 12, color: '#64748b' }}>
          Nenhuma competência disponível.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8,
          }}
        >
          {meses.map((competencia) => {
            const selecionado = competencia === competenciaAtiva
            const ano = Math.floor(competencia / 12)

            return (
              <button
                key={competencia}
                type="button"
                aria-pressed={selecionado}
                aria-label={`Selecionar ${nomeMes(
                  competencia,
                )} de ${ano}`}
                onClick={() => selecionarMes(competencia)}
                style={{
                  position: 'relative',
                  minHeight: 70,
                  padding: '12px 14px',
                  border: `1px solid ${
                    selecionado ? '#2563eb' : '#e2e8f0'
                  }`,
                  borderRadius: 12,
                  background: selecionado ? '#2563eb' : '#f8fafc',
                  color: selecionado ? '#ffffff' : '#0f172a',
                  boxShadow: selecionado
                    ? '0 4px 12px #2563eb26'
                    : 'none',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition:
                    'background-color 180ms ease, color 180ms ease',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {nomeMes(competencia)}
                </span>

                <span
                  style={{
                    display: 'block',
                    marginTop: 5,
                    fontSize: 11,
                    color: selecionado ? '#dbeafe' : '#64748b',
                  }}
                >
                  {ano}
                </span>

                {selecionado && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: 10,
                      bottom: 10,
                      fontSize: 12,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {meses.length > 1 && (
        <button
          type="button"
          onClick={alternarReproducao}
          aria-pressed={reproduzindo}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '10px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            background: '#ffffff',
            color: '#334155',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {reproduzindo
            ? 'Pausar reprodução'
            : 'Reproduzir evolução mensal'}
        </button>
      )}
    </section>
  )
}