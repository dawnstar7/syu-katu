'use client';

import { useState, useEffect } from 'react';
import type { FutureVision } from '@/types';

interface VisionManagerProps {
  vision: FutureVision | null;
  onChange: (vision: FutureVision | null) => void;
}

export default function VisionManager({ vision, onChange }: VisionManagerProps) {
  const [formData, setFormData] = useState({
    shortTerm: '',
    midTerm: '',
    longTerm: '',
    socialContribution: '',
    idealCareer: '',
  });

  useEffect(() => {
    if (vision) {
      setFormData({
        shortTerm: vision.shortTerm,
        midTerm: vision.midTerm,
        longTerm: vision.longTerm,
        socialContribution: vision.socialContribution,
        idealCareer: vision.idealCareer,
      });
    }
  }, [vision]);

  const handleSave = () => {
    const newVision: FutureVision = {
      id: vision?.id || Date.now().toString(),
      ...formData,
      createdAt: vision?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onChange(newVision);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">将来ビジョン</h2>
        <p className="text-sm text-gray-600 mt-1">
          あなたの描く未来を具体的に言語化しましょう
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            短期（1-3年後）
          </label>
          <p className="text-xs text-gray-500 mb-2">
            入社してすぐ〜数年後、どうなっていたいですか？
          </p>
          <textarea
            value={formData.shortTerm}
            onChange={(e) => setFormData({ ...formData, shortTerm: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: 基礎スキルを身につけ、一人前のプロジェクトメンバーとして貢献できるようになる..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            中期（5年後）
          </label>
          <p className="text-xs text-gray-500 mb-2">5年後、あなたはどんな立場で何をしていますか？</p>
          <textarea
            value={formData.midTerm}
            onChange={(e) => setFormData({ ...formData, midTerm: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: プロジェクトリーダーとして、チームを率いながら新規事業の立ち上げに携わる..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            長期（10年後）
          </label>
          <p className="text-xs text-gray-500 mb-2">
            10年後、理想の自分はどんな状態ですか？
          </p>
          <textarea
            value={formData.longTerm}
            onChange={(e) => setFormData({ ...formData, longTerm: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: 経営層の一員として、企業の方向性を決める立場に..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            社会への貢献
          </label>
          <p className="text-xs text-gray-500 mb-2">
            あなたの仕事を通じて、社会にどんな価値を提供したいですか？
          </p>
          <textarea
            value={formData.socialContribution}
            onChange={(e) =>
              setFormData({ ...formData, socialContribution: e.target.value })
            }
            rows={5}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: テクノロジーを通じて、人々の生活をより豊かに..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            理想のキャリア
          </label>
          <p className="text-xs text-gray-500 mb-2">
            どんな経験を積み、どんなキャリアパスを歩みたいですか？
          </p>
          <textarea
            value={formData.idealCareer}
            onChange={(e) => setFormData({ ...formData, idealCareer: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: まず現場で経験を積み、その後マネジメントを学び、最終的には..."
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          保存する
        </button>
      </div>
    </div>
  );
}
