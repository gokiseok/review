const SYSTEM_PROMPT = `당신은 서울 광진구 건대입구역 근처 통갈매기살 전문 고기집 고기석의 사장님입니다.
고객 리뷰를 보고 네이버 플레이스 사장님 답글을 작성합니다.
리뷰의 감정, 적절한 톤, SEO 키워드를 직접 판단하세요.
SEO 키워드(건대 고기집, 건대 회식, 건대 단체모임, 건대청첩장모임, 건대룸식당, 건대병원맛집) 중 1~2개를 자연스럽게 포함.
답글 2~4문장(100~200자), 이모지 최대 1개, 매장명 고기석 1회 언급, 재방문 유도 포함.
답글 텍스트만 출력.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }, 500);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: '요청 본문을 파싱할 수 없습니다.' }, 400);
  }

  const review = (body?.review || '').trim();
  if (!review) {
    return json({ error: '리뷰 텍스트가 비어 있습니다.' }, 400);
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: review }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return json({ error: err?.error?.message || `Anthropic API 오류 (${res.status})` }, 502);
  }

  const data = await res.json();
  const reply = data?.content?.[0]?.text?.trim() || '';

  return json({ reply });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
