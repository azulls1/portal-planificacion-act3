# Reporte APA — entregable

Aquí va el reporte final en formato APA 7ª edición.

## Archivos esperados

| Archivo | Descripción |
|---|---|
| `reporte.docx` | Fuente editable (Word o LibreOffice) |
| `reporte.pdf` | **Entregable final** — el PDF que ve el profesor |
| `referencias.bib` | Referencias en BibTeX (opcional pero útil) |
| `figuras/` | Imágenes embebidas (SVG/PNG) |

## Estructura sugerida del documento (10-12 págs)

1. **Portada** (no cuenta en el límite si APA lo permite)
2. **Resumen / Abstract** (½ pág)
3. **Introducción** — problema de planificación clásica (1 pág)
4. **Marco teórico** — PDDL, IPC, planners optimal track (1-2 págs)
5. **Entorno de ejecución** — Singularity, Linux, fallbacks (1 pág)
6. **Ejecución de la tarea Snake (IPC2018)** — capturas + plan obtenido (1-2 págs)
7. **Modelado del problema del rover** — decisiones ADR-001..004 + plan generado (2-3 págs)
8. **Escenarios alternativos por integrante** — un sub-apartado por miembro (2 págs)
9. **Conclusiones y aprendizajes** (½ pág)
10. **Referencias** (APA 7) (½-1 pág)

## Reglas APA 7 críticas

- Tipografía: Times New Roman 12 pt o equivalente (Calibri 11, Arial 11).
- Interlineado: 2.0 (doble) en cuerpo principal.
- Márgenes: 2.54 cm en los 4 lados.
- Citas en texto: `(Autor, año, p. X)`.
- Referencias en orden alfabético, sangría francesa, no numeradas.
- DOI obligatorio si la referencia lo tiene.

## Plantilla mínima para una referencia

| Tipo | Formato |
|---|---|
| Libro | `Apellido, N. (Año). Título en cursiva (Ed.). Editorial.` |
| Artículo | `Apellido, N. (Año). Título del artículo. Revista en cursiva, vol(núm), pp. pp-pp. https://doi.org/...` |
| Página web | `Apellido, N. o Org. (Año o s. f.). Título de la página. Sitio. URL` |

## Cómo generar el PDF desde Word

1. Archivo → Exportar → Crear documento PDF/XPS.
2. Standard (publishing online and printing) → Publicar.
3. Verificar: tamaño A4, embebido de fuentes, numeración correcta.

## Cómo verificar que cumple ≤ 12 págs

- Sin contar portada: cuerpo + referencias ≤ 12 páginas.
- Si excede, mover:
  - Códigos PDDL completos → al portal (la sección `/rover`).
  - Capturas adicionales → al portal (la sección `/snake`).
  - Apéndices → al README del repo o al portal.

## Checklist pre-merge

- [ ] PDF generado y abre sin errores
- [ ] ≤ 12 páginas (excluyendo portada y referencias si APA lo permite)
- [ ] Todas las figuras numeradas: Figura 1, Figura 2, ...
- [ ] Todas las tablas numeradas: Tabla 1, Tabla 2, ...
- [ ] Referencias en orden alfabético con sangría francesa
- [ ] ≥ 5 referencias académicas verificables (no solo URLs)
- [ ] Revisado por ≥ 2 integrantes
- [ ] Sin coloquialidades ("vamos a", "como pueden ver")
