import nunjucks from "nunjucks";

export async function renderQuery(templatePath, context) {
  try {
    // Configure Nunjucks pour charger les templates
    nunjucks.configure({ autoescape: true });

    // Charger le contenu du fichier template
    const response = await fetch("/templates/query.njk");
    const template = await response.text();

    // Rendre le template avec les données du contexte
    return nunjucks.renderString(template, context);
  } catch (error) {
    console.error("Erreur lors du rendu du template :", error);
    throw error;
  }
}