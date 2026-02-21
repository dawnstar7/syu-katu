import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// URLが実際にアクセス可能か確認
async function checkUrl(url: string): Promise<{ url: string; alive: boolean; title: string }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(5000),
    });
    // HEADが405の場合はGETで試す
    if (response.status === 405) {
      const getRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      return { url, alive: getRes.ok, title: '' };
    }
    return { url, alive: response.ok || response.status === 301 || response.status === 302, title: '' };
  } catch {
    return { url, alive: false, title: '' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: '企業名が指定されていません' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1 },
    });

    // AIに企業の公式URLを生成させる
    const prompt = `
あなたは日本企業のWebサイト情報に詳しいエキスパートです。
以下の企業名について、就活生が企業研究に使う公式ページのURLを推測・生成してください。

企業名: ${companyName}

以下のJSONのみを返してください（説明文不要）：

{
  "officialDomain": "企業の公式ドメイン（例: toyota.co.jp）",
  "urls": [
    {
      "url": "採用ページの完全URL（https://から始まる）",
      "type": "recruit",
      "label": "新卒採用ページ",
      "description": "求める人物像・選考フローなどが記載"
    },
    {
      "url": "企業理念・About ページの完全URL",
      "type": "about",
      "label": "企業理念・会社概要",
      "description": "ミッション・ビジョン・バリューなどが記載"
    },
    {
      "url": "IR・投資家情報ページの完全URL",
      "type": "ir",
      "label": "IR・投資家情報",
      "description": "決算情報・中期経営計画などが記載"
    },
    {
      "url": "事業内容・サービス紹介ページのURL",
      "type": "business",
      "label": "事業内容・サービス",
      "description": "主要事業・サービスの説明"
    },
    {
      "url": "ニュースリリース・プレスリリースのURL",
      "type": "news",
      "label": "ニュース・プレスリリース",
      "description": "最新の会社動向"
    }
  ]
}

重要なルール：
- URLは実在する可能性が高い正確なURLを生成してください
- 日本の大手企業は recruit.${companyName}.co.jp や ${companyName}.co.jp/recruit などが多い
- 推測できない場合はそのURLを省いてください
- 必ずhttps://から始まる完全なURLにしてください
- 架空のURLは生成しないでください。知っているURLのみ返してください
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let jsonText = responseText;
    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (match) jsonText = match[1];
    }

    const urlData = JSON.parse(jsonText);

    // 並列でURLの生存確認
    const checkedUrls = await Promise.all(
      urlData.urls.map(async (item: any) => {
        const check = await checkUrl(item.url);
        return {
          ...item,
          alive: check.alive,
        };
      })
    );

    return NextResponse.json({
      officialDomain: urlData.officialDomain,
      urls: checkedUrls,
    });

  } catch (error) {
    console.error('URL検索に失敗:', error);
    return NextResponse.json(
      {
        error: 'URLの検索に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
