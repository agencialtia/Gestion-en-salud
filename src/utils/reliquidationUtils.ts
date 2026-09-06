export interface ReliquidationTranche {
  id?: string;
  minCompliance: number; // Porcentaje mínimo para el tramo (ej. 56)
  maxCompliance?: number | null; // Porcentaje máximo (ej. 55.9, o null para '56% o más')
  discountPercentage: number; // Porcentaje de descuento de recursos (ej. 0, 50, 75, 100)
  label: string; // ej. "56% o más", "43% - 55,9%", "30% - 42,9%", "Menos del 30%"
  description?: string;
}

export interface ProgramCutConfig {
  programId: string;
  cutKey: 'corte1' | 'corte2' | 'corte3';
  cutName: string; // "1° Corte", "2° Corte", "3° Corte"
  cutoffDate: string; // "2026-07-31"
  quotaEvaluated: string; // "2° Cuota del 30%"
  quotaPercentage: number; // 30
  targetCompliance: number; // Meta mínima para 0% reliquidación (ej. 56%)
  tranches: ReliquidationTranche[];
}

export const DEFAULT_PROGRAM_CUT_CONFIGS: Record<string, Record<'corte1' | 'corte2' | 'corte3', ProgramCutConfig>> = {
  praps_cpu: {
    corte1: {
      programId: 'praps_cpu',
      cutKey: 'corte1',
      cutName: '1° Corte',
      cutoffDate: '2026-07-31',
      quotaEvaluated: '2° Cuota del 30%',
      quotaPercentage: 30,
      targetCompliance: 56,
      tranches: [
        {
          id: 't1',
          minCompliance: 56,
          maxCompliance: null,
          discountPercentage: 0,
          label: '56% o más',
          description: 'Sin reliquidación (Cumple meta establecida)',
        },
        {
          id: 't2',
          minCompliance: 43,
          maxCompliance: 55.9,
          discountPercentage: 50,
          label: '43% - 55,9%',
          description: 'Descuento del 50% de la 2° cuota (30%)',
        },
        {
          id: 't3',
          minCompliance: 30,
          maxCompliance: 42.9,
          discountPercentage: 75,
          label: '30% - 42,9%',
          description: 'Descuento del 75% de la 2° cuota (30%)',
        },
        {
          id: 't4',
          minCompliance: 0,
          maxCompliance: 29.99,
          discountPercentage: 100,
          label: 'Menos del 30%',
          description: 'Descuento del 100% de la 2° cuota (30%)',
        },
      ],
    },
    corte2: {
      programId: 'praps_cpu',
      cutKey: 'corte2',
      cutName: '2° Corte',
      cutoffDate: '2026-11-30',
      quotaEvaluated: '3° Cuota / Saldo Final del 10%',
      quotaPercentage: 10,
      targetCompliance: 85,
      tranches: [
        {
          id: 't2_1',
          minCompliance: 85,
          maxCompliance: null,
          discountPercentage: 0,
          label: '85% o más',
          description: 'Sin reliquidación (Cumple meta anual)',
        },
        {
          id: 't2_2',
          minCompliance: 70,
          maxCompliance: 84.9,
          discountPercentage: 50,
          label: '70% - 84,9%',
          description: 'Descuento del 50% de la cuota final',
        },
        {
          id: 't2_3',
          minCompliance: 50,
          maxCompliance: 69.9,
          discountPercentage: 75,
          label: '50% - 69,9%',
          description: 'Descuento del 75% de la cuota final',
        },
        {
          id: 't2_4',
          minCompliance: 0,
          maxCompliance: 49.99,
          discountPercentage: 100,
          label: 'Menos del 50%',
          description: 'Descuento del 100% de la cuota final',
        },
      ],
    },
    corte3: {
      programId: 'praps_cpu',
      cutKey: 'corte3',
      cutName: '3° Corte',
      cutoffDate: '2026-12-31',
      quotaEvaluated: 'Cierre Anual / Reliquidación Final',
      quotaPercentage: 10,
      targetCompliance: 90,
      tranches: [
        {
          id: 't3_1',
          minCompliance: 90,
          maxCompliance: null,
          discountPercentage: 0,
          label: '90% o más',
          description: 'Sin reliquidación final',
        },
        {
          id: 't3_2',
          minCompliance: 75,
          maxCompliance: 89.9,
          discountPercentage: 50,
          label: '75% - 89,9%',
          description: 'Reliquidación parcial del 50%',
        },
        {
          id: 't3_3',
          minCompliance: 0,
          maxCompliance: 74.99,
          discountPercentage: 100,
          label: 'Menos del 75%',
          description: 'Reliquidación total del saldo',
        },
      ],
    },
  },

  praps_rehab: {
    corte1: {
      programId: 'praps_rehab',
      cutKey: 'corte1',
      cutName: '1° Corte',
      cutoffDate: '2026-07-31',
      quotaEvaluated: '2° Cuota del 30%',
      quotaPercentage: 30,
      targetCompliance: 50,
      tranches: [
        {
          id: 'tr_1',
          minCompliance: 50,
          maxCompliance: null,
          discountPercentage: 0,
          label: '50% o más',
          description: 'Sin reliquidación (Cumple meta)',
        },
        {
          id: 'tr_2',
          minCompliance: 40,
          maxCompliance: 49.9,
          discountPercentage: 50,
          label: '40% - 49,9%',
          description: 'Descuento 50% de 2° cuota',
        },
        {
          id: 'tr_3',
          minCompliance: 25,
          maxCompliance: 39.9,
          discountPercentage: 75,
          label: '25% - 39,9%',
          description: 'Descuento 75% de 2° cuota',
        },
        {
          id: 'tr_4',
          minCompliance: 0,
          maxCompliance: 24.99,
          discountPercentage: 100,
          label: 'Menos del 25%',
          description: 'Descuento 100% de 2° cuota',
        },
      ],
    },
    corte2: {
      programId: 'praps_rehab',
      cutKey: 'corte2',
      cutName: '2° Corte',
      cutoffDate: '2026-11-30',
      quotaEvaluated: 'Cuota Final (20%)',
      quotaPercentage: 20,
      targetCompliance: 80,
      tranches: [
        {
          id: 'tr2_1',
          minCompliance: 80,
          maxCompliance: null,
          discountPercentage: 0,
          label: '80% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tr2_2',
          minCompliance: 65,
          maxCompliance: 79.9,
          discountPercentage: 50,
          label: '65% - 79,9%',
          description: 'Descuento 50% de cuota final',
        },
        {
          id: 'tr2_3',
          minCompliance: 45,
          maxCompliance: 64.9,
          discountPercentage: 75,
          label: '45% - 64,9%',
          description: 'Descuento 75% de cuota final',
        },
        {
          id: 'tr2_4',
          minCompliance: 0,
          maxCompliance: 44.99,
          discountPercentage: 100,
          label: 'Menos del 45%',
          description: 'Descuento 100% de cuota final',
        },
      ],
    },
    corte3: {
      programId: 'praps_rehab',
      cutKey: 'corte3',
      cutName: '3° Corte',
      cutoffDate: '2026-12-31',
      quotaEvaluated: 'Reliquidación Anual',
      quotaPercentage: 10,
      targetCompliance: 85,
      tranches: [
        {
          id: 'tr3_1',
          minCompliance: 85,
          maxCompliance: null,
          discountPercentage: 0,
          label: '85% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tr3_2',
          minCompliance: 0,
          maxCompliance: 84.99,
          discountPercentage: 100,
          label: 'Menos del 85%',
          description: 'Reliquidación total del saldo',
        },
      ],
    },
  },

  praps_imagenes: {
    corte1: {
      programId: 'praps_imagenes',
      cutKey: 'corte1',
      cutName: '1° Corte',
      cutoffDate: '2026-07-31',
      quotaEvaluated: '2° Cuota del 30%',
      quotaPercentage: 30,
      targetCompliance: 55,
      tranches: [
        {
          id: 'ti_1',
          minCompliance: 55,
          maxCompliance: null,
          discountPercentage: 0,
          label: '55% o más',
          description: 'Sin reliquidación (Cumple)',
        },
        {
          id: 'ti_2',
          minCompliance: 40,
          maxCompliance: 54.9,
          discountPercentage: 50,
          label: '40% - 54,9%',
          description: 'Descuento 50% de 2° cuota',
        },
        {
          id: 'ti_3',
          minCompliance: 28,
          maxCompliance: 39.9,
          discountPercentage: 75,
          label: '28% - 39,9%',
          description: 'Descuento 75% de 2° cuota',
        },
        {
          id: 'ti_4',
          minCompliance: 0,
          maxCompliance: 27.99,
          discountPercentage: 100,
          label: 'Menos del 28%',
          description: 'Descuento 100% de 2° cuota',
        },
      ],
    },
    corte2: {
      programId: 'praps_imagenes',
      cutKey: 'corte2',
      cutName: '2° Corte',
      cutoffDate: '2026-11-30',
      quotaEvaluated: 'Cuota Final (15%)',
      quotaPercentage: 15,
      targetCompliance: 85,
      tranches: [
        {
          id: 'ti2_1',
          minCompliance: 85,
          maxCompliance: null,
          discountPercentage: 0,
          label: '85% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'ti2_2',
          minCompliance: 70,
          maxCompliance: 84.9,
          discountPercentage: 50,
          label: '70% - 84,9%',
          description: 'Descuento 50% de cuota final',
        },
        {
          id: 'ti2_3',
          minCompliance: 0,
          maxCompliance: 69.99,
          discountPercentage: 100,
          label: 'Menos del 70%',
          description: 'Descuento 100% de cuota final',
        },
      ],
    },
    corte3: {
      programId: 'praps_imagenes',
      cutKey: 'corte3',
      cutName: '3° Corte',
      cutoffDate: '2026-12-31',
      quotaEvaluated: 'Cierre Anual',
      quotaPercentage: 10,
      targetCompliance: 90,
      tranches: [
        {
          id: 'ti3_1',
          minCompliance: 90,
          maxCompliance: null,
          discountPercentage: 0,
          label: '90% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'ti3_2',
          minCompliance: 0,
          maxCompliance: 89.99,
          discountPercentage: 100,
          label: 'Menos del 90%',
          description: 'Reliquidación de saldo',
        },
      ],
    },
  },

  praps_mas_ama: {
    corte1: {
      programId: 'praps_mas_ama',
      cutKey: 'corte1',
      cutName: '1° Corte',
      cutoffDate: '2026-07-31',
      quotaEvaluated: '2° Cuota del 30%',
      quotaPercentage: 30,
      targetCompliance: 52,
      tranches: [
        {
          id: 'tm_1',
          minCompliance: 52,
          maxCompliance: null,
          discountPercentage: 0,
          label: '52% o más',
          description: 'Sin reliquidación (Cumple)',
        },
        {
          id: 'tm_2',
          minCompliance: 38,
          maxCompliance: 51.9,
          discountPercentage: 50,
          label: '38% - 51,9%',
          description: 'Descuento 50% de 2° cuota',
        },
        {
          id: 'tm_3',
          minCompliance: 25,
          maxCompliance: 37.9,
          discountPercentage: 75,
          label: '25% - 37,9%',
          description: 'Descuento 75% de 2° cuota',
        },
        {
          id: 'tm_4',
          minCompliance: 0,
          maxCompliance: 24.99,
          discountPercentage: 100,
          label: 'Menos del 25%',
          description: 'Descuento 100% de 2° cuota',
        },
      ],
    },
    corte2: {
      programId: 'praps_mas_ama',
      cutKey: 'corte2',
      cutName: '2° Corte',
      cutoffDate: '2026-11-30',
      quotaEvaluated: 'Cuota Final (20%)',
      quotaPercentage: 20,
      targetCompliance: 80,
      tranches: [
        {
          id: 'tm2_1',
          minCompliance: 80,
          maxCompliance: null,
          discountPercentage: 0,
          label: '80% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tm2_2',
          minCompliance: 60,
          maxCompliance: 79.9,
          discountPercentage: 50,
          label: '60% - 79,9%',
          description: 'Descuento 50% de cuota final',
        },
        {
          id: 'tm2_3',
          minCompliance: 0,
          maxCompliance: 59.99,
          discountPercentage: 100,
          label: 'Menos del 60%',
          description: 'Descuento 100% de cuota final',
        },
      ],
    },
    corte3: {
      programId: 'praps_mas_ama',
      cutKey: 'corte3',
      cutName: '3° Corte',
      cutoffDate: '2026-12-31',
      quotaEvaluated: 'Cierre Anual',
      quotaPercentage: 10,
      targetCompliance: 85,
      tranches: [
        {
          id: 'tm3_1',
          minCompliance: 85,
          maxCompliance: null,
          discountPercentage: 0,
          label: '85% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tm3_2',
          minCompliance: 0,
          maxCompliance: 84.99,
          discountPercentage: 100,
          label: 'Menos del 85%',
          description: 'Reliquidación de saldo',
        },
      ],
    },
  },

  praps_respiratoria: {
    corte1: {
      programId: 'praps_respiratoria',
      cutKey: 'corte1',
      cutName: '1° Corte',
      cutoffDate: '2026-07-31',
      quotaEvaluated: '2° Cuota del 30%',
      quotaPercentage: 30,
      targetCompliance: 60,
      tranches: [
        {
          id: 'tresp_1',
          minCompliance: 60,
          maxCompliance: null,
          discountPercentage: 0,
          label: '60% o más',
          description: 'Sin reliquidación (Cumple)',
        },
        {
          id: 'tresp_2',
          minCompliance: 45,
          maxCompliance: 59.9,
          discountPercentage: 50,
          label: '45% - 59,9%',
          description: 'Descuento 50% de 2° cuota',
        },
        {
          id: 'tresp_3',
          minCompliance: 30,
          maxCompliance: 44.9,
          discountPercentage: 75,
          label: '30% - 44,9%',
          description: 'Descuento 75% de 2° cuota',
        },
        {
          id: 'tresp_4',
          minCompliance: 0,
          maxCompliance: 29.99,
          discountPercentage: 100,
          label: 'Menos del 30%',
          description: 'Descuento 100% de 2° cuota',
        },
      ],
    },
    corte2: {
      programId: 'praps_respiratoria',
      cutKey: 'corte2',
      cutName: '2° Corte',
      cutoffDate: '2026-11-30',
      quotaEvaluated: 'Cuota Final (15%)',
      quotaPercentage: 15,
      targetCompliance: 90,
      tranches: [
        {
          id: 'tresp2_1',
          minCompliance: 90,
          maxCompliance: null,
          discountPercentage: 0,
          label: '90% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tresp2_2',
          minCompliance: 75,
          maxCompliance: 89.9,
          discountPercentage: 50,
          label: '75% - 89,9%',
          description: 'Descuento 50% de cuota final',
        },
        {
          id: 'tresp2_3',
          minCompliance: 55,
          maxCompliance: 74.9,
          discountPercentage: 75,
          label: '55% - 74,9%',
          description: 'Descuento 75% de cuota final',
        },
        {
          id: 'tresp2_4',
          minCompliance: 0,
          maxCompliance: 54.99,
          discountPercentage: 100,
          label: 'Menos del 55%',
          description: 'Descuento 100% de cuota final',
        },
      ],
    },
    corte3: {
      programId: 'praps_respiratoria',
      cutKey: 'corte3',
      cutName: '3° Corte',
      cutoffDate: '2026-12-31',
      quotaEvaluated: 'Cierre Anual',
      quotaPercentage: 10,
      targetCompliance: 90,
      tranches: [
        {
          id: 'tresp3_1',
          minCompliance: 90,
          maxCompliance: null,
          discountPercentage: 0,
          label: '90% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tresp3_2',
          minCompliance: 0,
          maxCompliance: 89.99,
          discountPercentage: 100,
          label: 'Menos del 90%',
          description: 'Reliquidación de saldo',
        },
      ],
    },
  },

  prog_personas_mayores: {
    corte1: {
      programId: 'prog_personas_mayores',
      cutKey: 'corte1',
      cutName: '1° Corte',
      cutoffDate: '2026-07-31',
      quotaEvaluated: '2° Cuota del 30%',
      quotaPercentage: 30,
      targetCompliance: 50,
      tranches: [
        {
          id: 'tpm_1',
          minCompliance: 50,
          maxCompliance: null,
          discountPercentage: 0,
          label: '50% o más',
          description: 'Sin reliquidación (Cumple)',
        },
        {
          id: 'tpm_2',
          minCompliance: 35,
          maxCompliance: 49.9,
          discountPercentage: 50,
          label: '35% - 49,9%',
          description: 'Descuento 50% de 2° cuota',
        },
        {
          id: 'tpm_3',
          minCompliance: 20,
          maxCompliance: 34.9,
          discountPercentage: 75,
          label: '20% - 34,9%',
          description: 'Descuento 75% de 2° cuota',
        },
        {
          id: 'tpm_4',
          minCompliance: 0,
          maxCompliance: 19.99,
          discountPercentage: 100,
          label: 'Menos del 20%',
          description: 'Descuento 100% de 2° cuota',
        },
      ],
    },
    corte2: {
      programId: 'prog_personas_mayores',
      cutKey: 'corte2',
      cutName: '2° Corte',
      cutoffDate: '2026-11-30',
      quotaEvaluated: 'Cuota Final (20%)',
      quotaPercentage: 20,
      targetCompliance: 80,
      tranches: [
        {
          id: 'tpm2_1',
          minCompliance: 80,
          maxCompliance: null,
          discountPercentage: 0,
          label: '80% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tpm2_2',
          minCompliance: 65,
          maxCompliance: 79.9,
          discountPercentage: 50,
          label: '65% - 79,9%',
          description: 'Descuento 50% de cuota final',
        },
        {
          id: 'tpm2_3',
          minCompliance: 0,
          maxCompliance: 64.99,
          discountPercentage: 100,
          label: 'Menos del 65%',
          description: 'Descuento 100% de cuota final',
        },
      ],
    },
    corte3: {
      programId: 'prog_personas_mayores',
      cutKey: 'corte3',
      cutName: '3° Corte',
      cutoffDate: '2026-12-31',
      quotaEvaluated: 'Cierre Anual',
      quotaPercentage: 10,
      targetCompliance: 85,
      tranches: [
        {
          id: 'tpm3_1',
          minCompliance: 85,
          maxCompliance: null,
          discountPercentage: 0,
          label: '85% o más',
          description: 'Sin reliquidación',
        },
        {
          id: 'tpm3_2',
          minCompliance: 0,
          maxCompliance: 84.99,
          discountPercentage: 100,
          label: 'Menos del 85%',
          description: 'Reliquidación de saldo',
        },
      ],
    },
  },
};

export function getProgramCutConfig(
  programId: string,
  cutKey: 'corte1' | 'corte2' | 'corte3',
  customConfigs?: Record<string, Record<'corte1' | 'corte2' | 'corte3', ProgramCutConfig>>
): ProgramCutConfig {
  if (customConfigs && customConfigs[programId]?.[cutKey]) {
    return customConfigs[programId][cutKey];
  }
  if (DEFAULT_PROGRAM_CUT_CONFIGS[programId]?.[cutKey]) {
    return DEFAULT_PROGRAM_CUT_CONFIGS[programId][cutKey];
  }
  // Generic fallback if unknown program
  return {
    programId,
    cutKey,
    cutName: cutKey === 'corte1' ? '1° Corte' : cutKey === 'corte2' ? '2° Corte' : '3° Corte',
    cutoffDate: cutKey === 'corte1' ? '2026-07-31' : cutKey === 'corte2' ? '2026-11-30' : '2026-12-31',
    quotaEvaluated: cutKey === 'corte1' ? '2° Cuota del 30%' : 'Cuota Final (20%)',
    quotaPercentage: cutKey === 'corte1' ? 30 : 20,
    targetCompliance: cutKey === 'corte1' ? 56 : 85,
    tranches: [
      {
        id: 'gen_1',
        minCompliance: cutKey === 'corte1' ? 56 : 85,
        maxCompliance: null,
        discountPercentage: 0,
        label: cutKey === 'corte1' ? '56% o más' : '85% o más',
        description: 'Sin reliquidación (Cumple meta)',
      },
      {
        id: 'gen_2',
        minCompliance: cutKey === 'corte1' ? 43 : 70,
        maxCompliance: cutKey === 'corte1' ? 55.9 : 84.9,
        discountPercentage: 50,
        label: cutKey === 'corte1' ? '43% - 55,9%' : '70% - 84,9%',
        description: 'Descuento del 50% de los recursos de la cuota',
      },
      {
        id: 'gen_3',
        minCompliance: cutKey === 'corte1' ? 30 : 50,
        maxCompliance: cutKey === 'corte1' ? 42.9 : 69.9,
        discountPercentage: 75,
        label: cutKey === 'corte1' ? '30% - 42,9%' : '50% - 69,9%',
        description: 'Descuento del 75% de los recursos de la cuota',
      },
      {
        id: 'gen_4',
        minCompliance: 0,
        maxCompliance: cutKey === 'corte1' ? 29.99 : 49.99,
        discountPercentage: 100,
        label: cutKey === 'corte1' ? 'Menos del 30%' : 'Menos del 50%',
        description: 'Descuento del 100% de los recursos de la cuota',
      },
    ],
  };
}

export interface ReliquidationEvaluationResult {
  compliance: number; // e.g. 27.52
  meetsGoal: boolean;
  activeTranche: ReliquidationTranche;
  activeTrancheIndex: number;
  discountPercentage: number; // 0, 50, 75, 100
  quotaName: string; // "2° Cuota del 30%"
  targetCompliance: number; // e.g. 56
  gapToCompliance: number; // e.g. 28.48% needed to reach 0% discount
  estimatedPenaltyAmount?: number; // CLP amount in risk of discount
  estimatedQuotaAmount?: number; // CLP total of the evaluated quota
}

export function evaluateReliquidation(
  compliance: number,
  config: ProgramCutConfig,
  annualBudget?: number
): ReliquidationEvaluationResult {
  const tranches = config.tranches;
  let activeTranche = tranches[tranches.length - 1];
  let activeTrancheIndex = tranches.length - 1;

  for (let i = 0; i < tranches.length; i++) {
    const t = tranches[i];
    const isAboveMin = compliance >= t.minCompliance;
    const isBelowMax = t.maxCompliance === null || t.maxCompliance === undefined || compliance <= t.maxCompliance;
    if (isAboveMin && isBelowMax) {
      activeTranche = t;
      activeTrancheIndex = i;
      break;
    }
  }

  const meetsGoal = activeTranche.discountPercentage === 0;
  const gapToCompliance = Math.max(0, Number((config.targetCompliance - compliance).toFixed(2)));

  let estimatedQuotaAmount: number | undefined = undefined;
  let estimatedPenaltyAmount: number | undefined = undefined;

  if (annualBudget && annualBudget > 0) {
    estimatedQuotaAmount = (annualBudget * config.quotaPercentage) / 100;
    estimatedPenaltyAmount = (estimatedQuotaAmount * activeTranche.discountPercentage) / 100;
  }

  return {
    compliance,
    meetsGoal,
    activeTranche,
    activeTrancheIndex,
    discountPercentage: activeTranche.discountPercentage,
    quotaName: config.quotaEvaluated,
    targetCompliance: config.targetCompliance,
    gapToCompliance,
    estimatedPenaltyAmount,
    estimatedQuotaAmount,
  };
}
