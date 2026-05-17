import { createLastfmSignature } from "../_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400 });

  const apiKey = context.env.LASTFM_API_KEY?.trim();
  const secret = context.env.LASTFM_SHARED_SECRET?.trim();
  const params = { api_key: apiKey, method: "auth.getSession", token };
  const api_sig = await createLastfmSignature(params, secret);

  const qs = new URLSearchParams({ ...params, api_sig, format: "json" });
  const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${qs}`);
  const data: any = await res.json();

  if (data.session) {
    const { key, name } = data.session;
    return Response.redirect(
      `${url.origin}/?lastfm_session=${encodeURIComponent(key)}&lastfm_user=${encodeURIComponent(name)}`,
      302
    );
  }
  const keys = Object.keys(params).sort();
  const sigStr = keys.map((k) => k + (params as any)[k]).join('');
  return new Response(`Failed | lfm=${JSON.stringify(data)} | sig_str=${sigStr}[SECRET] | api_sig=${api_sig}`, { status: 400 });
};
