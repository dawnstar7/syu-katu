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
あなたは企業情報検索のエキスパートです。
ユーザーが入力した企業名から、最も可能性の高い日本企業を特定し、その情報をJSON形式で返してください。

入力された企業名: ${companyName}

**重要な指示:**
1. 入力された企業名が略称や通称でも、正式名称を推測して情報を返してください
   例: "トヨタ" → "トヨタ自動車株式会社"
   例: "楽天" → "楽天グループ株式会社"
   例: "サイバー" → "株式会社サイバーエージェント"
   例: "メルカリ" → "株式会社メルカリ"
   例: "ソニー" → "ソニーグループ株式会社"

2. できるだけ多くの情報を埋めてください（不明な場合のみ空文字列）

3. 以下のJSON形式で返してください（JSONのみを返し、説明文は不要）：
{
  "name": "正式な企業名（株式会社などの法人格を含む）",
  "industry": "業界（IT、製造業、金融、小売、サービス業など）",
  "employeeCount": "従業員数（約○○名、○○名以上など）",
  "location": "本社所在地（都道府県市区町村）",
  "website": "公式ホームページURL（https://...）",
  "description": "企業の主な事業内容や特徴を100文字程度で簡潔に",
  "jobType": "主な職種（エンジニア、営業、企画、マーケティングなど、カンマ区切り）",
  "salary": "新卒初任給の目安（月給○○万円など、分かる場合のみ）",
  "workLocation": "主な勤務地（東京都、大阪府など、カンマ区切り）",
  "benefits": "主な福利厚生（社会保険完備、リモートワーク可、住宅手当など）"
}

JSONのみを返してください（マークダウンのコードブロックも不要です）。
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

    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('エラースタック:', error.stack);
    }

    return NextResponse.json(
      {
        error: '企業情報の取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}
