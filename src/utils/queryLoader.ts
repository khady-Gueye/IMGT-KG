// src/utils/queryLoader.ts
import nunjucks from 'nunjucks';

nunjucks.configure({ autoescape: true });

/**
 * Récupère, compile et rend un template Nunjucks côté navigateur.
 * @param templateUrl URL relative depuis la racine (ex: "/templates/query.njk")
 * @param context Objet de variables injectées dans le template
 */
export async function renderQuery(
  templateUrl: string,
  context: Record<string, any>
): Promise<string> {
  // 1. fetch le template
  const res = await fetch(templateUrl);
  if (!res.ok)
    throw new Error(`Impossible de charger le template : ${res.statusText}`);
  const tpl = await res.text();

  // 2. le compiler avec Nunjucks
  return nunjucks.renderString(tpl, context);
}
