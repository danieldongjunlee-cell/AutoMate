import { useAppStore } from './store/useAppStore';

/** Display name (stored in the app) → language code. */
const LANG_CODE: Record<string, 'en' | 'ko' | 'es' | 'zh'> = {
  English: 'en',
  한국어: 'ko',
  Español: 'es',
  中文: 'zh',
};

/**
 * Translation dictionaries ported 1:1 from the v17 wireframe's `DICT`
 * (localize()). Only curated UI phrases are translated; unknown strings fall
 * back to English — same behavior as the wireframe.
 */
const DICT: Record<'ko' | 'es' | 'zh', Record<string, string>> = {
  ko: {
    Home: '홈', Bookings: '예약', Community: '커뮤니티', More: '더보기',
    Maintenance: '정비', 'Compare Costs': '비용 비교', Settings: '설정', Profile: '프로필',
    Language: '언어', 'Distance units': '거리 단위', Reviews: '리뷰', 'Quotes received': '받은 견적',
    'Pay it yourself': '직접 결제', 'Use insurance': '보험 이용', 'How AutoMate works': 'AutoMate 이용 방법',
    'Why choose AutoMate?': 'AutoMate를 선택하는 이유', 'Real customer reviews': '실제 고객 리뷰',
    'Continue →': '계속 →', 'Start now →': '시작하기 →', 'Accept quote': '견적 수락',
    'Book a Service': '서비스 예약', 'AI Repair Estimate': 'AI 수리 견적',
    'Submit for quotes →': '견적 요청하기 →', 'Select damaged part': '손상 부위 선택',
    'Account details': '계정 정보',
    'Shops near you': '근처 정비소', 'AI confidence': 'AI 신뢰도', 'Write a review': '리뷰 작성',
    'Scheduled services': '예약된 서비스', 'Pending quotes': '대기 중인 견적', 'No bookings yet': '아직 예약이 없습니다',
    'Your vehicles': '내 차량', 'Your policies': '내 보험', 'Payment method': '결제 수단',
    'Choose a plan': '플랜 선택', 'New here?': '처음이신가요?', Join: '가입', Joined: '가입됨',
    'Deals & offers · Sponsored': '혜택 & 제안 · 광고', 'What to bring': '준비물', 'Booking summary': '예약 요약',
  },
  es: {
    Home: 'Inicio', Bookings: 'Reservas', Community: 'Comunidad', More: 'Más',
    Maintenance: 'Mantenimiento', 'Compare Costs': 'Comparar costos', Settings: 'Ajustes', Profile: 'Perfil',
    Language: 'Idioma', 'Distance units': 'Unidades de distancia', Reviews: 'Reseñas', 'Quotes received': 'Cotizaciones recibidas',
    'Pay it yourself': 'Pagar tú mismo', 'Use insurance': 'Usar seguro', 'How AutoMate works': 'Cómo funciona AutoMate',
    'Why choose AutoMate?': '¿Por qué elegir AutoMate?', 'Real customer reviews': 'Reseñas reales',
    'Continue →': 'Continuar →', 'Start now →': 'Empezar →', 'Accept quote': 'Aceptar cotización',
    'Book a Service': 'Reservar servicio', 'AI Repair Estimate': 'Estimación con IA',
    'Submit for quotes →': 'Pedir cotizaciones →', 'Select damaged part': 'Selecciona la parte dañada',
    'Account details': 'Detalles de la cuenta',
    'Shops near you': 'Talleres cercanos', 'AI confidence': 'Confianza de IA', 'Write a review': 'Escribir reseña',
    'Scheduled services': 'Servicios programados', 'Pending quotes': 'Cotizaciones pendientes', 'No bookings yet': 'Aún no hay reservas',
    'Your vehicles': 'Tus vehículos', 'Your policies': 'Tus pólizas', 'Payment method': 'Método de pago',
    'Choose a plan': 'Elige un plan', 'New here?': '¿Nuevo aquí?', Join: 'Unirse', Joined: 'Unido',
    'Deals & offers · Sponsored': 'Ofertas · Patrocinado', 'What to bring': 'Qué llevar', 'Booking summary': 'Resumen de la reserva',
  },
  zh: {
    Home: '首页', Bookings: '预约', Community: '社区', More: '更多',
    Maintenance: '保养', 'Compare Costs': '费用对比', Settings: '设置', Profile: '个人资料',
    Language: '语言', 'Distance units': '距离单位', Reviews: '评价', 'Quotes received': '收到的报价',
    'Pay it yourself': '自付', 'Use insurance': '使用保险', 'How AutoMate works': 'AutoMate 如何运作',
    'Why choose AutoMate?': '为什么选择 AutoMate？', 'Real customer reviews': '真实用户评价',
    'Continue →': '继续 →', 'Start now →': '立即开始 →', 'Accept quote': '接受报价',
    'Book a Service': '预约服务', 'AI Repair Estimate': 'AI 维修估价',
    'Submit for quotes →': '提交报价请求 →', 'Select damaged part': '选择受损部位',
    'Account details': '账户信息',
    'Shops near you': '附近的店', 'AI confidence': 'AI 置信度', 'Write a review': '写评价',
    'Scheduled services': '已预约服务', 'Pending quotes': '待处理报价', 'No bookings yet': '暂无预约',
    'Your vehicles': '我的车辆', 'Your policies': '我的保单', 'Payment method': '支付方式',
    'Choose a plan': '选择套餐', 'New here?': '新用户？', Join: '加入', Joined: '已加入',
    'Deals & offers · Sponsored': '优惠 · 赞助', 'What to bring': '需要携带', 'Booking summary': '预约摘要',
  },
};

export function translate(en: string, languageName: string): string {
  const code = LANG_CODE[languageName] ?? 'en';
  if (code === 'en') return en;
  return DICT[code][en] ?? en;
}

/** Hook: `t('Home')` translates per the current Settings → Language selection. */
export function useT() {
  const language = useAppStore((s) => s.language);
  return (en: string) => translate(en, language);
}

/** Hook: distance formatter honoring Settings → Distance units (mi ↔ km). */
export function useDistance() {
  const unit = useAppStore((s) => s.distanceUnit);
  return {
    unit,
    /** Format a value given in miles into the user's chosen unit. */
    format: (mi: number, opts?: { decimals?: number }) =>
      unit === 'km'
        ? `${(mi * 1.60934).toFixed(opts?.decimals ?? 1)} km`
        : `${mi} mi`,
  };
}
