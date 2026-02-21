import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// URLからページ内容を取得する関数
async function fetchPageContent(url: string): Promise<{ content: string; title: string; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { content: '', title: url, error: `HTTP ${response.status}` };
    }

    const html = await response.text();

    // HTMLタグを除去してテキストを抽出
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : url;

    // スクリプト・スタイル・ナビゲーションなどを除去
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s{2,}/g, ' ')
      .trim();

    // 文字数を制限（多すぎるとAPIコストが増大）
    if (text.length > 8000) {
      text = text.substring(0, 8000) + '...（省略）';
    }

    return { content: text, title };
  } catch (error) {
    return {
      content: '',
      title: url,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls, companyName } = await request.json();

    if (!urls || urls.length === 0) {
      return NextResponse.json({ error: 'URLが指定されていません' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません' }, { status: 500 });
    }

    // 各URLのコンテンツを並列取得
    const pageContents = await Promise.all(
      urls.map(async (url: string) => {
        const result = await fetchPageContent(url.trim());
        return { url: url.trim(), ...result };
      })
    );

    // 成功したページのみ使用
    const validPages = pageContents.filter(p => p.content && !p.error);
    const failedPages = pageContents.filter(p => p.error);

    if (validPages.length === 0) {
      return NextResponse.json({
        error: 'URLからコンテンツを取得できませんでした。URLを確認してください。',
        failedPages: failedPages.map(p => ({ url: p.url, error: p.error })),
      }, { status: 400 });
    }

    // AI分析用のプロンプトを構築
    const pagesText = validPages.map((p, i) => `
【ページ${i + 1}】
URL: ${p.url}
タイトル: ${p.title}
内容:
${p.content}
`).join('\n---\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.3 },
    });

    const prompt = `
あなたは就職活動をサポートする企業研究のエキスパートです。
以下の${validPages.length}つのWebページを分析し、就活生が企業研究に必要な情報を構造化して抽出してください。

対象企業名: ${companyName || '不明'}

## 取得したページ内容
${pagesText}

## 抽出してほしい情報

以下のJSON形式で返してください（JSONのみ、説明文不要）：

{
  "companyOverview": {
    "summary": "企業の事業内容・ビジネスモデルの要約（200文字程度）",
    "strengths": ["強み1（ソース: URLのタイトル or URL）", "強み2（ソース: ...）"],
    "challenges": ["課題・リスク1（ソース: ...）", "課題・リスク2（ソース: ...）"],
    "businessAreas": ["主要事業1", "主要事業2"]
  },
  "culture": {
    "philosophy": "企業理念・ミッション・ビジョン（ソース: URL）",
    "values": ["大切にしている価値観1", "大切にしている価値観2"],
    "workStyle": "働き方・職場環境の特徴"
  },
  "recruitment": {
    "targetPersonality": "求める人物像（ソース: URL）",
    "requiredSkills": ["求められるスキル・素質1", "求められるスキル・素質2"],
    "careerPath": "キャリアパス・成長機会の説明",
    "appealPoints": "採用ページからわかる、この会社で働く魅力"
  },
  "strategy": {
    "futureDirection": "今後の方向性・中期経営計画の要点",
    "growthAreas": ["注力している事業・領域1", "注力している事業・領域2"]
  },
  "interviewPrep": {
    "likelyQuestions": ["面接で聞かれそうな質問1", "面接で聞かれそうな質問2", "面接で聞かれそうな質問3"],
    "keywordsToUse": ["面接で使うべきキーワード1", "面接で使うべきキーワード2"]
  },
  "sources": [
    {"url": "取得したURL1", "title": "ページタイトル1", "usedFor": "何の情報に使ったか"},
    {"url": "取得したURL2", "title": "ページタイトル2", "usedFor": "何の情報に使ったか"}
  ],
  "rawSummaryForAnalysis": "企業分析メモ用の総合要約（志望動機や自己PRに使える形で300文字程度）"
}

情報が見つからない項目は空文字列や空配列にしてください。
ソース元は必ずURLまたはページタイトルで明示してください。
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // JSONを抽出
    let jsonText = responseText;
    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (match) jsonText = match[1];
    }

    const analysisResult = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      fetchedPages: validPages.map(p => ({ url: p.url, title: p.title })),
      failedPages: failedPages.map(p => ({ url: p.url, error: p.error })),
    });
  } catch (error) {
    console.error('企業研究に失敗:', error);
    return NextResponse.json(
      {
        error: '企業研究の実行に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
