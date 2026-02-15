import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, selfAnalysisData } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // システムプロンプト
    const systemPrompt = `あなたは就活生の自己分析をサポートする優秀なキャリアコーチです。

ユーザーの自己分析データ：
${JSON.stringify(selfAnalysisData, null, 2)}

あなたの役割：
1. ユーザーの回答を傾聴し、深掘りする質問を投げかける
2. 具体的なエピソードを引き出し、「なぜ」「どのように」を明確にする
3. ユーザーの強みや価値観を言語化するサポートをする
4. 矛盾点や曖昧な点があれば、優しく指摘し明確化を促す
5. ポジティブで前向きな姿勢を保ちながら、建設的なフィードバックを提供する

対話のポイント：
- 一度に1〜2つの質問に絞る（質問攻めにしない）
- 具体例を求める（「例えば？」「具体的には？」）
- 感情にも注目する（「その時どう感じましたか？」）
- ユーザーの言葉を反復して理解を示す
- 適度に励ましやポジティブフィードバックを入れる

回答は親しみやすく、でもプロフェッショナルなトーンで。`;

    // 会話履歴の構築
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'model',
          parts: [{ text: systemPrompt }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('AIコーチエラー:', error);
    return NextResponse.json(
      { error: 'AIコーチとの通信に失敗しました' },
      { status: 500 }
    );
  }
}
