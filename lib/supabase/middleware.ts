import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      const dashboardApi =
        "https://supabase.com/dashboard/project/aqsdyoonbvofolugtxyz/settings/api";
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VulnRadar — variables Supabase</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #111; }
    code { background: #f4f4f5; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
    a { color: #2563eb; }
    ol { padding-left: 1.25rem; }
  </style>
</head>
<body>
  <h1>Configuración pendiente</h1>
  <p>El middleware necesita la <strong>anon public key</strong> de Supabase. Ahora mismo <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> está vacía o no existe.</p>
  <ol>
    <li>Abre <a href="${dashboardApi}" target="_blank" rel="noopener">API settings del proyecto</a>.</li>
    <li>Copia <code>anon</code> <code>public</code> y pégala en <code>.env</code> o <code>.env.local</code>:</li>
  </ol>
  <pre><code>NEXT_PUBLIC_SUPABASE_URL=https://aqsdyoonbvofolugtxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui</code></pre>
  <p>Guarda el archivo y <strong>reinicia</strong> <code>npm run dev</code> (Next solo relee el entorno al arrancar).</p>
</body>
</html>`;
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return new NextResponse("Service configuration error.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresca la sesión si está cerca de expirar.
  // No usar entre createServerClient y getUser — romper este orden hace
  // que las sesiones desaparezcan aleatoriamente (issue conocido @supabase/ssr).
  await supabase.auth.getUser();

  return supabaseResponse;
}
