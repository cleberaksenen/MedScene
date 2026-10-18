import { useId, useState } from 'react'
import { Html } from '@react-three/drei'
import { corPorConclusao } from '../utils/coresIndicadores'

type IndicadorHospitalProps = {
  nome: string
  residentes: number | null
  taxaConclusao: number | null
  selecionado?: boolean
  position?: [number, number, number]
  onSelect?: () => void
}

export default function IndicadorHospital({
  nome,
  residentes,
  taxaConclusao,
  selecionado = false,
  position = [0, 4.8, 0],
  onSelect,
}: IndicadorHospitalProps) {
  const [expandido, setExpandido] = useState(false)
  const idDetalhes = useId()

  const possuiResidentes =
    residentes !== null &&
    Number.isInteger(residentes) &&
    residentes >= 0

  const possuiTaxa =
    taxaConclusao !== null &&
    Number.isFinite(taxaConclusao) &&
    taxaConclusao >= 0 &&
    taxaConclusao <= 1

  const progresso = possuiTaxa ? taxaConclusao : 0
  const corIndicador = corPorConclusao(taxaConclusao)

  const percentualFormatado = possuiTaxa
    ? taxaConclusao.toLocaleString('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : 'Sem dados'

  return (
    <Html
      position={position}
      center
      zIndexRange={[5, 0]}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        style={{
          width: 180,
          boxSizing: 'border-box',
          background: selecionado ? '#eff6ff' : '#ffffff',
          border: `1px solid ${
            selecionado ? '#2563eb' : '#e2e8f0'
          }`,
          borderRadius: 12,
          boxShadow: '0 4px 14px #0f172a14',
          fontFamily: 'Arial, sans-serif',
          color: '#0f172a',
          textAlign: 'left',
        }}
      >
        {/* Cabeçalho sempre visível */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 9px',
          }}
        >
          <button
            type="button"
            onClick={() => onSelect?.()}
            aria-label={`Selecionar ${nome}`}
            aria-pressed={selecionado}
            style={{
              flex: 1,
              minWidth: 0,
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: '#0f172a',
              fontFamily: 'inherit',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.35,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {nome}
          </button>

          <button
            type="button"
            onClick={() => setExpandido((atual) => !atual)}
            aria-expanded={expandido}
            aria-controls={idDetalhes}
            aria-label={`${
              expandido ? 'Ocultar' : 'Mostrar'
            } indicadores de ${nome}`}
            title={expandido ? 'Ocultar indicadores' : 'Mostrar indicadores'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: 26,
              height: 26,
              padding: 0,
              border: 'none',
              borderRadius: 7,
              background: expandido ? '#2563eb' : '#f1f5f9',
              color: expandido ? '#ffffff' : '#475569',
              fontFamily: 'inherit',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span aria-hidden="true">
              {expandido ? '−' : '+'}
            </span>
          </button>
        </div>

        {/* Indicadores exibidos ao expandir */}
        <div
          id={idDetalhes}
          hidden={!expandido}
          style={{
            padding: '10px 12px 12px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#64748b',
            }}
          >
            {possuiResidentes
              ? `${residentes.toLocaleString('pt-BR')} residentes`
              : 'Residentes: sem dados'}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: '#64748b',
              }}
            >
              Capacitação
            </span>

            <strong
              style={{
                fontSize: possuiTaxa ? 16 : 11,
                color: corIndicador,
                transition: 'color 400ms ease',
              }}
            >
              {percentualFormatado}
            </strong>
          </div>

          <div
            aria-hidden="true"
            style={{
              marginTop: 7,
              height: 5,
              width: '100%',
              background: '#e2e8f0',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progresso * 100}%`,
                background: corIndicador,
                borderRadius: 999,
                transition:
                  'width 400ms ease, background-color 400ms ease',
              }}
            />
          </div>
        </div>
      </div>
    </Html>
  )
}