import { useMutation } from "@tanstack/react-query";

import { importerService } from "../services/importer.service";
import type { ImportImagePayload } from "../types/importer.type";

export function useImportImage() {
  return useMutation({
    mutationFn: ({
      signal,
      ...payload
    }: ImportImagePayload & { signal?: AbortSignal }) =>
      importerService.importImage(payload, signal),
  });
}
