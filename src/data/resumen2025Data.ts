export interface Indicador2025 {
  id: string;
  code: string;
  name: string;
  programId: string;
  programName: string;
  category: string;
  target: number;
  achieved: number;
  unit: string;
  complianceRate: number; // e.g. 102.5
  status: 'superada' | 'cumplida' | 'brecha_menor' | 'no_cumplida';
  semester1: number;
  semester2: number;
  notes: string;
  source: string;
}

export interface Compra2025 {
  id: string;
  ocNumber: string;
  title: string;
  programId: string;
  programName: string;
  purchaseType: 'Licitación Pública' | 'Convenio Marco' | 'Compra Ágil' | 'Trato Directo Excepcional';
  amount: number;
  supplier: string;
  receptionDate: string;
  status: 'Recepcionada Conforme' | 'Cerrada y Rendida' | 'Garantía Vigente';
  targetEstablishment: string;
  clinicalImpact: string;
}

export interface PresupuestoPrograma2025 {
  programId: string;
  programName: string;
  code: string;
  assignedBudget: number;
  executedBudget: number;
  executionRate: number; // e.g. 98.6
  balance: number;
  personnelExpenses: number;
  operatingExpenses: number;
  investmentExpenses: number;
  rendicionStatus: 'Aprobada SSMN 100%' | 'Auditada sin Observaciones';
  observations: string;
}

export interface HitoDestacado2025 {
  id: string;
  title: string;
  category: 'Logro Clínico' | 'Gestión Comunitaria' | 'Infraestructura & Equipamiento' | 'ELEAM & Cuidados' | 'Resolutividad Diagnóstica';
  programId?: string;
  programName?: string;
  date: string;
  highlightText: string;
  description: string;
  keyMetric: string;
  tags: string[];
  impactLevel: 'Alto Impacto Comunal' | 'Hito Operativo' | 'Consolidación Red';
}

export interface Resumen2025Global {
  year: number;
  totalAssignedBudget: number;
  totalExecutedBudget: number;
  globalExecutionRate: number;
  totalPrograms: number;
  totalIndicators: number;
  compliantIndicators: number;
  totalPurchases: number;
  totalPurchasesAmount: number;
  totalBeneficiaries: number;
  approvalSSMN: string;
  programsSummary: PresupuestoPrograma2025[];
  indicators: Indicador2025[];
  purchases: Compra2025[];
  highlights: HitoDestacado2025[];
}

export const RESUMEN_2025_DATA: Resumen2025Global = {
  year: 2025,
  totalAssignedBudget: 562800000,
  totalExecutedBudget: 554358000,
  globalExecutionRate: 98.5,
  totalPrograms: 6,
  totalIndicators: 18,
  compliantIndicators: 17,
  totalPurchases: 48,
  totalPurchasesAmount: 142600000,
  totalBeneficiaries: 38450,
  approvalSSMN: 'Resolución Exenta N° 3418 / SSMN - Rendición Financiera y Técnica Aprobada',
  programsSummary: [
    {
      programId: 'praps_cpu',
      programName: 'PRAPS Cuidados Paliativos Universales (CPU)',
      code: 'CPU',
      assignedBudget: 64000000,
      executedBudget: 63488000,
      executionRate: 99.2,
      balance: 512000,
      personnelExpenses: 48200000,
      operatingExpenses: 11888000,
      investmentExpenses: 3400000,
      rendicionStatus: 'Aprobada SSMN 100%',
      observations: 'Ejecución ejemplar con cero quejas y 100% de oportunidad en alivio del dolor.',
    },
    {
      programId: 'praps_rehab',
      programName: 'PRAPS Rehabilitación Integral (RBC)',
      code: 'REHAB',
      assignedBudget: 108000000,
      executedBudget: 106920000,
      executionRate: 99.0,
      balance: 1080000,
      personnelExpenses: 78500000,
      operatingExpenses: 19420000,
      investmentExpenses: 9000000,
      rendicionStatus: 'Aprobada SSMN 100%',
      observations: 'Renovación de salas RBC en Manuel Bustos, Irene Frei y Salvador Allende.',
    },
    {
      programId: 'praps_imagenes',
      programName: 'PRAPS Imágenes Diagnósticas en APS',
      code: 'IMAG',
      assignedBudget: 84000000,
      executedBudget: 82740000,
      executionRate: 98.5,
      balance: 1260000,
      personnelExpenses: 34000000,
      operatingExpenses: 43240000,
      investmentExpenses: 5500000,
      rendicionStatus: 'Aprobada SSMN 100%',
      observations: 'Convenio mamográfico con clínica móvil y ecografía doppler SAR en plena operación.',
    },
    {
      programId: 'praps_mas_ama',
      programName: 'Más Adultos Mayores Autovalentes (+AMA)',
      code: 'AMA',
      assignedBudget: 72500000,
      executedBudget: 71620000,
      executionRate: 98.8,
      balance: 880000,
      personnelExpenses: 56800000,
      operatingExpenses: 12420000,
      investmentExpenses: 2400000,
      rendicionStatus: 'Aprobada SSMN 100%',
      observations: 'Superación de meta comunal con 48 agrupaciones territoriales activas.',
    },
    {
      programId: 'praps_respiratoria',
      programName: 'Salud Respiratoria (ERA / IRA / Campaña Invierno)',
      code: 'RESP',
      assignedBudget: 128500000,
      executedBudget: 126820000,
      executionRate: 98.7,
      balance: 1680000,
      personnelExpenses: 89400000,
      operatingExpenses: 32920000,
      investmentExpenses: 4500000,
      rendicionStatus: 'Aprobada SSMN 100%',
      observations: 'Refuerzo de horas médicas kinésicas en peaks y dotación completa de fármacos inhalatorios.',
    },
    {
      programId: 'prog_personas_mayores',
      programName: 'Personas Mayores (ELEAM / EMPAM / Cuidados)',
      code: 'MAYORES',
      assignedBudget: 105800000,
      executedBudget: 102770000,
      executionRate: 97.1,
      balance: 3030000,
      personnelExpenses: 68900000,
      operatingExpenses: 28370000,
      investmentExpenses: 5500000,
      rendicionStatus: 'Auditada sin Observaciones',
      observations: 'Catastro y regularización del 100% de residencias ELEAM de Quilicura.',
    },
  ],
  indicators: [
    {
      id: 'ind_2025_cpu_01',
      code: 'IND-CPU-01',
      name: 'Cobertura Integral de Cuidados Paliativos Universales (CPU)',
      programId: 'praps_cpu',
      programName: 'Cuidados Paliativos (CPU)',
      category: 'Cobertura Asistencial',
      target: 130,
      achieved: 142,
      unit: 'Pacientes ingresados',
      complianceRate: 109.2,
      status: 'superada',
      semester1: 68,
      semester2: 74,
      notes: 'Demanda absorbida al 100%, con visitas médicas y de enfermería en domicilio en menos de 24h.',
      source: 'REM A05 / Registro Clínico Electrónico',
    },
    {
      id: 'ind_2025_cpu_02',
      code: 'IND-CPU-02',
      name: 'Oportunidad de Alivio del Dolor y Síntomas Refractarios',
      programId: 'praps_cpu',
      programName: 'Cuidados Paliativos (CPU)',
      category: 'Calidad Clínica',
      target: 95.0,
      achieved: 98.4,
      unit: '% de pacientes con dolor controlado',
      complianceRate: 103.6,
      status: 'superada',
      semester1: 97.8,
      semester2: 98.9,
      notes: 'Protocolo de rescate analgesico y bombas elastoméricas domiciliarias.',
      source: 'Auditoría Clínica CPU Quilicura',
    },
    {
      id: 'ind_2025_rehab_01',
      code: 'IND-REH-01',
      name: 'Personas con Egreso Efectivo en Salas RBC (Ganancia Funcional)',
      programId: 'praps_rehab',
      programName: 'Rehabilitación Integral',
      category: 'Resolutividad',
      target: 1200,
      achieved: 1285,
      unit: 'Egresos con FIM/Barthel mejorado',
      complianceRate: 107.1,
      status: 'superada',
      semester1: 610,
      semester2: 675,
      notes: 'Alto rendimiento en salas Manuel Bustos e Irene Frei con talleres grupales de mantención.',
      source: 'REM A28 / Fichas RBC',
    },
    {
      id: 'ind_2025_rehab_02',
      code: 'IND-REH-02',
      name: 'Entrega Oportuna de Ayudas Técnicas en APS',
      programId: 'praps_rehab',
      programName: 'Rehabilitación Integral',
      category: 'Acceso y Oportunidad',
      target: 180,
      achieved: 194,
      unit: 'Ayudas técnicas entregadas',
      complianceRate: 107.8,
      status: 'superada',
      semester1: 92,
      semester2: 102,
      notes: 'Sillas de ruedas estándar y neurológicas, andadores, bastones y cojines antiescaras.',
      source: 'Inventario y Ficha Social DISAM',
    },
    {
      id: 'ind_2025_imag_01',
      code: 'IND-IMG-01',
      name: 'Mamografías de Tamizaje en Mujeres de 50 a 69 Años',
      programId: 'praps_imagenes',
      programName: 'Imágenes Diagnósticas',
      category: 'Prevención Oncológica',
      target: 2200,
      achieved: 2150,
      unit: 'Mamografías bilaterales',
      complianceRate: 97.7,
      status: 'cumplida',
      semester1: 1040,
      semester2: 1110,
      notes: 'Convenio con clínica móvil externa con rescate de usuarias no asistentes en sábado.',
      source: 'REM P04 / Informe Prestador Externo',
    },
    {
      id: 'ind_2025_imag_02',
      code: 'IND-IMG-02',
      name: 'Ecografías Obstétricas y Ginecológicas en APS Quilicura',
      programId: 'praps_imagenes',
      programName: 'Imágenes Diagnósticas',
      category: 'Resolutividad APS',
      target: 3200,
      achieved: 3420,
      unit: 'Ecografías realizadas',
      complianceRate: 106.9,
      status: 'superada',
      semester1: 1650,
      semester2: 1770,
      notes: 'Se aumentó la agenda médica ecográfica en SAR y CESFAM Salvador Allende.',
      source: 'REM A04 / Agenda Rayen',
    },
    {
      id: 'ind_2025_ama_01',
      code: 'IND-AMA-01',
      name: 'Adultos Mayores Autovalentes Ingresados a Talleres de Estimulación',
      programId: 'praps_mas_ama',
      programName: 'Más Adultos Mayores (+AMA)',
      category: 'Promoción y Prevención',
      target: 1400,
      achieved: 1480,
      unit: 'Personas mayores participantes',
      complianceRate: 105.7,
      status: 'superada',
      semester1: 720,
      semester2: 760,
      notes: 'Despliegue territorial en 48 clubes de adultos mayores, sedes vecinales y centros comunitarios.',
      source: 'REM A01 / Planillas +AMA Quilicura',
    },
    {
      id: 'ind_2025_ama_02',
      code: 'IND-AMA-02',
      name: 'Tasa de Adherencia y Mantención de Autovalencia al Egreso',
      programId: 'praps_mas_ama',
      programName: 'Más Adultos Mayores (+AMA)',
      category: 'Efectividad',
      target: 85.0,
      achieved: 91.3,
      unit: '% con autovalencia mantenida',
      complianceRate: 107.4,
      status: 'superada',
      semester1: 89.5,
      semester2: 93.0,
      notes: 'Excelente adherencia gracias a duplas de kinesiólogos y terapeutas ocupacionales.',
      source: 'Evaluaciones EFAM post-taller',
    },
    {
      id: 'ind_2025_resp_01',
      code: 'IND-RES-01',
      name: 'Compensación de Pacientes con Asma Bronquial y EPOC en Salas ERA',
      programId: 'praps_respiratoria',
      programName: 'Salud Respiratoria (ERA/IRA)',
      category: 'Compensación Crónica',
      target: 80.0,
      achieved: 84.6,
      unit: '% de pacientes compensados',
      complianceRate: 105.8,
      status: 'superada',
      semester1: 82.1,
      semester2: 87.0,
      notes: 'Espirometrías al día y entrega asegurada de terapia triple en casos severos.',
      source: 'REM P06 / Ficha Clínica',
    },
    {
      id: 'ind_2025_resp_02',
      code: 'IND-RES-02',
      name: 'Resolución de Cuadros Respiratorios Agudos en Salas IRA/ERA (Campaña Invierno)',
      programId: 'praps_respiratoria',
      programName: 'Salud Respiratoria (ERA/IRA)',
      category: 'Urgencia y Resolutividad',
      target: 90.0,
      achieved: 93.2,
      unit: '% resueltos en APS sin derivación',
      complianceRate: 103.5,
      status: 'superada',
      semester1: 91.8,
      semester2: 94.5,
      notes: 'Kinesioterapia respiratoria kinésica inmediata y kinesiólogos en extensión horaria.',
      source: 'REM A08 / SAR Quilicura',
    },
    {
      id: 'ind_2025_mayores_01',
      code: 'IND-MAY-01',
      name: 'Cobertura Examen de Medicina Preventiva del Adulto Mayor (EMPAM)',
      programId: 'prog_personas_mayores',
      programName: 'Personas Mayores (ELEAM/EMPAM)',
      category: 'Cobertura Preventiva',
      target: 7000,
      achieved: 6420,
      unit: 'EMPAM aplicados',
      complianceRate: 91.7,
      status: 'cumplida',
      semester1: 3050,
      semester2: 3370,
      notes: 'Se reforzó el barrido territorial en segundo semestre; se priorizó a mayores con riesgo de dependencia.',
      source: 'REM P02 / Sistema Rayen',
    },
    {
      id: 'ind_2025_mayores_02',
      code: 'IND-MAY-02',
      name: 'Fiscalización y Plan de Regularización de Residencias ELEAM',
      programId: 'prog_personas_mayores',
      programName: 'Personas Mayores (ELEAM/EMPAM)',
      category: 'Regulación y Calidad',
      target: 100.0,
      achieved: 100.0,
      unit: '% ELEAM catastrados con plan activo',
      complianceRate: 100.0,
      status: 'cumplida',
      semester1: 100.0,
      semester2: 100.0,
      notes: 'Los 8 ELEAM de Quilicura cuentan con carpeta sanitaria y mesa técnica conjunta con SEREMI.',
      source: 'Expedientes Sanitarios DISAM Quilicura',
    },
  ],
  purchases: [
    {
      id: 'oc_2025_001',
      ocNumber: 'OC-2025-4190-2391',
      title: 'Adquisición de Concentradores de Oxígeno Portátiles y Bombas Elastoméricas CPU',
      programId: 'praps_cpu',
      programName: 'Cuidados Paliativos (CPU)',
      purchaseType: 'Licitación Pública',
      amount: 14850000,
      supplier: 'MedEquip Chile SpA',
      receptionDate: '2025-04-18',
      status: 'Recepcionada Conforme',
      targetEstablishment: 'Red Comunal CPU Quilicura',
      clinicalImpact: 'Permitió autonomía de traslado a 34 pacientes dependientes de oxigenoterapia domiciliaria.',
    },
    {
      id: 'oc_2025_002',
      ocNumber: 'OC-2025-4190-3108',
      title: 'Renovación de Equipos de Ultrasonido y Electroterapia para Salas RBC',
      programId: 'praps_rehab',
      programName: 'Rehabilitación Integral',
      purchaseType: 'Convenio Marco',
      amount: 19400000,
      supplier: 'KineSalud Distribuciones Ltda.',
      receptionDate: '2025-06-25',
      status: 'Recepcionada Conforme',
      targetEstablishment: 'CESFAM Manuel Bustos / Irene Frei / Salvador Allende',
      clinicalImpact: 'Aumento del 25% en la rotación de tratamientos de dolor crónico musculoesquelético.',
    },
    {
      id: 'oc_2025_003',
      ocNumber: 'OC-2025-4190-4421',
      title: 'Contratación de Clínica Móvil de Mamografía Digital de Alta Resolución',
      programId: 'praps_imagenes',
      programName: 'Imágenes Diagnósticas',
      purchaseType: 'Licitación Pública',
      amount: 38200000,
      supplier: 'Diagnósticos Radiológicos Móviles SpA',
      receptionDate: '2025-11-14',
      status: 'Cerrada y Rendida',
      targetEstablishment: 'Territorio Comunal Quilicura',
      clinicalImpact: '2.150 mamografías realizadas en barrios y villas sin desplazamiento de usuarias fuera de la comuna.',
    },
    {
      id: 'oc_2025_004',
      ocNumber: 'OC-2025-4190-1882',
      title: 'Kits Didácticos, Pesas Terapéuticas y Material de Estimulación Cognitiva +AMA',
      programId: 'praps_mas_ama',
      programName: 'Más Adultos Mayores (+AMA)',
      purchaseType: 'Convenio Marco',
      amount: 11900000,
      supplier: 'GerontoInsumos Chile Ltda.',
      receptionDate: '2025-03-22',
      status: 'Cerrada y Rendida',
      targetEstablishment: '48 Clubes de Adultos Mayores Quilicura',
      clinicalImpact: 'Equipamiento completo para 48 talleres territoriales de motricidad y memoria.',
    },
    {
      id: 'oc_2025_005',
      ocNumber: 'OC-2025-4190-5012',
      title: 'Fármacos Inhalatorios Estratégicos, Espirómetros y Cámaras de Inhalación',
      programId: 'praps_respiratoria',
      programName: 'Salud Respiratoria (ERA/IRA)',
      purchaseType: 'Compra Ágil',
      amount: 31750000,
      supplier: 'Laboratorios Farmacéuticos Unidos S.A.',
      receptionDate: '2025-05-10',
      status: 'Recepcionada Conforme',
      targetEstablishment: 'Farmacias de CESFAM y SAR Quilicura',
      clinicalImpact: 'Cero quiebres de stock durante el peak de sincicial e influenza en invierno 2025.',
    },
    {
      id: 'oc_2025_006',
      ocNumber: 'OC-2025-4190-6734',
      title: 'Insumos Clínicos de Enfermería, Curación Avanzada y Kits Geriátricos ELEAM',
      programId: 'prog_personas_mayores',
      programName: 'Personas Mayores (ELEAM/EMPAM)',
      purchaseType: 'Convenio Marco',
      amount: 26500000,
      supplier: 'Hospitalia Médica Ltda.',
      receptionDate: '2025-08-30',
      status: 'Cerrada y Rendida',
      targetEstablishment: '8 Residencias ELEAM Quilicura',
      clinicalImpact: 'Cero infecciones intrahospitalarias prevenibles en residentes adultos mayores.',
    },
  ],
  highlights: [
    {
      id: 'hito_2025_01',
      title: 'Tasa Histórica de Ejecución Presupuestaria: 98.5% en Programas PRAPS',
      category: 'Infraestructura & Equipamiento',
      date: 'Diciembre 2025',
      highlightText: '$554.358.000 ejecutados de forma transparente y aprobados por el Servicio de Salud Metropolitano Norte (SSMN).',
      description: 'La gestión de compras tempranas y la calendarización por hitos mensuales permitieron que los 6 programas de salud alcanzaran ejecuciones superiores al 97%, cerrando el año sin saldos remanentes no justificados y con auditoría impecable.',
      keyMetric: '98.5% Ejecución Global',
      tags: ['Presupuesto', 'SSMN', 'Eficiencia Financiera', 'PRAPS 2025'],
      impactLevel: 'Alto Impacto Comunal',
    },
    {
      id: 'hito_2025_02',
      title: 'Consolidación de la Red Comunal de Cuidados Paliativos Universales (CPU)',
      category: 'Logro Clínico',
      programId: 'praps_cpu',
      programName: 'Cuidados Paliativos (CPU)',
      date: 'Octubre 2025',
      highlightText: '142 familias quilicuranas acompañadas integralmente en sus hogares con respuesta en menos de 24 horas.',
      description: 'Se logró protocolizar el ingreso rápido desde el Hospital San José y el Instituto Nacional del Cáncer directo a los domicilios de Quilicura, asegurando fármacos analgésicos de rescate, oxígeno y apoyo psicológico a cuidadores.',
      keyMetric: '100% Oportunidad Domiciliaria',
      tags: ['Cuidados Paliativos', 'Domicilio', 'Alivio del Dolor', 'Humanización'],
      impactLevel: 'Alto Impacto Comunal',
    },
    {
      id: 'hito_2025_03',
      title: 'Cero Brecha Diagnóstica en Mamografías y 3.420 Ecografías en APS',
      category: 'Resolutividad Diagnóstica',
      programId: 'praps_imagenes',
      programName: 'Imágenes Diagnósticas',
      date: 'Noviembre 2025',
      highlightText: 'Despliegue de clínica móvil que llevó el tamizaje mamográfico directamente a los barrios de Quilicura.',
      description: 'Se eliminaron las barreras de traslado hacia centros hospitalarios periféricos. 2.150 mujeres de 50 a 69 años recibieron su informe mamográfico en menos de 15 días, con derivación inmediata de casos BIRADS 4 y 5.',
      keyMetric: '2.150 Mamografías / 3.420 Ecografías',
      tags: ['Cáncer de Mama', 'Mamografía Móvil', 'Ecografía SAR', 'Prevención'],
      impactLevel: 'Alto Impacto Comunal',
    },
    {
      id: 'hito_2025_04',
      title: 'Estrategia Territorial Más Adultos Mayores Autovalentes (+AMA)',
      category: 'Gestión Comunitaria',
      programId: 'praps_mas_ama',
      programName: 'Más Adultos Mayores (+AMA)',
      date: 'Noviembre 2025',
      highlightText: '1.480 adultos mayores egresados con evaluación funcional superior y 48 clubes activos.',
      description: 'Se conformaron duplas de kinesiólogos y terapeutas ocupacionales que intervinieron sedes sociales, clubes deportivos y juntas vecinales, logrando una tasa de mantención de autovalencia del 91.3%.',
      keyMetric: '1.480 Vecinos Activos',
      tags: ['Adultos Mayores', 'Autovalencia', 'Participación Social', 'Talleres'],
      impactLevel: 'Alto Impacto Comunal',
    },
    {
      id: 'hito_2025_05',
      title: 'Regularización Sanitaria y Vigilancia del 100% de ELEAM en Quilicura',
      category: 'ELEAM & Cuidados',
      programId: 'prog_personas_mayores',
      programName: 'Personas Mayores (ELEAM)',
      date: 'Septiembre 2025',
      highlightText: 'Mesa intersectorial con SENAMA y SEREMI de Salud RM para proteger a personas mayores institucionalizadas.',
      description: 'Se completó el catastro exhaustivo de las 8 residencias de larga estadía de la comuna, subsanando brechas de infraestructura, registros de enfermería y planes de evacuación de emergencia.',
      keyMetric: '8 de 8 ELEAM con Plan Activo',
      tags: ['ELEAM', 'SENAMA', 'Fiscalización', 'Derechos Mayores'],
      impactLevel: 'Consolidación Red',
    },
    {
      id: 'hito_2025_06',
      title: 'Campaña de Invierno 2025 sin Quiebres de Stock y Descongestión del SAR',
      category: 'Logro Clínico',
      programId: 'praps_respiratoria',
      programName: 'Salud Respiratoria (ERA/IRA)',
      date: 'Agosto 2025',
      highlightText: 'Extensión horaria kinésica en los 3 CESFAM de Quilicura durante los meses críticos de frío.',
      description: 'Más de 14.500 atenciones respiratorias agudas atendidas oportunamente en atención primaria, evitando el colapso del servicio de urgencia comunal y logrando un 93.2% de resolutividad local.',
      keyMetric: '14.500 Atenciones Respiratorias',
      tags: ['Campaña Invierno', 'Salas IRA/ERA', 'Kinesioterapia', 'Urgencia'],
      impactLevel: 'Hito Operativo',
    },
  ],
};
