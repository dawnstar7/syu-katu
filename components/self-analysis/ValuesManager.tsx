'use client';

import { useState, useEffect } from 'react';
import type { ValueAndMotivation } from '@/types';

interface ValuesManagerProps {
  values: ValueAndMotivation | null;
  onChange: (values: ValueAndMotivation | null) => void;
}

export default function ValuesManager({ values, onChange }: ValuesManagerProps) {
  const [formData, setFormData] = useState({
    importantValues: '',
    motivationSource: '',
    excitingMoments: '',
    lifeAxis: '',
  });

  useEffect(() => {
    if (values) {
      setFormData({
        importantValues: values.importantValues,
        motivationSource: values.motivationSource,
        excitingMoments: values.excitingMoments,
        lifeAxis: values.lifeAxis,
      });
    }
  }, [values]);

  const handleSave = () => {
    const newValues: ValueAndMotivation = {
      id: values?.id || Date.now().toString(),
      ...formData,
      createdAt: values?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onChange(newValues);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">価値観・モチベーション</h2>
        <p className="text-sm text-gray-600 mt-1">
          あなたの内面的な軸を言語化しましょう
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            大切にしていること
          </label>
          <p className="text-xs text-gray-500 mb-2">
            人生において、仕事において、あなたが最も大切にしている価値観は何ですか？
          </p>
          <textarea
            value={formData.importantValues}
            onChange={(e) =>
              setFormData({ ...formData, importantValues: e.target.value })
            }
            rows={5}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: 人との信頼関係、誠実さ、挑戦し続けること..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            モチベーションの源泉
          </label>
          <p className="text-xs text-gray-500 mb-2">
            何があなたを動かしますか？どんな時に「やる気」が湧きますか？
          </p>
          <textarea
            value={formData.motivationSource}
            onChange={(e) =>
              setFormData({ ...formData, motivationSource: e.target.value })
            }
            rows={5}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: 困っている人を助けること、新しいことに挑戦すること..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            ワクワクする瞬間
          </label>
          <p className="text-xs text-gray-500 mb-2">
            どんな状況や活動の時に、心から楽しいと感じますか？
          </p>
          <textarea
            value={formData.excitingMoments}
            onChange={(e) =>
              setFormData({ ...formData, excitingMoments: e.target.value })
            }
            rows={5}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: チームで目標を達成した瞬間、アイデアが形になる過程..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            人生の軸
          </label>
          <p className="text-xs text-gray-500 mb-2">
            あなたの人生を貫く一本の軸は何ですか？判断基準となる核心は？
          </p>
          <textarea
            value={formData.lifeAxis}
            onChange={(e) => setFormData({ ...formData, lifeAxis: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: 「成長し続けること」「誰かの役に立つこと」..."
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
