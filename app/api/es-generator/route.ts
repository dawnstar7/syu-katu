import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      characterLimit,
      tone,
      companyName,
      companyDescription,
      companyIndustry,
      jobType,
      companyAnalysis,
      selectedEpisodes,
      selectedStrengths,
      values,
      vision,
    } = body;

    if (!question) {
      return NextResponse.json({ error: 'ES設問が指定されていません' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.8 },
    });

    // 自己分析データを整形
    const episodesText = selectedEpisodes?.length > 0
      ? selectedEpisodes.map((ep: any, i: number) => `
【エピソード${i + 1}】${ep.title}（${ep.category}）
- 何をしたか: ${ep.what}
- なぜしたか: ${ep.why}
- どのように: ${ep.how}
- 結果: ${ep.result}
- 学んだこと: ${ep.learning}
`).join('\n')
      : '（エピソードなし）';

    const strengthsText = selectedStrengths?.length > 0
      ? selectedStrengths.map((s: any) => `・${s.name}: ${s.description}（根拠: ${s.evidence}）`).join('\n')
      : '（強みデータなし）';

    const valuesText = values
      ? `大切にしていること: ${values.importantValues}\nモチベーションの源泉: ${values.motivationSource}\n人生の軸: ${values.lifeAxis}`
      : '（価値観データなし）';

    const visionText = vision
      ? `短期目標（1-3年）: ${vision.shortTerm}\n中期目標（5年）: ${vision.midTerm}\n理想のキャリア: ${vision.idealCareer}`
      : '（将来ビジョンデータなし）';

    const companyAnalysisText = companyAnalysis
      ? `志望理由: ${companyAnalysis.whyThisCompany || '未入力'}\n入社後にやりたいこと: ${companyAnalysis.whatYouWantToDo || '未入力'}\nカルチャーフィット: ${companyAnalysis.cultureFit || '未入力'}`
      : '（企業分析データなし）';

    const toneMap: Record<string, string> = {
      passionate: '情熱的で熱意が伝わる文体',
      calm: '落ち着いて冷静な文体',
      humble: '謙虚で誠実な文体',
      logical: '論理的で明確な文体',
    };
    const toneDescription = toneMap[tone] || '自然な文体';

    const prompt = `
あなたは就職活動のESライティングの専門家です。
以下の情報をもとに、企業に響く具体的で魅力的なES回答を生成してください。

## 対象企業
- 企業名: ${companyName || '未設定'}
- 業界: ${companyIndustry || '未設定'}
- 職種: ${jobType || '未設定'}
- 企業説明: ${companyDescription || '未設定'}

## ES設問
${question}

## 文字数制限
${characterLimit ? `${characterLimit}文字以内` : '文字数制限なし（400〜600文字程度を目安に）'}

## 文体・トーン
${toneDescription}

## 応募者の自己分析データ

### 活用するエピソード
${episodesText}

### 強み
${strengthsText}

### 価値観・モチベーション
${valuesText}

### 将来ビジョン
${visionText}

### この企業への分析
${companyAnalysisText}

## 生成ルール
1. 上記の自己分析データを最大限活用して、具体的なエピソードや強みを盛り込む
2. 企業の特徴や業界に合わせた内容にする
3. STAR法（Situation・Task・Action・Result）を意識して書く
4. 抽象的な表現を避け、数字や具体例を使う
5. 文字数制限がある場合は厳守する（制限文字数の90〜100%を目安に）
6. 設問に正確に答える内容にする
7. 回答のみを返し、説明文や補足は不要

ES回答のみを返してください：
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text().trim();

    return NextResponse.json({ generatedText, characterCount: generatedText.length });
  } catch (error) {
    console.error('ES生成に失敗:', error);
    return NextResponse.json(
      {
        error: 'ES文章の生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
