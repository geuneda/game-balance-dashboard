export interface TutorialStep {
  id: string;
  number: number;
  phase: string;
  description: string;
}

export const TUTORIAL_STEPS: Record<string, TutorialStep> = {
  '01': { id: '01', number: 1, phase: '이니셜 런치', description: 'TutorialText1 탭' },
  '02': { id: '02', number: 2, phase: '이니셜 런치', description: 'TutorialText2 탭' },
  '03': { id: '03', number: 3, phase: '이니셜 런치', description: 'TutorialText3 탭' },
  '04': { id: '04', number: 4, phase: '이니셜 런치', description: '첫 전투 1번째 카드 선택' },
  '05': { id: '05', number: 5, phase: '이니셜 런치', description: '첫 전투 2번째 카드 선택' },
  '06': { id: '06', number: 6, phase: '이니셜 런치', description: '첫 전투 3번째 카드 선택' },
  '07': { id: '07', number: 7, phase: '이니셜 런치', description: '첫 전투 4번째 카드 선택' },
  '08': { id: '08', number: 8, phase: '이니셜 런치', description: '첫 전투 5번째 카드 선택' },
  '09': { id: '09', number: 9, phase: '이니셜 런치', description: '첫 전투 6번째 카드 선택' },
  '10': { id: '10', number: 10, phase: '이니셜 런치', description: '첫 전투 7번째 카드 선택' },
  '11': { id: '11', number: 11, phase: '이니셜 런치', description: '첫 전투 8번째 카드 선택' },
  '12': { id: '12', number: 12, phase: '이니셜 런치', description: '첫 전투 9번째 카드 선택' },
  '13': { id: '13', number: 13, phase: '이니셜 런치', description: '첫 전투 10번째 카드 선택' },
  '14': { id: '14', number: 14, phase: '이니셜 런치', description: '첫 전투 11번째 카드 선택' },
  '15': { id: '15', number: 15, phase: '이니셜 런치', description: '첫 전투 12번째 카드 선택' },
  '16': { id: '16', number: 16, phase: '이니셜 런치', description: '첫 전투 13번째 카드 선택' },
  '17': { id: '17', number: 17, phase: '이니셜 런치', description: '첫 전투 14번째 카드 선택' },
  '18': { id: '18', number: 18, phase: '이니셜 런치', description: '첫 전투 15번째 카드 선택' },
  '19': { id: '19', number: 19, phase: '이니셜 런치', description: '첫 전투 16번째 카드 선택' },
  '20': { id: '20', number: 20, phase: '이니셜 런치', description: '첫 전투 17번째 카드 선택' },
  '21': { id: '21', number: 21, phase: '이니셜 런치', description: '첫 전투 18번째 카드 선택' },
  '22': { id: '22', number: 22, phase: '이니셜 런치', description: '첫 전투 19번째 카드 선택' },
  '23': { id: '23', number: 23, phase: '이니셜 런치', description: 'TutorialText4 탭' },
  '24': { id: '24', number: 24, phase: '이니셜 런치', description: '미수령 버튼 최초 탭' },
  '25': { id: '25', number: 25, phase: '이니셜 런치', description: '클리어 보물상자 최초 탭' },
  '26': { id: '26', number: 26, phase: '이니셜 런치', description: '클리어 보물상자 닫힘' },
  '27': { id: '27', number: 27, phase: '이니셜 런치', description: '영웅 메뉴 최초 탭' },
  '28': { id: '28', number: 28, phase: '이니셜 런치', description: '최초 칩 아이콘 탭' },
  '29': { id: '29', number: 29, phase: '이니셜 런치', description: '최초 칩 장착 버튼 탭' },
  '30': { id: '30', number: 30, phase: '이니셜 런치', description: '최초 장비 탭 탭' },
  '31': { id: '31', number: 31, phase: '이니셜 런치', description: '최초 장비 아이콘 탭' },
  '32': { id: '32', number: 32, phase: '이니셜 런치', description: '최초 장비 장착 버튼 탭' },
  '33': { id: '33', number: 33, phase: '이니셜 런치', description: '진급 메뉴 최초 탭' },
  '34': { id: '34', number: 34, phase: '이니셜 런치', description: '업그레이드 버튼 최초 탭' },
  '35': { id: '35', number: 35, phase: '이니셜 런치', description: '진급 팝업에서 뒤로가기 최초 탭' },
  '36': { id: '36', number: 36, phase: '이니셜 런치', description: '로비 메뉴 최초 탭' },
  '37': { id: '37', number: 37, phase: '이니셜 런치', description: 'TutorialText5 탭' },
  '38': { id: '38', number: 38, phase: '이니셜 런치', description: '전투 시작 버튼 최초 탭' },
  '39': { id: '39', number: 39, phase: '이니셜 런치', description: '둘째 전투 1번째 카드 선택' },
  '40': { id: '40', number: 40, phase: '이니셜 런치', description: '둘째 전투 2번째 카드 선택' },
  '41': { id: '41', number: 41, phase: '이니셜 런치', description: '둘째 전투 3번째 카드 선택' },
  '42': { id: '42', number: 42, phase: '이니셜 런치', description: '둘째 전투 4번째 카드 선택' },
  '43': { id: '43', number: 43, phase: '이니셜 런치', description: '둘째 전투 5번째 카드 선택' },
  '44': { id: '44', number: 44, phase: '이니셜 런치', description: '둘째 전투 6번째 카드 선택' },
  '45': { id: '45', number: 45, phase: '이니셜 런치', description: '둘째 전투 7번째 카드 선택' },
  '46': { id: '46', number: 46, phase: '이니셜 런치', description: '둘째 전투 8번째 카드 선택' },
  '47': { id: '47', number: 47, phase: '이니셜 런치', description: '둘째 전투 9번째 카드 선택' },
  '48': { id: '48', number: 48, phase: '이니셜 런치', description: '둘째 전투 10번째 카드 선택' },
  '49': { id: '49', number: 49, phase: '이니셜 런치', description: '둘째 전투 11번째 카드 선택' },
  '50': { id: '50', number: 50, phase: '이니셜 런치', description: '둘째 전투 12번째 카드 선택' },
  '51': { id: '51', number: 51, phase: '이니셜 런치', description: '둘째 전투 13번째 카드 선택' },
  '52': { id: '52', number: 52, phase: '이니셜 런치', description: '둘째 전투 14번째 카드 선택' },
  '53': { id: '53', number: 53, phase: '이니셜 런치', description: '둘째 전투 15번째 카드 선택' },
  '54': { id: '54', number: 54, phase: '이니셜 런치', description: '둘째 전투 16번째 카드 선택' },
  '55': { id: '55', number: 55, phase: '이니셜 런치', description: '둘째 전투 17번째 카드 선택' },
  '56': { id: '56', number: 56, phase: '이니셜 런치', description: '둘째 전투 18번째 카드 선택' },
  '57': { id: '57', number: 57, phase: '이니셜 런치', description: '둘째 전투 19번째 카드 선택' },
  '58': { id: '58', number: 58, phase: '이니셜 런치', description: '유닛 업그레이드 메뉴 최초 탭' },
  '59': { id: '59', number: 59, phase: '이니셜 런치', description: '미사일 포탑 업그레이드 메뉴 최초 탭' },
  '60': { id: '60', number: 60, phase: '이니셜 런치', description: '미사일 포탑 업그레이드 버튼 최초 탭' },
  '61': { id: '61', number: 61, phase: '이니셜 런치', description: 'TutorialText6 탭' },
  '62': { id: '62', number: 62, phase: '이니셜 런치', description: '3번째 전투 강제 시작 시' },
  '63': { id: '63', number: 63, phase: '이니셜 런치', description: '튜토리얼 중 스테이지1 패배 처리될 뻔할 때' },
};

/**
 * Get tutorial step description
 * @param stepId Tutorial step ID (e.g., "01", "02", etc.)
 * @returns Formatted tutorial step description
 */
export function getTutorialDescription(stepId: string): string {
  const step = TUTORIAL_STEPS[stepId];
  if (!step) {
    return `튜토리얼 ${stepId}`;
  }
  return `${step.number}. ${step.description}`;
}

/**
 * Get short tutorial description (for charts)
 * @param stepId Tutorial step ID
 * @returns Short description
 */
export function getTutorialShortDescription(stepId: string): string {
  const step = TUTORIAL_STEPS[stepId];
  if (!step) {
    return stepId;
  }

  // Simplify descriptions for chart display
  const desc = step.description;

  // Extract key information
  if (desc.includes('TutorialText')) {
    return `${step.number}. 텍스트${desc.match(/\d+/)?.[0] || ''}`;
  }
  if (desc.includes('번째 카드')) {
    const cardNum = desc.match(/(\d+)번째 카드/)?.[1];
    if (desc.includes('첫 전투')) return `${step.number}. 첫전투 카드${cardNum}`;
    if (desc.includes('둘째 전투')) return `${step.number}. 둘째전투 카드${cardNum}`;
  }
  if (desc.includes('최초 탭')) {
    const shortDesc = desc.replace('최초 탭', '').trim();
    return `${step.number}. ${shortDesc}`;
  }

  // Default: use first 10 characters
  return `${step.number}. ${desc.substring(0, 10)}...`;
}

/**
 * Group tutorial steps by phase
 */
export function getTutorialPhases(): Array<{ phase: string; steps: TutorialStep[] }> {
  const phases = new Map<string, TutorialStep[]>();

  Object.values(TUTORIAL_STEPS).forEach(step => {
    if (!phases.has(step.phase)) {
      phases.set(step.phase, []);
    }
    phases.get(step.phase)!.push(step);
  });

  return Array.from(phases.entries()).map(([phase, steps]) => ({
    phase,
    steps: steps.sort((a, b) => a.number - b.number)
  }));
}
