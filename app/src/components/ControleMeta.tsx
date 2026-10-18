import { useId } from 'react'

type ControleMetaProps = {
  meta: number
  onAlterar: (meta: number) => void
}

const formatoPercentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const metasRapidas = [0.5, 0.7, 0.8, 0.9, 1]

export default function ControleMeta({
  meta,
  onAlterar,
}: ControleMetaProps) {
  const idControle = useId()

  const metaValida = Number.isFinite(meta)
    ? Math.max(0, Math.min(1, meta))
    : 0.8

  const percentualMeta = Math.round(metaValida * 100)

  return (
    <section
      aria-label="Configuração da meta"
      style={{
        marginTop: 18,
        paddingTop: 16,
        borderTop: '1px solid #e2e8f0',
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
        <label
          htmlFor={idControle}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Meta de capacitação
        </label>

        <output
          htmlFor={idControle}
          style={{
            padding: '5px 9px',
            borderRadius: 8,
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: 14,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {percentualMeta}%
        </output>
      </div>

      <input
        id={idControle}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percentualMeta}
        onChange={(event) =>
          onAlterar(Number(event.target.value) / 100)
        }
        aria-valuetext={`${percentualMeta}%`}
        aria-describedby={`${idControle}-descricao`}
        style={{
          display: 'block',
          width: '100%',
          margin: '16px 0 0',
          accentColor: '#2563eb',
          cursor: 'pointer',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontSize: 10,
          color: '#64748b',
        }}
      >
        <span>0%</span>
        <span>100%</span>
      </div>

      <div
        role="group"
        aria-label="Metas sugeridas"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 12,
        }}
      >
        {metasRapidas.map((valor) => {
          const selecionada =
            percentualMeta === Math.round(valor * 100)

          return (
            <button
              key={valor}
              type="button"
              aria-pressed={selecionada}
              onClick={() => onAlterar(valor)}
              style={{
                flex: '1 1 38px',
                padding: '7px 4px',
                border: `1px solid ${
                  selecionada ? '#2563eb' : '#e2e8f0'
                }`,
                borderRadius: 8,
                background: selecionada ? '#2563eb' : '#ffffff',
                color: selecionada ? '#ffffff' : '#475569',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: selecionada ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {formatoPercentual.format(valor)}
            </button>
          )
        })}
      </div>

      <p
        id={`${idControle}-descricao`}
        style={{
          margin: '12px 0 0',
          fontSize: 11,
          lineHeight: 1.5,
          color: '#64748b',
        }}
      >
        Meta comum a todos os hospitais. Ajuste para simular
        quantos residentes precisam concluir a capacitação.
      </p>
    </section>
  )
}