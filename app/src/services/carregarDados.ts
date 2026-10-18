import * as XLSX from 'xlsx'

export type HospitalDados = {
  id_hospital: string
  nome_hospital: string
  cidade: string
  uf: string
}

export type ResidenciaMensal = {
  competencia: Date
  id_hospital: string
  id_programa: string
  nome_programa: string
  vagas_totais: number
  residentes_cursando: number
  capacitacao_concluida: number
}

export type DadosMedScene = {
  hospitais: HospitalDados[]
  residencia: ResidenciaMensal[]
}

export async function carregarDados(): Promise<DadosMedScene> {
  const resposta = await fetch(
    `${import.meta.env.BASE_URL}dados/medscene_base_ficticia.xlsx`,
    { cache: 'no-store' },
  )

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível carregar a planilha. Código: ${resposta.status}`,
    )
  }

  const arquivo = await resposta.arrayBuffer()

  const planilha = XLSX.read(arquivo, {
    type: 'array',
    cellDates: true,
  })

  const abaHospitais = planilha.Sheets['Hospitais']
  const abaResidencia = planilha.Sheets['Residencia_Mensal']

  if (!abaHospitais || !abaResidencia) {
    throw new Error(
      'A planilha precisa conter as abas Hospitais e Residencia_Mensal.',
    )
  }

  const hospitais = XLSX.utils.sheet_to_json<HospitalDados>(
    abaHospitais,
  )

  const residencia = XLSX.utils.sheet_to_json<ResidenciaMensal>(
    abaResidencia,
  )

  if (hospitais.length === 0 || residencia.length === 0) {
    throw new Error('Uma das abas da planilha está vazia.')
  }

  return { hospitais, residencia }
}