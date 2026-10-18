type CorRGB = [number, number, number]

type MarcoCor = {
  taxa: number
  cor: CorRGB
}

const escala: MarcoCor[] = [
  { taxa: 0.1, cor: [220, 38, 38] },
  { taxa: 0.3, cor: [234, 88, 12] },
  { taxa: 0.5, cor: [249, 115, 22] },
  { taxa: 0.7, cor: [96, 165, 250] },
  { taxa: 0.8, cor: [37, 99, 235] },
]

function converterParaCSS(cor: CorRGB) {
  return `rgb(${cor[0]}, ${cor[1]}, ${cor[2]})`
}

export function corPorConclusao(
  taxa: number | null | undefined,
): string {
  if (
    taxa === null ||
    taxa === undefined ||
    !Number.isFinite(taxa) ||
    taxa < 0 ||
    taxa > 1
  ) {
    return '#94a3b8'
  }

  const primeiro = escala[0]!
  const ultimo = escala[escala.length - 1]!

  if (taxa <= primeiro.taxa) {
    return converterParaCSS(primeiro.cor)
  }

  if (taxa >= ultimo.taxa) {
    return converterParaCSS(ultimo.cor)
  }

  for (let indice = 1; indice < escala.length; indice++) {
    const anterior = escala[indice - 1]!
    const atual = escala[indice]!

    if (taxa <= atual.taxa) {
      const proporcao =
        (taxa - anterior.taxa) / (atual.taxa - anterior.taxa)

      const cor: CorRGB = [
        Math.round(
          anterior.cor[0] +
            (atual.cor[0] - anterior.cor[0]) * proporcao,
        ),
        Math.round(
          anterior.cor[1] +
            (atual.cor[1] - anterior.cor[1]) * proporcao,
        ),
        Math.round(
          anterior.cor[2] +
            (atual.cor[2] - anterior.cor[2]) * proporcao,
        ),
      ]

      return converterParaCSS(cor)
    }
  }

  return converterParaCSS(ultimo.cor)
}