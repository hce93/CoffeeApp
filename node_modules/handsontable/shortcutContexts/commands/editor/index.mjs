import { command as closeAndSave } from "./closeAndSave.mjs";
import { command as closeWithoutSaving } from "./closeWithoutSaving.mjs";
import { command as fastOpen } from "./fastOpen.mjs";
import { command as open } from "./open.mjs";
/**
 * Returns complete list of the shortcut commands for the cells editing feature.
 *
 * @returns {Function[]}
 */
export function getAllCommands() {
  return [closeAndSave, closeWithoutSaving, fastOpen, open];
}