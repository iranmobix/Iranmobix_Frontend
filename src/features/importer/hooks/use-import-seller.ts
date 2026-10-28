import { useMutation } from "@tanstack/react-query";

import { importerService } from "../services/importer.service";

export function useImportSeller() {
  return useMutation({
    mutationFn: importerService.importSeller,
  });
}