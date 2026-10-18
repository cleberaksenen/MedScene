import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'

import Hospital from './components/Hospital'
import Ambulancias from './components/Ambulancias'
import Vegetacao from './components/Vegetacao'
import Calcadas from './components/Calcadas'
import Medicos from './components/Medicos'
import AnelProgresso from './components/AnelProgresso'
import IndicadorHospital from './components/IndicadorHospital'
import CameraMedScene from './components/CameraMedScene'
import GraficoEvolucao from './components/GraficoEvolucao'
import ReprodutorMeses from './components/ReprodutorMeses'
import MetaCapacitacao from './components/MetaCapacitacao'
import ControleMeta from './components/ControleMeta'
import EstradaComplementar from './components/EstradaComplementar'

import { carregarDados } from './services/carregarDados'
import type { DadosMedScene } from './services/carregarDados'
import { corPorConclusao } from './utils/coresIndicadores'

type Posicao = [number, number, number]

type TotaisHospital = {
  vagas: number
  residentes: number
  capacitados: number
}

type Indicador = {
  titulo: string
  valor: string
  cor?: string
}

const formatoNumero = new Intl.NumberFormat('pt-BR')

const formatoPercentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const pontosLegenda = [0, 0.1, 0.3, 0.5, 0.7, 0.8, 1]

const gradienteConclusao = `linear-gradient(to right, ${pontosLegenda
  .map((taxa) => `${corPorConclusao(taxa)} ${taxa * 100}%`)
  .join(', ')})`

function percentual(numerador: number, denominador: number) {
  return denominador > 0
    ? formatoPercentual.format(numerador / denominador)
    : 'Sem dados'
}

function chaveCompetencia(data: Date) {
  return data.getFullYear() * 12 + data.getMonth()
}

function formatarCompetencia(competencia: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(
    new Date(
      Math.floor(competencia / 12),
      competencia % 12,
      1,
    ),
  )
}

function posicaoHospital(indice: number): Posicao {
  const coluna = indice % 3
  const fileira = Math.floor(indice / 3)

  return [(coluna - 1) * 8, 0, fileira * 8 - 4]
}

function validarDados(dados: DadosMedScene) {
  const idsHospitais = new Set<string>()

  for (const hospital of dados.hospitais) {
    if (
      typeof hospital.id_hospital !== 'string' ||
      !hospital.id_hospital.trim() ||
      typeof hospital.nome_hospital !== 'string' ||
      !hospital.nome_hospital.trim()
    ) {
      throw new Error('Há um hospital sem código ou nome válido.')
    }

    if (idsHospitais.has(hospital.id_hospital)) {
      throw new Error(
        `Código de hospital duplicado: ${hospital.id_hospital}`,
      )
    }

    idsHospitais.add(hospital.id_hospital)
  }

  const chavesMensais = new Set<string>()

  for (const linha of dados.residencia) {
    const quantidades = [
      linha.vagas_totais,
      linha.residentes_cursando,
      linha.capacitacao_concluida,
    ]

    if (
      !(linha.competencia instanceof Date) ||
      Number.isNaN(linha.competencia.getTime()) ||
      !quantidades.every(
        (valor) => Number.isInteger(valor) && valor >= 0,
      ) ||
      linha.capacitacao_concluida > linha.residentes_cursando ||
      linha.residentes_cursando > linha.vagas_totais
    ) {
      throw new Error(
        'A planilha contém datas ou quantidades inválidas.',
      )
    }

    if (!idsHospitais.has(linha.id_hospital)) {
      throw new Error(
        `Hospital não cadastrado: ${linha.id_hospital}`,
      )
    }

    if (
      typeof linha.id_programa !== 'string' ||
      !linha.id_programa.trim() ||
      typeof linha.nome_programa !== 'string' ||
      !linha.nome_programa.trim()
    ) {
      throw new Error('Há um programa sem código ou nome válido.')
    }

    const chave = [
      chaveCompetencia(linha.competencia),
      linha.id_hospital,
      linha.id_programa,
    ].join('|')

    if (chavesMensais.has(chave)) {
      throw new Error(
        'Há registros repetidos para o mesmo mês, hospital e programa.',
      )
    }

    chavesMensais.add(chave)
  }
}

const estiloPainel: CSSProperties = {
  position: 'absolute',
  top: 24,
  maxWidth: 'calc(100vw - 48px)',
  maxHeight: 'calc(100dvh - 48px)',
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: 22,
  background: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 8px 30px #0f172a18',
  textAlign: 'left',
}

const estiloSelect: CSSProperties = {
  width: '100%',
  padding: 10,
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 13,
}

const estiloLabel: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
}

const estiloBotao: CSSProperties = {
  padding: '10px 14px',
  border: 'none',
  borderRadius: 8,
  background: '#2563eb',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: 13,
}

function App() {
  const [hospitalSelecionado, setHospitalSelecionado] = useState<
    string | null
  >(null)

  const [competenciaSelecionada, setCompetenciaSelecionada] =
    useState<number | null>(null)

  const [dados, setDados] = useState<DadosMedScene | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Meta compartilhada por todos os hospitais.
  const [metaCapacitacao, setMetaCapacitacao] = useState(0.8)

  // Pausa a reprodução ao selecionar um mês manualmente.
  const [versaoReprodutor, setVersaoReprodutor] = useState(0)

  useEffect(() => {
    let ativo = true

    async function iniciar() {
      try {
        const resultado = await carregarDados()
        validarDados(resultado)

        if (ativo) setDados(resultado)
      } catch (falha) {
        if (ativo) {
          setErro(
            falha instanceof Error
              ? falha.message
              : 'Ocorreu um erro ao carregar os dados.',
          )
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    iniciar()

    return () => {
      ativo = false
    }
  }, [])

  const competenciasDisponiveis = dados
    ? Array.from(
        new Set(
          dados.residencia.map((linha) =>
            chaveCompetencia(linha.competencia),
          ),
        ),
      ).sort((a, b) => b - a)
    : []

  const ultimaCompetencia = competenciasDisponiveis[0] ?? null

  const competenciaAtiva =
    competenciaSelecionada !== null &&
    competenciasDisponiveis.includes(competenciaSelecionada)
      ? competenciaSelecionada
      : ultimaCompetencia

  const competenciaTexto =
    competenciaAtiva !== null
      ? formatarCompetencia(competenciaAtiva)
      : ''

  // Toda a cena usa o mesmo recorte mensal.
  const registrosDoMes =
    dados?.residencia.filter(
      (linha) =>
        chaveCompetencia(linha.competencia) === competenciaAtiva,
    ) ?? []

  const totaisPorHospital = new Map<string, TotaisHospital>()

  for (const linha of registrosDoMes) {
    const total = totaisPorHospital.get(linha.id_hospital) ?? {
      vagas: 0,
      residentes: 0,
      capacitados: 0,
    }

    total.vagas += linha.vagas_totais
    total.residentes += linha.residentes_cursando
    total.capacitados += linha.capacitacao_concluida

    totaisPorHospital.set(linha.id_hospital, total)
  }

  const unidades =
    dados?.hospitais.map((hospital, indice) => {
      const total = totaisPorHospital.get(hospital.id_hospital)

      return {
        ...hospital,
        position: posicaoHospital(indice),
        total,
        taxaConclusao:
          total && total.residentes > 0
            ? total.capacitados / total.residentes
            : null,
      }
    }) ?? []

  const hospital = unidades.find(
    (unidade) => unidade.id_hospital === hospitalSelecionado,
  )

  const focoCamera: Posicao | null = hospital?.position ?? null

  const hospitaisMedicos = unidades.map((unidade) => ({
    id: unidade.id_hospital,
    position: unidade.position,
    residentes: unidade.total?.residentes ?? null,
  }))

  const registrosHospital = registrosDoMes.filter(
    (linha) => linha.id_hospital === hospitalSelecionado,
  )

  const totalSelecionado = hospital?.total

  const corConclusaoSelecionada = corPorConclusao(
    hospital?.taxaConclusao,
  )

  const indicadores: Indicador[] = totalSelecionado
    ? [
        {
          titulo: 'Residentes cursando',
          valor: formatoNumero.format(totalSelecionado.residentes),
        },
        {
          titulo: 'Vagas totais',
          valor: formatoNumero.format(totalSelecionado.vagas),
        },
        {
          titulo: 'Ocupação das vagas',
          valor: percentual(
            totalSelecionado.residentes,
            totalSelecionado.vagas,
          ),
        },
        {
          titulo: 'Capacitações concluídas',
          valor: formatoNumero.format(totalSelecionado.capacitados),
        },
        {
          titulo: 'Conclusão das capacitações',
          valor: percentual(
            totalSelecionado.capacitados,
            totalSelecionado.residentes,
          ),
          cor: corConclusaoSelecionada,
        },
      ]
    : []

  function selecionarMesManualmente(valor: string) {
    setVersaoReprodutor((anterior) => anterior + 1)
    setCompetenciaSelecionada(Number(valor))
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#edf2f7',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',
      }}
    >
      {/* Painel de navegação */}
      <div
        style={{
          ...estiloPainel,
          left: 24,
          zIndex: 10,
          width: 300,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          MedScene
        </div>

        <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
          Rede de ensino médico · Dados fictícios
        </div>

        <div style={{ marginTop: 14, fontSize: 12 }}>
          Arraste para girar · Role para aproximar
        </div>

        <div
          role="status"
          style={{
            marginTop: 8,
            fontSize: 12,
            color: erro ? '#b91c1c' : '#2563eb',
          }}
        >
          {carregando
            ? 'Carregando planilha...'
            : erro
              ? erro
              : `${unidades.length} hospitais · ${competenciaTexto}`}
        </div>

        {dados && (
          <>
            <div style={{ marginTop: 18 }}>
              <label htmlFor="competencia" style={estiloLabel}>
                Competência
              </label>

              <select
                id="competencia"
                value={competenciaAtiva ?? ''}
                onChange={(event) =>
                  selecionarMesManualmente(event.target.value)
                }
                disabled={competenciasDisponiveis.length === 0}
                style={estiloSelect}
              >
                {competenciasDisponiveis.map((competencia) => (
                  <option key={competencia} value={competencia}>
                    {formatarCompetencia(competencia)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 16 }}>
              <label htmlFor="hospital" style={estiloLabel}>
                Hospital
              </label>

              <select
                id="hospital"
                value={hospitalSelecionado ?? ''}
                onChange={(event) =>
                  setHospitalSelecionado(event.target.value || null)
                }
                style={estiloSelect}
              >
                <option value="">Visão geral</option>

                {dados.hospitais.map((unidade) => (
                  <option
                    key={unidade.id_hospital}
                    value={unidade.id_hospital}
                  >
                    {unidade.nome_hospital}
                  </option>
                ))}
              </select>
            </div>

            {hospitalSelecionado && (
              <button
                type="button"
                onClick={() => setHospitalSelecionado(null)}
                style={{
                  ...estiloBotao,
                  width: '100%',
                  marginTop: 12,
                }}
              >
                Voltar à visão geral
              </button>
            )}

            <ReprodutorMeses
              key={versaoReprodutor}
              competencias={competenciasDisponiveis}
              competenciaAtiva={competenciaAtiva}
              onSelecionar={setCompetenciaSelecionada}
            />

            <ControleMeta
              meta={metaCapacitacao}
              onAlterar={setMetaCapacitacao}
            />
          </>
        )}

        {/* Legenda das cores */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            Conclusão das capacitações
          </div>

          <div
            style={{
              marginTop: 10,
              height: 10,
              borderRadius: 5,
              background: gradienteConclusao,
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 5,
              fontSize: 11,
              color: '#64748b',
            }}
          >
            <span>0%</span>
            <span>100%</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 12px',
              marginTop: 12,
              fontSize: 11,
              color: '#475569',
            }}
          >
            {[
              { taxa: 0.1, texto: 'Até 10%: vermelho' },
              { taxa: 0.5, texto: '50%: laranja' },
              { taxa: 0.7, texto: '70%: azul-claro' },
              { taxa: 0.8, texto: '80% ou mais: azul' },
            ].map((item) => (
              <div
                key={item.taxa}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: corPorConclusao(item.taxa),
                  }}
                />
                <span>{item.texto}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              lineHeight: 1.5,
              color: '#64748b',
            }}
          >
            As cores variam gradualmente entre essas referências.
            Telhado, percentual, barra e arco usam a mesma escala.
            O preenchimento do anel mostra a proporção concluída.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              fontSize: 11,
              color: '#475569',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 3,
                height: 14,
                flexShrink: 0,
                borderRadius: 2,
                background: '#0f172a',
              }}
            />
            Traço no anel: meta de{' '}
            {formatoPercentual.format(metaCapacitacao)}.
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              lineHeight: 1.5,
              color: '#64748b',
            }}
          >
            A escala de cores representa o percentual concluído
            e permanece fixa ao ajustar a meta.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              fontSize: 11,
              color: '#64748b',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                flexShrink: 0,
                borderRadius: '50%',
                background: corPorConclusao(null),
              }}
            />
            Cinza indica taxa indisponível.
          </div>
        </div>

        {/* Legenda dos médicos */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
            fontSize: 12,
            lineHeight: 1.7,
            color: '#475569',
          }}
        >
          <div
            style={{
              marginBottom: 6,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Médicos parados por hospital
          </div>

          <div>1 a 50 residentes: 1 boneco</div>
          <div>51 a 100 residentes: 2 bonecos</div>
          <div>Acima de 100 residentes: 3 bonecos</div>
          <div>Zero ou sem dados: nenhum boneco</div>

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: '#64748b',
            }}
          >
            Pessoas caminhando e veículos são ilustrativos.
          </div>
        </div>
      </div>

      {/* Cena 3D */}
      <Canvas
        shadows
        camera={{ position: [24, 22, 28], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#edf2f7']} />

        <ambientLight intensity={0.9} />

        <directionalLight
          position={[10, 20, 12]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          shadow-camera-far={80}
          shadow-normalBias={0.03}
        />

        {/* Terreno */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, 0]}
          receiveShadow
        >
          <planeGeometry args={[38, 28]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>

        {/* Via central */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[34, 2.8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        {/* Faixas centrais */}
        {[-14, -10, -6, -2, 2, 6, 10, 14].map((x) => (
          <mesh
            key={`faixa-${x}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.01, 0]}
          >
            <planeGeometry args={[1.8, 0.08]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}

        <Calcadas />
        <EstradaComplementar />
        <Vegetacao />

        {/* Hospitais e indicadores */}
        {unidades.map((unidade) => {
          const selecionado =
            hospitalSelecionado === unidade.id_hospital

          const rotacaoPredio =
            unidade.position[2] > 0 ? Math.PI : 0

          return (
            <group
              key={unidade.id_hospital}
              position={unidade.position}
            >
              <group rotation={[0, rotacaoPredio, 0]}>
                <Hospital
                  taxaConclusao={unidade.taxaConclusao}
                  onSelect={() =>
                    setHospitalSelecionado(unidade.id_hospital)
                  }
                />
              </group>

              {/* Base com destaque de seleção */}
              <mesh position={[0, 0.04, 0]} receiveShadow>
                <boxGeometry args={[5.2, 0.08, 4.2]} />
                <meshStandardMaterial
                  color={selecionado ? '#bfdbfe' : '#e2e8f0'}
                />
              </mesh>

              {/* Anel de progresso e marca da meta */}
              <group
                scale={[1.1, 1, 0.82]}
                rotation={[0, rotacaoPredio, 0]}
              >
                <AnelProgresso
                  taxa={unidade.taxaConclusao}
                  meta={metaCapacitacao}
                />
              </group>

              <IndicadorHospital
                nome={unidade.nome_hospital}
                residentes={unidade.total?.residentes ?? null}
                taxaConclusao={unidade.taxaConclusao}
                selecionado={selecionado}
                position={[0, 5.2, 0]}
                onSelect={() =>
                  setHospitalSelecionado(unidade.id_hospital)
                }
              />
            </group>
          )
        })}

        <Medicos hospitais={hospitaisMedicos} />
        <Ambulancias />
        <CameraMedScene foco={focoCamera} />
      </Canvas>

      {/* Painel do hospital */}
      {hospital && dados && (
        <aside
          aria-label="Detalhes do hospital"
          style={{
            ...estiloPainel,
            right: 24,
            zIndex: 20,
            width: 360,
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
            <span style={{ fontSize: 11, color: '#64748b' }}>
              UNIDADE · {hospital.id_hospital}
            </span>

            <button
              type="button"
              onClick={() => setHospitalSelecionado(null)}
              style={{
                ...estiloBotao,
                padding: '7px 10px',
                background: '#f1f5f9',
                color: '#334155',
                fontSize: 12,
              }}
            >
              Fechar
            </button>
          </div>

          <h2 style={{ margin: '14px 0 8px', fontSize: 22 }}>
            {hospital.nome_hospital}
          </h2>

          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            {hospital.cidade} · {hospital.uf}
          </p>

          <p style={{ fontSize: 13, color: '#2563eb' }}>
            Competência: {competenciaTexto}
          </p>

          {/* Atualizado pelo mês, hospital e meta selecionados */}
          <MetaCapacitacao
            residentes={totalSelecionado?.residentes ?? null}
            capacitados={totalSelecionado?.capacitados ?? null}
            meta={metaCapacitacao}
          />

          {totalSelecionado ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  marginTop: 16,
                }}
              >
                {indicadores.map((indicador) => (
                  <div
                    key={indicador.titulo}
                    style={{
                      padding: '12px 16px',
                      background: '#f1f5f9',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {indicador.titulo}
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 24,
                        fontWeight: 700,
                        color: indicador.cor ?? '#0f172a',
                        transition: 'color 400ms ease',
                      }}
                    >
                      {indicador.valor}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: 22, fontSize: 15 }}>
                Programas
              </h3>

              {registrosHospital.map((registro) => (
                <div
                  key={registro.id_programa}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                >
                  <span>{registro.nome_programa}</span>

                  <strong style={{ whiteSpace: 'nowrap' }}>
                    {registro.residentes_cursando} residentes
                  </strong>
                </div>
              ))}
            </>
          ) : (
            <p>Sem registros para esta unidade nessa competência.</p>
          )}

          {/* Histórico completo, inclusive quando o mês não tem dados */}
          <GraficoEvolucao
            registros={dados.residencia}
            idHospital={hospital.id_hospital}
            competenciaAtiva={competenciaAtiva}
          />
        </aside>
      )}
    </div>
  )
}

export default App