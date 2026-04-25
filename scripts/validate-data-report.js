import { existsSync, readFileSync } from 'node:fs'

const styles = JSON.parse(readFileSync(new URL('../src/data/styles.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(readFileSync(new URL('../src/data/style_manifest.json', import.meta.url), 'utf8'))
const metaTeams = JSON.parse(readFileSync(new URL('../src/data/meta_teams.json', import.meta.url), 'utf8'))
const metaTeamManifest = JSON.parse(readFileSync(new URL('../src/data/meta_team_manifest.json', import.meta.url), 'utf8'))

const styleIds = new Set(styles.map(style => style.id))
const manifestIds = new Set(Object.keys(manifest))
const metaTeamIds = new Set(metaTeams.map(team => team.id))
const metaTeamManifestIds = new Set(Object.keys(metaTeamManifest))

const warnings = {
  missingManifest: styles
    .filter(style => !manifestIds.has(style.id))
    .map(style => style.id),
  missingSourceUrl: Object.entries(manifest)
    .filter(([, entry]) => !entry.sourceUrl)
    .map(([styleId]) => styleId),
  unverifiedImages: Object.entries(manifest)
    .filter(([, entry]) => entry.imageStatus !== 'verified')
    .map(([styleId, entry]) => ({ id: styleId, imageStatus: entry.imageStatus || 'missing' })),
  filenameMismatches: styles
    .filter(style => style.image_url)
    .filter(style => {
      const fileName = style.image_url.split('/').at(-1)
      return !fileName.startsWith(style.id)
    })
    .map(style => ({ id: style.id, image_url: style.image_url })),
  generatedStyleNames: styles
    .filter(style => /style_\d+/.test(style.id) || /style_\d+/.test(style.style_name))
    .map(style => ({ id: style.id, style_name: style.style_name })),
  missingManifestStyles: Object.keys(manifest)
    .filter(styleId => !styleIds.has(styleId)),
  missingManifestImages: Object.entries(manifest)
    .filter(([, entry]) => !existsSync(new URL(`../public${entry.expectedImageUrl}`, import.meta.url)))
    .map(([styleId, entry]) => ({ id: styleId, image_url: entry.expectedImageUrl })),
  missingMetaTeamManifest: metaTeams
    .filter(team => !metaTeamManifestIds.has(team.id))
    .map(team => team.id),
  missingMetaTeamSourceUrl: Object.entries(metaTeamManifest)
    .filter(([, entry]) => !entry.sourceUrl)
    .map(([teamId]) => teamId),
  missingMetaTeamReviewedAt: Object.entries(metaTeamManifest)
    .filter(([, entry]) => !entry.reviewedAt)
    .map(([teamId]) => teamId),
  unverifiedMetaTeams: Object.entries(metaTeamManifest)
    .filter(([, entry]) => entry.reviewStatus !== 'verified')
    .map(([teamId, entry]) => ({ id: teamId, reviewStatus: entry.reviewStatus || 'missing' })),
  metaTeamManifestMismatches: Object.entries(metaTeamManifest)
    .flatMap(([teamId, entry]) => {
      const team = metaTeams.find(metaTeam => metaTeam.id === teamId)
      if (!team) return []

      return JSON.stringify(team.styles) === JSON.stringify(entry.expectedStyles)
        ? []
        : [{ id: teamId, actual: team.styles, expected: entry.expectedStyles }]
    }),
  missingMetaTeamRows: Object.keys(metaTeamManifest)
    .filter(teamId => !metaTeamIds.has(teamId))
}

const printSection = (title, items) => {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))

  if (items.length === 0) {
    console.log('None')
    return
  }

  for (const item of items) {
    console.log(typeof item === 'string' ? `- ${item}` : `- ${JSON.stringify(item)}`)
  }
}

console.log('Data validation warning report')
console.log('This report is advisory. Warnings do not fail the command.')

printSection('Styles missing manifest entries', warnings.missingManifest)
printSection('Manifest entries missing sourceUrl', warnings.missingSourceUrl)
printSection('Manifest images not verified', warnings.unverifiedImages)
printSection('Image filename mismatches', warnings.filenameMismatches)
printSection('Generated style id or name patterns', warnings.generatedStyleNames)
printSection('Manifest entries missing styles.json rows', warnings.missingManifestStyles)
printSection('Manifest entries missing local images', warnings.missingManifestImages)
printSection('Meta teams missing manifest entries', warnings.missingMetaTeamManifest)
printSection('Meta team manifest entries missing sourceUrl', warnings.missingMetaTeamSourceUrl)
printSection('Meta team manifest entries missing reviewedAt', warnings.missingMetaTeamReviewedAt)
printSection('Meta team manifests not verified', warnings.unverifiedMetaTeams)
printSection('Meta team expectedStyles mismatches', warnings.metaTeamManifestMismatches)
printSection('Meta team manifest entries missing meta_teams.json rows', warnings.missingMetaTeamRows)
