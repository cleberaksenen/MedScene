import { corPorConclusao } from '../utils/coresIndicadores'

type MetaCapacitacaoProps = {
  residentes: number | null
  capacitados: number | null
  meta?: number
}

const formatoNumero = new Intl.NumberFormat('pt-BR')

const formatoPercentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export default function MetaCapacitacao({
  residentes,
  capacitados,
  meta = 0.8,
}: MetaCapacitacaoProps) {
  const metaValida = Number.isFinite(meta)
    ? Math.max(0, Math.min(1, meta))
    : 0.8

  const possuiDados =
    residentes !== null &&
    capacitados !== null &&
    Number.isInteger(residentes) &&
    Number.isInteger(capacitados) &&
    residentes > 0 &&
    capacitados >= 0 &&
    capacitados <= residentes

  const taxa = possuiDados ? capacitados / residentes : null

  // Arredonda para cima porque a meta precisa ser atingida
  // com um número inteiro de residentes.
  // A tolerância evita arredondamento extra por precisão decimal.
  const quantidadeMeta = possuiDados
    ? Math.ceil(residentes * metaValida - 1e-9)
    : null

  const faltam =
    quantidadeMeta !== null && capacitados !== null
      ? Math.max(0, quantidadeMeta - capacitados)
      : null

  const metaAtingida = faltam === 0
  const corAtual = corPorConclusao(taxa)

  return (
    <section
      aria-label="Meta de capacitação"
      style={{
        marginTop: 20,
        padding: 16,
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        background: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            color: '#0f172a',
          }}
        >
          Meta de capacitação
        </h3>

        <span
          style={{
            padding: '5px 9px',
            borderRadius: 8,
            background: '#f1f5f9',
            color: '#334155',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {formatoPercentual.format(metaValida)}
        </span>
      </div>

      {possuiDados && taxa !== null && faltam !== null ? (
        <>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <strong
              style={{
                fontSize: 28,
                color: corAtual,
                transition: 'color 400ms ease',
              }}
            >
              {formatoPercentual.format(taxa)}
            </strong>

            <span style={{ fontSize: 12, color: '#64748b' }}>
              concluído
            </span>
          </div>

          {/* Barra de 0 a 100%, com marca na posição da meta */}
          <div
            role="progressbar"
            aria-label="Conclusão das capacitações"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number((taxa * 100).toFixed(1))}
            aria-valuetext={`${formatoPercentual.format(
              taxa,
            )} concluído; meta de ${formatoPercentual.format(
              metaValida,
            )}`}
            style={{
              position: 'relative',
              marginTop: 14,
              height: 10,
              borderRadius: 999,
              background: '#e2e8f0',
            }}
          >
            <div
              style={{
                width: `${taxa * 100}%`,
                height: '100%',
                borderRadius: 999,
                background: corAtual,
                transition:
                  'width 400ms ease, background-color 400ms ease',
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: `${metaValida * 100}%`,
                top: -4,
                width: 3,
                height: 18,
                borderRadius: 2,
                background: '#0f172a',
                boxShadow: '0 0 0 2px #ffffff',
                transform: 'translateX(-50%)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 10,
              color: '#64748b',
            }}
          >
            <span>0%</span>
            <span>Traço = meta</span>
            <span>100%</span>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              borderRadius: 10,
              background: metaAtingida ? '#eff6ff' : '#f8fafc',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: metaAtingida ? '#1d4ed8' : '#0f172a',
              }}
            >
              {metaAtingida
                ? 'Meta atingida!'
                : `Falta${faltam === 1 ? '' : 'm'} ${formatoNumero.format(
                    faltam,
                  )} residente${faltam === 1 ? '' : 's'}`}
            </div>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: 12,
                lineHeight: 1.5,
                color: '#64748b',
              }}
            >
              {metaAtingida
                ? 'A unidade alcançou a meta nesta competência.'
                : 'Para atingir a meta, considerando o total atual de residentes cursando.'}
            </p>
          </div>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 11,
              lineHeight: 1.5,
              color: '#64748b',
            }}
          >
            Concluíram: {formatoNumero.format(capacitados)} de{' '}
            {formatoNumero.format(residentes)} residentes.
            <br />
            Necessários para a meta:{' '}
            {formatoNumero.format(quantidadeMeta!)}.
          </p>
        </>
      ) : (
        <p
          style={{
            margin: '14px 0 0',
            fontSize: 12,
            lineHeight: 1.5,
            color: '#64748b',
          }}
        >
          Sem dados suficientes para calcular o alcance da meta
          nesta competência.
        </p>
      )}
    </section>
  )
}