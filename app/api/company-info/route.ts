import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: '企業名が指定されていません' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini APIキーが設定されていません' },
        { status: 500 }
      );
    }

    // Gemini Pro モデルを使用
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // プロンプトを構築
    const prompt = `
以下の企業について、正確な情報を調査して、JSON形式で返してください。
情報が不明な場合は、その項目を空文字列または省略してください。

企業名: ${companyName}

以下のJSON形式で返してください（JSONのみを返し、他の説明文は不要です）：
{
  "name": "正式な企業名",
  "industry": "業界（例: IT、製造業、金融、小売など）",
  "employeeCount": "従業員数（例: 100名、1000名以上など）",
  "location": "本社所在地（都道府県市区町村レベル）",
  "website": "公式ホームページURL",
  "description": "企業の事業内容や特徴を100文字程度で簡潔に説明",
  "jobType": "主な職種（例: エンジニア、営業、企画など。複数ある場合はカンマ区切り）",
  "salary": "新卒初任給の目安（わかる場合のみ）",
  "workLocation": "主な勤務地（複数ある場合はカンマ区切り）",
  "benefits": "主な福利厚生（例: 社会保険完備、リモートワーク可など）"
}

注意事項:
- 実在する企業の正確な情報のみを返してください
- 不明な項目は空文字列にしてください
- JSONのみを返してください（\`\`\`json などのマークダウンは不要です）
`;

    // Gemini APIを呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONを抽出（マークダウンのコードブロックを除去）
    let jsonText = text.trim();

    // ```json ... ``` の形式の場合は中身を抽出
    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (match) {
        jsonText = match[1];
      }
    }

    // JSONをパース
    const companyInfo = JSON.parse(jsonText);

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('企業情報の取得に失敗:', error);
    return NextResponse.json(
      { error: '企業情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
