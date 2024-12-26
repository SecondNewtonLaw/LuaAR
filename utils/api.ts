const definitiveDeprecated = [
	/^\s*(wait|delay|spawn)\s*(\([^\)]*\))?\s*$/i,
	/\bSetPrimaryPartCFrame\b/i,
	/\bgame\.Chat\b/i,
	/\bGetService\s*\(\s*["']Chat["']\s*\)/i,
	/\bGamePassService\b/i,
	/\bJointsService\b/i,
	/\bPointsService\b/i,
	/\bBodyVelocity\b/i,
	/\bBodyGyro\b/i,
	/\bBodyPosition\b/i,
	/\bBodyAngularVelocity\b/i,
	/\bBodyThrust\b/i,
	/\bBodyForce\b/i,
	/\bCylinderMesh\b/i,
	/\bFindFirstDescendant\b/i,
	/\bFindFirstDescendantWhichIsA\b/i,
	/\bFindFirstDescendantWhichIsA\b/i,
	/\bFindPartOnRayWithIgnoreList\b/i,
	/\bFindPartOnRay\b/i,
	/\bFindPartsInRegion3WithIgnoreList\b/i,
	/\bFindPartsInRegion3\b/i,
	/\bIntConstrainedValue\b/i,
	/\bRocketPropulsion\b/i,
	/\bSelectionPartLasso\b/i,
	/\bItemChanged\b/i,
	/\bKeyDown\b/i,
	/\bKeyUp\b/i,
	/\bGetModelCFrame\b/i,
]

const possibleDeprecated = [
	/^\s*LoadAnimation\s*(\([^\)]*\))?\s*$/i,
	/\bLoadAnimation\b/i,
	/\bGetPlayingAnimationTracks\b/i,
	/\bHat\b/i,
	/\bHopper\b/i,
	/\bHopperBin\b/i,
]

const incorrectAPI = [
	/\bFindFirst\w*\s*\([^\)]*\)\s*[:.]/i,
	/Instance\.new\s*\(\s*[^,]+,\s*[^)]+\s*\)/i,
	/\bPromptProductPurchaseFinished\b/i,
]

//strippedInput.split("\n").filter((line) => possibleDeprecated.some((regex) => regex.test(line))
const outputFilter = (input: string, list: RegExp[]) =>
	input.split("\n").filter((line) => list.some((regex) => regex.test(line)))

export { definitiveDeprecated, incorrectAPI, outputFilter, possibleDeprecated }
