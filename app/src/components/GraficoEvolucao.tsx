import type { ResidenciaMensal } from '../services/carregarDados'

type GraficoEvolucaoProps = {
  registros: ResidenciaMensal[]
  idHospital: string
  competenciaAtiva: number | null
}

const formatoPercentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

function chaveMes(data: Date) {
  return data.getFullYear() * 12 + data.getMonth()
}

function nomeMes(competencia: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(
    new Date(
      Math.floor(competencia / 12),
      competencia % 12,
      1,
    ),
  )
}

export default function GraficoEvolucao({
  registros,
  idHospital,
  competenciaAtiva,
}: GraficoEvolucaoProps) {
  // Recebe o histórico completo, sem aplicar o filtro de mês.
  const competencias = registros.map((linha) =>
    chaveMes(linha.competencia),
  )

  if (competencias.length === 0) {
    return <p>Sem histórico disponível.</p>
  }

  const primeiroMes = Math.min(...competencias)
  const ultimoMes = Math.max(...competencias)

  const totaisPorMes = new Map<
    number,
    { residentes: number; capacitados: number }
  >()

  for (const linha of registros) {
    if (linha.id_hospital !== idHospital) continue

    const mes = chaveMes(linha.competencia)

    const total = totaisPorMes.get(mes) ?? {
      residentes: 0,
      capacitados: 0,
    }

    total.residentes += linha.residentes_cursando
    total.capacitados += linha.capacitacao_concluida

    totaisPorMes.set(mes, total)
  }

  // Inclui meses sem registros para não ligar lacunas no gráfico.
  const historico = Array.from(
    { length: ultimoMes - primeiroMes + 1 },
    (_, indice) => {
      const competencia = primeiroMes + indice
      const total = totaisPorMes.get(competencia)

      return {
        competencia,
        residentes: total?.residentes ?? null,
        capacitados: total?.capacitados ?? null,
        taxa:
          total && total.residentes > 0
            ? total.capacitados / total.residentes
            : null,
      }
    },
  )

  const largura = Math.max(290, historico.length * 44 + 48)
  const altura = 190
  const margemEsquerda = 40
  const margemDireita = 20
  const margemSuperior = 16
  const margemInferior = 38

  const larguraUtil = largura - margemEsquerda - margemDireita
  const alturaUtil = altura - margemSuperior - margemInferior

  function coordenadaX(indice: number) {
    if (historico.length === 1) {
      return margemEsquerda + larguraUtil / 2
    }

    return (
      margemEsquerda +
      (indice / (historico.length - 1)) * larguraUtil
    )
  }

  function coordenadaY(taxa: number) {
    return margemSuperior + (1 - taxa) * alturaUtil
  }

  let caminho = ''
  let segmentoAberto = false

  historico.forEach((ponto, indice) => {
    if (ponto.taxa === null) {
      segmentoAberto = false
      return
    }

    const comando = segmentoAberto ? 'L' : 'M'

    caminho +=
      `${comando} ${coordenadaX(indice)} ` +
      `${coordenadaY(ponto.taxa)} `

    segmentoAberto = true
  })

  const indiceAtivo = historico.findIndex(
    (ponto) => ponto.competencia === competenciaAtiva,
  )

  const possuiTaxas = historico.some(
    (ponto) => ponto.taxa !== null,
  )

  return (
    <section
      style={{
        marginTop: 24,
        paddingTop: 18,
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          color: '#0f172a',
        }}
      >
        Evolução das capacitações
      </h3>

      <p
        style={{
          margin: '6px 0 12px',
          fontSize: 12,
          lineHeight: 1.5,
          color: '#64748b',
        }}
      >
        Percentual dos residentes com capacitações concluídas,
        em cada mês.
      </p>

      {!possuiTaxas && (
        <p style={{ fontSize: 12, color: '#64748b' }}>
          Sem dados suficientes para calcular os percentuais.
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <svg
          width={largura}
          height={altura}
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label="Evolução mensal da conclusão das capacitações. Valores disponíveis na tabela abaixo."
          style={{
            display: 'block',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Escala fixa de 0% a 100% */}
          {[0, 0.25, 0.5, 0.75, 1].map((taxa) => (
            <g key={taxa}>
              <line
                x1={margemEsquerda}
                x2={largura - margemDireita}
                y1={coordenadaY(taxa)}
                y2={coordenadaY(taxa)}
                stroke="#e2e8f0"
                strokeDasharray="3 4"
              />

              <text
                x={margemEsquerda - 7}
                y={coordenadaY(taxa) + 4}
                textAnchor="end"
                fontSize={10}
                fill="#64748b"
              >
                {Math.round(taxa * 100)}%
              </text>
            </g>
          ))}

          {/* Destaque do mês escolhido */}
          {indiceAtivo >= 0 && (
            <line
              x1={coordenadaX(indiceAtivo)}
              x2={coordenadaX(indiceAtivo)}
              y1={margemSuperior}
              y2={altura - margemInferior}
              stroke="#93c5fd"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}

          <path
            d={caminho}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {historico.map((ponto, indice) => {
            const selecionado =
              ponto.competencia === competenciaAtiva

            return (
              <g key={ponto.competencia}>
                {ponto.taxa !== null && (
                  <circle
                    cx={coordenadaX(indice)}
                    cy={coordenadaY(ponto.taxa)}
                    r={selecionado ? 6 : 4}
                    fill={selecionado ? '#1e40af' : '#2563eb'}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    <title>
                      {nomeMes(ponto.competencia)}
                      {': '}
                      {formatoPercentual.format(ponto.taxa)}
                    </title>
                  </circle>
                )}

                <text
                  x={coordenadaX(indice)}
                  y={altura - 15}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={selecionado ? 700 : 400}
                  fill={selecionado ? '#1d4ed8' : '#64748b'}
                >
                  {nomeMes(ponto.competencia)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <details style={{ marginTop: 8, fontSize: 12 }}>
        <summary
          style={{
            cursor: 'pointer',
            color: '#2563eb',
          }}
        >
          Ver valores por mês
        </summary>

        <table
          style={{
            width: '100%',
            marginTop: 10,
            borderCollapse: 'collapse',
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ color: '#64748b' }}>
              <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                Mês
              </th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                Residentes
              </th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                Capacitados
              </th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                %
              </th>
            </tr>
          </thead>

          <tbody>
            {historico.map((ponto) => (
              <tr
                key={ponto.competencia}
                style={{
                  background:
                    ponto.competencia === competenciaAtiva
                      ? '#eff6ff'
                      : 'transparent',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <td style={{ padding: '8px 4px' }}>
                  {nomeMes(ponto.competencia)}
                </td>

                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  {ponto.residentes ?? '—'}
                </td>

                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  {ponto.capacitados ?? '—'}
                </td>

                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  {ponto.taxa === null
                    ? '—'
                    : formatoPercentual.format(ponto.taxa)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ color: '#64748b', lineHeight: 1.5 }}>
          — indica ausência de registros ou, no percentual,
          ausência de residentes para calcular a taxa.
        </p>
      </details>
    </section>
  )
}