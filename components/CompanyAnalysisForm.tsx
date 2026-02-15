'use client';

import type { CompanyAnalysis } from '@/types';

interface CompanyAnalysisFormProps {
  analysis: CompanyAnalysis;
  onChange: (analysis: CompanyAnalysis) => void;
}

export default function CompanyAnalysisForm({ analysis, onChange }: CompanyAnalysisFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">企業分析メモ</h3>
        <p className="text-sm text-gray-600 mb-4">
          自分にとってのその企業を言語化し、面接対策に活用しましょう
        </p>

        <div className="space-y-4">
          {/* なぜこの会社か */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              なぜこの会社か？
            </label>
            <p className="text-xs text-gray-500 mb-2">
              競合他社と比較した際の、自分なりの決定打を言語化
            </p>
            <textarea
              value={analysis.whyThisCompany || ''}
              onChange={(e) =>
                onChange({ ...analysis, whyThisCompany: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 他社と比較して、〇〇な点に魅力を感じた。特に△△という事業領域で..."
            />
          </div>

          {/* 社員の印象 */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              社員の印象メモ
            </label>
            <p className="text-xs text-gray-500 mb-2">
              説明会やOB・OG訪問で感じた「人」の雰囲気
            </p>
            <textarea
              value={analysis.employeeImpression || ''}
              onChange={(e) =>
                onChange({ ...analysis, employeeImpression: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 〇〇さんの働き方に憧れた。説明会で感じた雰囲気は..."
            />
          </div>

          {/* 自分とのマッチ度 */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              自分とのマッチ度分析
            </label>
            <p className="text-xs text-gray-500 mb-2">
              自分の強みがその企業のどういう場面で活かせそうか
            </p>
            <textarea
              value={analysis.matchingPoints || ''}
              onChange={(e) =>
                onChange({ ...analysis, matchingPoints: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 自分の〇〇という強みは、この企業の△△という場面で活かせると考える..."
            />
          </div>

          {/* 懸念点・確認したいこと */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              懸念点・確認したいこと
            </label>
            <p className="text-xs text-gray-500 mb-2">
              給与、残業、配属リスクなど、聞きにくいけれど整理しておきたい点
            </p>
            <textarea
              value={analysis.concerns || ''}
              onChange={(e) =>
                onChange({ ...analysis, concerns: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 配属リスクについて確認したい。残業時間の実態は..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
