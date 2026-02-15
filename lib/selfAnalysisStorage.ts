import type { SelfAnalysisData } from '@/types';

const SELF_ANALYSIS_KEY = 'job-hunt-self-analysis';

// 初期データ
const getInitialSelfAnalysisData = (): SelfAnalysisData => ({
  episodes: [],
  values: null,
  strengths: [],
  weaknesses: [],
  vision: null,
});

// 自己分析データを読み込む
export const loadSelfAnalysisData = (): SelfAnalysisData => {
  if (typeof window === 'undefined') {
    return getInitialSelfAnalysisData();
  }

  try {
    const stored = localStorage.getItem(SELF_ANALYSIS_KEY);
    if (!stored) {
      return getInitialSelfAnalysisData();
    }

    const data = JSON.parse(stored);

    // Date型の復元
    data.episodes = data.episodes.map((ep: any) => ({
      ...ep,
      createdAt: new Date(ep.createdAt),
      updatedAt: new Date(ep.updatedAt),
    }));

    if (data.values) {
      data.values.createdAt = new Date(data.values.createdAt);
      data.values.updatedAt = new Date(data.values.updatedAt);
    }

    data.strengths = data.strengths.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));

    data.weaknesses = data.weaknesses.map((w: any) => ({
      ...w,
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt),
    }));

    if (data.vision) {
      data.vision.createdAt = new Date(data.vision.createdAt);
      data.vision.updatedAt = new Date(data.vision.updatedAt);
    }

    return data;
  } catch (error) {
    console.error('自己分析データの読み込みエラー:', error);
    return getInitialSelfAnalysisData();
  }
};

// 自己分析データを保存する
export const saveSelfAnalysisData = (data: SelfAnalysisData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SELF_ANALYSIS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('自己分析データの保存エラー:', error);
  }
};
